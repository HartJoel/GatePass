import "server-only";
import { db } from "@/server/db/client";
import { AppError } from "@/server/errors/app-error";
import { recordAudit } from "@/server/services/audit.service";
import type { Actor } from "@/server/authz/actor";
import type { CompanyStatus } from "@/generated/prisma/enums";

/** Platform admin is a flat, company-scoped-nowhere permission (not per-company/per-estate like
 * authorizeCompany/authorizeEstate) — PlatformAdmin rows exist only via seed, never an API
 * (gatepass-auth hard exclusion), so this is a simple boolean gate. */
function requirePlatformAdmin(actor: Actor): void {
  if (!actor.isPlatformAdmin) throw new AppError("FORBIDDEN", "You don’t have permission to do that.");
}

async function userCountsByCompany(companyIds: string[]): Promise<Map<string, number>> {
  if (companyIds.length === 0) return new Map();

  const [companyMemberships, estateMemberships] = await Promise.all([
    db.companyMembership.groupBy({ by: ["companyId"], where: { companyId: { in: companyIds } }, _count: true }),
    db.$queryRaw<{ companyId: string; count: bigint }[]>`
      SELECT e."companyId" AS "companyId", COUNT(em.id) AS count
      FROM estate_membership em
      JOIN estate e ON e.id = em."estateId"
      WHERE e."companyId" = ANY(${companyIds}::text[])
      GROUP BY e."companyId"
    `,
  ]);

  const counts = new Map<string, number>();
  for (const m of companyMemberships) counts.set(m.companyId, (counts.get(m.companyId) ?? 0) + m._count);
  for (const e of estateMemberships) counts.set(e.companyId, (counts.get(e.companyId) ?? 0) + Number(e.count));
  return counts;
}

export interface PlatformCompanyRow {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  status: CompanyStatus;
  createdAt: Date;
  estateCount: number;
  userCount: number;
}

export async function listPlatformCompanies(actor: Actor): Promise<PlatformCompanyRow[]> {
  requirePlatformAdmin(actor);

  const companies = await db.company.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      contactPhone: true,
      status: true,
      createdAt: true,
      _count: { select: { estates: true } },
    },
  });

  const counts = await userCountsByCompany(companies.map((c) => c.id));

  return companies.map((c) => ({
    id: c.id,
    name: c.name,
    contactEmail: c.contactEmail,
    contactPhone: c.contactPhone,
    status: c.status,
    createdAt: c.createdAt,
    estateCount: c._count.estates,
    userCount: counts.get(c.id) ?? 0,
  }));
}

export interface PlatformOverviewStats {
  companyCount: number;
  activeCompanyCount: number;
  suspendedCompanyCount: number;
  estateCount: number;
  liveEstateCount: number;
  recentCompanies: PlatformCompanyRow[];
}

export async function getPlatformOverview(actor: Actor): Promise<PlatformOverviewStats> {
  requirePlatformAdmin(actor);

  const [companyCount, activeCompanyCount, estateCount, liveEstateCount, recentCompanies] = await Promise.all([
    db.company.count(),
    db.company.count({ where: { status: "ACTIVE" } }),
    db.estate.count(),
    db.estate.count({ where: { status: "ACTIVE" } }),
    listPlatformCompanies(actor).then((rows) => rows.slice(0, 6)),
  ]);

  return {
    companyCount,
    activeCompanyCount,
    suspendedCompanyCount: companyCount - activeCompanyCount,
    estateCount,
    liveEstateCount,
    recentCompanies,
  };
}

export interface PlatformEstateRow {
  id: string;
  name: string;
  city: string | null;
  units: number;
  status: "ACTIVE" | "DEACTIVATED";
}

export interface PlatformCompanySuspension {
  reason: string;
  at: Date;
  by: string;
}

export interface PlatformCompanyDetail {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  status: CompanyStatus;
  createdAt: Date;
  userCount: number;
  estates: PlatformEstateRow[];
  suspension: PlatformCompanySuspension | null;
}

export async function getPlatformCompanyDetail(actor: Actor, companyId: string): Promise<PlatformCompanyDetail | null> {
  requirePlatformAdmin(actor);

  const company = await db.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      contactPhone: true,
      status: true,
      createdAt: true,
      estates: {
        select: { id: true, name: true, city: true, status: true, _count: { select: { units: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!company) return null;

  const [admin, counts] = await Promise.all([
    db.companyMembership.findFirst({ where: { companyId, role: "COMPANY_ADMIN" }, orderBy: { createdAt: "asc" } }),
    userCountsByCompany([companyId]),
  ]);

  let contactName = "—";
  if (admin) {
    const users = await db.$queryRaw<{ name: string }[]>`SELECT name FROM neon_auth."user" WHERE id = ${admin.userId}::uuid`;
    contactName = users[0]?.name ?? "—";
  }

  let suspension: PlatformCompanySuspension | null = null;
  if (company.status === "SUSPENDED") {
    const entry = await db.auditLog.findFirst({
      where: { companyId, action: "company.suspended" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, actorUserId: true, metadata: true },
    });
    if (entry) {
      const meta = (entry.metadata ?? {}) as Record<string, unknown>;
      let by = "Platform admin";
      if (entry.actorUserId) {
        const users = await db.$queryRaw<{ name: string }[]>`SELECT name FROM neon_auth."user" WHERE id = ${entry.actorUserId}::uuid`;
        by = users[0]?.name ?? by;
      }
      suspension = { reason: typeof meta.reason === "string" ? meta.reason : "No reason given.", at: entry.createdAt, by };
    }
  }

  return {
    id: company.id,
    name: company.name,
    contactName,
    contactEmail: company.contactEmail,
    contactPhone: company.contactPhone,
    status: company.status,
    createdAt: company.createdAt,
    userCount: counts.get(companyId) ?? 0,
    estates: company.estates.map((e) => ({ id: e.id, name: e.name, city: e.city, units: e._count.units, status: e.status })),
    suspension,
  };
}

export async function suspendCompany(actor: Actor, companyId: string, reason: string): Promise<void> {
  requirePlatformAdmin(actor);

  await db.$transaction(async (tx) => {
    const company = await tx.company.update({ where: { id: companyId }, data: { status: "SUSPENDED" } });

    await recordAudit(tx, actor.userId, {
      companyId,
      action: "company.suspended",
      entityType: "Company",
      entityId: companyId,
      metadata: { reason, companyName: company.name },
    });
  });
}

export async function reactivateCompany(actor: Actor, companyId: string): Promise<void> {
  requirePlatformAdmin(actor);

  await db.$transaction(async (tx) => {
    const company = await tx.company.update({ where: { id: companyId }, data: { status: "ACTIVE" } });

    await recordAudit(tx, actor.userId, {
      companyId,
      action: "company.reactivated",
      entityType: "Company",
      entityId: companyId,
      metadata: { companyName: company.name },
    });
  });
}
