import "server-only";
import { db } from "@/server/db/client";
import { authorizeEstate } from "@/server/authz/policies";
import type { Actor } from "@/server/authz/actor";
import type { RejectionReason } from "@/generated/prisma/enums";

export interface AccessLogRow {
  id: string;
  visitor: string | null;
  unit: string | null;
  guard: string;
  decision: "approved" | "rejected";
  reason: RejectionReason | null;
  note: string | null;
  at: Date;
}

export interface AccessLogFilters {
  decision?: "APPROVED" | "REJECTED";
  /** Lookback window in days; omit for all time. */
  days?: number;
}

/** CA/EM-wide view of an estate's access events — unlike the guard's own last-24h history
 * (gate.service.ts), this sees every guard's decisions, with filters. */
export async function listAccessLog(actor: Actor, estateId: string, filters: AccessLogFilters): Promise<AccessLogRow[]> {
  authorizeEstate(actor, estateId, "manage_estate");

  const events = await db.accessEvent.findMany({
    where: {
      estateId,
      ...(filters.decision && { decision: filters.decision }),
      ...(filters.days && { createdAt: { gte: new Date(Date.now() - filters.days * 86_400_000) } }),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      decision: true,
      reason: true,
      note: true,
      createdAt: true,
      guardId: true,
      pass: { select: { visitorName: true, unit: { select: { label: true } } } },
    },
  });

  const guardMembershipIds = [...new Set(events.map((e) => e.guardId))];
  const memberships = guardMembershipIds.length
    ? await db.estateMembership.findMany({ where: { id: { in: guardMembershipIds } }, select: { id: true, userId: true } })
    : [];
  const userIds = [...new Set(memberships.map((m) => m.userId))];
  const users = userIds.length
    ? await db.$queryRaw<{ id: string; name: string }[]>`SELECT id, name FROM neon_auth."user" WHERE id = ANY(${userIds}::uuid[])`
    : [];
  const nameByUserId = new Map(users.map((u) => [u.id, u.name]));
  const nameByMembership = new Map(memberships.map((m) => [m.id, nameByUserId.get(m.userId) ?? "Unknown guard"]));

  return events.map((e) => ({
    id: e.id,
    visitor: e.pass?.visitorName ?? null,
    unit: e.pass?.unit.label ?? null,
    guard: nameByMembership.get(e.guardId) ?? "Unknown guard",
    decision: e.decision === "APPROVED" ? "approved" : "rejected",
    reason: e.reason,
    note: e.note,
    at: e.createdAt,
  }));
}
