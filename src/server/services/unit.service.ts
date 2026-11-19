import "server-only";
import { db } from "@/server/db/client";
import { authorizeEstate } from "@/server/authz/policies";
import { AppError } from "@/server/errors/app-error";
import type { Actor } from "@/server/authz/actor";
import type { CreateUnitInput } from "@/lib/validation/unit.schema";

export interface ResidentOption {
  membershipId: string;
  name: string;
  email: string;
}

export interface UnitRow {
  id: string;
  label: string;
  residents: ResidentOption[];
}

/** Batches names/emails for a set of EstateMembership ids from neon_auth.user — see the note
 * at the top of auth.prisma on why that's a raw read, never a Prisma relation. */
async function residentOptionsFor(membershipIds: string[]): Promise<Map<string, ResidentOption>> {
  if (membershipIds.length === 0) return new Map();

  const memberships = await db.estateMembership.findMany({
    where: { id: { in: membershipIds } },
    select: { id: true, userId: true },
  });
  const userIds = [...new Set(memberships.map((m) => m.userId))];
  const users = await db.$queryRaw<{ id: string; name: string; email: string }[]>`
    SELECT id, name, email FROM neon_auth."user" WHERE id = ANY(${userIds}::uuid[])
  `;
  const userById = new Map(users.map((u) => [u.id, u]));

  const byMembership = new Map<string, ResidentOption>();
  for (const m of memberships) {
    const u = userById.get(m.userId);
    byMembership.set(m.id, { membershipId: m.id, name: u?.name ?? m.userId, email: u?.email ?? "" });
  }
  return byMembership;
}

export async function listUnits(actor: Actor, estateId: string): Promise<UnitRow[]> {
  authorizeEstate(actor, estateId, "manage_estate");

  const units = await db.residentialUnit.findMany({
    where: { estateId },
    orderBy: { label: "asc" },
    include: { assignments: { where: { endedAt: null }, select: { membershipId: true } } },
  });

  const membershipIds = [...new Set(units.flatMap((u) => u.assignments.map((a) => a.membershipId)))];
  const optionsByMembership = await residentOptionsFor(membershipIds);

  return units.map((u) => ({
    id: u.id,
    label: u.label,
    residents: u.assignments
      .map((a) => optionsByMembership.get(a.membershipId))
      .filter((r): r is ResidentOption => !!r),
  }));
}

/** Active residents of the estate, for the "assign to a unit" picker. */
export async function listResidentMembers(actor: Actor, estateId: string): Promise<ResidentOption[]> {
  authorizeEstate(actor, estateId, "manage_estate");

  const memberships = await db.estateMembership.findMany({
    where: { estateId, role: "RESIDENT", status: "ACTIVE" },
  });
  const optionsByMembership = await residentOptionsFor(memberships.map((m) => m.id));
  return memberships.map((m) => optionsByMembership.get(m.id) ?? { membershipId: m.id, name: m.userId, email: "" });
}

/** No unit DELETE/edit per the architecture skill's route rules — units can only be added. */
export async function createUnit(actor: Actor, estateId: string, input: CreateUnitInput) {
  authorizeEstate(actor, estateId, "manage_estate");

  const label = input.label.trim();
  const existing = await db.residentialUnit.findUnique({ where: { estateId_label: { estateId, label } } });
  if (existing) throw new AppError("CONFLICT", "A unit with this label already exists.");

  return db.residentialUnit.create({ data: { estateId, label } });
}

export async function assignResident(actor: Actor, estateId: string, unitId: string, membershipId: string) {
  authorizeEstate(actor, estateId, "manage_estate");

  const [unit, membership] = await Promise.all([
    db.residentialUnit.findUnique({ where: { id_estateId: { id: unitId, estateId } } }),
    db.estateMembership.findUnique({ where: { id_estateId: { id: membershipId, estateId } } }),
  ]);
  if (!unit || !membership) throw new AppError("NOT_FOUND", "Not found.");
  if (membership.role !== "RESIDENT") throw new AppError("VALIDATION_ERROR", "Only residents can be assigned to a unit.");
  if (membership.status !== "ACTIVE") throw new AppError("FORBIDDEN", "This resident’s access has been deactivated.");

  return db.residentAssignment.upsert({
    where: { membershipId_unitId: { membershipId, unitId } },
    create: { estateId, unitId, membershipId },
    update: { endedAt: null },
  });
}

/** Ends the assignment rather than deleting it — ResidentAssignment is kept as history. */
export async function unassignResident(actor: Actor, estateId: string, unitId: string, membershipId: string) {
  authorizeEstate(actor, estateId, "manage_estate");

  const assignment = await db.residentAssignment.findUnique({
    where: { membershipId_unitId: { membershipId, unitId } },
  });
  if (!assignment || assignment.estateId !== estateId) throw new AppError("NOT_FOUND", "Not found.");
  if (assignment.endedAt) return assignment;

  return db.residentAssignment.update({ where: { id: assignment.id }, data: { endedAt: new Date() } });
}
