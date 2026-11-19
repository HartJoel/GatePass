import "server-only";
import { auth } from "@/server/auth/auth";
import { db } from "@/server/db/client";
import { authorizeCompany } from "@/server/authz/policies";
import { AppError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import type { Actor } from "@/server/authz/actor";
import type { RegisterCompanyInput } from "@/lib/validation/company.schema";
import type { CompanyRole, EstateRole, EstateStatus, MembershipStatus } from "@/generated/prisma/enums";

export interface RegisteredCompany {
  companyId: string;
  userId: string;
}

/**
 * Bootstrapping action: no actor exists yet, so there's nothing to authorize against (this is
 * the one service function in the project that doesn't start with an authorize* call).
 * Creates the Neon-managed user first, then the Company + COMPANY_ADMIN membership in one
 * transaction. If the transaction fails after the user was created, the user exists with no
 * company yet — TODO(next pass): have /dashboard detect that and offer to finish registration,
 * per the gatepass-auth skill, instead of just surfacing an error.
 */
export async function registerCompany(
  input: RegisterCompanyInput,
): Promise<RegisteredCompany> {
  const { data, error } = await auth.signUp.email({
    email: input.adminEmail,
    name: input.adminName,
    password: input.password,
  });

  if (error || !data?.user) {
    throw new AppError(
      "CONFLICT",
      error?.message ??
        "Could not create your account. The email may already be registered.",
    );
  }

  const userId = data.user.id;

  try {
    const company = await db.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: input.companyName, contactEmail: input.adminEmail },
      });
      await tx.companyMembership.create({
        data: { companyId: company.id, userId, role: "COMPANY_ADMIN" },
      });
      return company;
    });

    return { companyId: company.id, userId };
  } catch (err) {
    logger.error("company_registration_partial_failure", {
      userId,
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(
      "INTERNAL",
      "Your account was created, but we couldn’t finish setting up your company. Sign in and try again.",
    );
  }
}

export interface CompanyMemberRow {
  /** userId + role: a user who is somehow both a company admin and an estate member would
   * otherwise collide, since DataTable needs one unique id per row. */
  id: string;
  userId: string;
  name: string;
  email: string;
  role: CompanyRole | EstateRole;
  estateIds: string[] | "all";
  status: MembershipStatus;
}

/**
 * Names/emails live in neon_auth.user, not in our membership tables — read-only, unmodelled
 * raw query (see the note at the top of auth.prisma on why neon_auth is never a Prisma model).
 * Estate memberships are grouped by (userId, role) so one person managing several estates is
 * one row, matching how the members table displays them.
 */
export async function listMembers(actor: Actor, companyId: string): Promise<CompanyMemberRow[]> {
  authorizeCompany(actor, companyId, "manage_company");

  const [companyMemberships, estateMemberships] = await Promise.all([
    db.companyMembership.findMany({ where: { companyId } }),
    db.estateMembership.findMany({ where: { estate: { companyId } } }),
  ]);

  const userIds = [
    ...new Set([...companyMemberships.map((m) => m.userId), ...estateMemberships.map((m) => m.userId)]),
  ];
  if (userIds.length === 0) return [];

  const users = await db.$queryRaw<{ id: string; name: string; email: string }[]>`
    SELECT id, name, email FROM neon_auth."user" WHERE id = ANY(${userIds}::uuid[])
  `;
  const userById = new Map(users.map((u) => [u.id, u]));

  const rows: CompanyMemberRow[] = companyMemberships.map((m) => {
    const u = userById.get(m.userId);
    return { id: `${m.userId}:${m.role}`, userId: m.userId, name: u?.name ?? m.userId, email: u?.email ?? "", role: m.role, estateIds: "all", status: m.status };
  });

  const groups = new Map<string, { userId: string; role: EstateRole; estateIds: string[]; status: MembershipStatus }>();
  for (const m of estateMemberships) {
    const key = `${m.userId}:${m.role}`;
    const existing = groups.get(key);
    if (existing) {
      existing.estateIds.push(m.estateId);
      if (m.status === "DEACTIVATED") existing.status = "DEACTIVATED";
    } else {
      groups.set(key, { userId: m.userId, role: m.role, estateIds: [m.estateId], status: m.status });
    }
  }
  for (const g of groups.values()) {
    const u = userById.get(g.userId);
    rows.push({ id: `${g.userId}:${g.role}`, userId: g.userId, name: u?.name ?? g.userId, email: u?.email ?? "", role: g.role, estateIds: g.estateIds, status: g.status });
  }

  return rows;
}

export interface CompanyOverviewStats {
  estates: { id: string; name: string; city: string | null; status: EstateStatus }[];
  estateCount: number;
  activeEstateCount: number;
  unitCount: number;
  residentCount: number;
  passesThisWeek: number;
}

export async function getCompanyOverview(actor: Actor, companyId: string): Promise<CompanyOverviewStats> {
  authorizeCompany(actor, companyId, "manage_company");

  const estates = await db.estate.findMany({
    where: { companyId },
    select: { id: true, name: true, city: true, status: true },
    orderBy: { createdAt: "desc" },
  });
  const estateIds = estates.map((e) => e.id);

  const [unitCount, residentCount, passesThisWeek] = await Promise.all([
    db.residentialUnit.count({ where: { estateId: { in: estateIds } } }),
    db.estateMembership.count({ where: { estateId: { in: estateIds }, role: "RESIDENT", status: "ACTIVE" } }),
    db.visitorPass.count({ where: { estateId: { in: estateIds }, createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } } }),
  ]);

  return {
    estates,
    estateCount: estates.length,
    activeEstateCount: estates.filter((e) => e.status === "ACTIVE").length,
    unitCount,
    residentCount,
    passesThisWeek,
  };
}
