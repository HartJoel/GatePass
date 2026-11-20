import "server-only";
import { db } from "@/server/db/client";
import { Prisma } from "@/generated/prisma/client";
import { authorizeCompany } from "@/server/authz/policies";
import type { Actor } from "@/server/authz/actor";

export interface RecordAuditInput {
  companyId: string;
  estateId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/** AuditLog = who changed the system (invites, deactivations, revocations, suspensions) — distinct
 * from AccessEvent, what happened at the gate (gatepass-database skill). Call inside the same
 * transaction as the write being audited. Takes a raw userId rather than a full Actor since some
 * callers (acceptInvitation) act before an Actor can be built; pass null for a system action with
 * no human actor. Action strings are dotted, e.g. "pass.revoked". */
export async function recordAudit(
  tx: Prisma.TransactionClient,
  actorUserId: string | null,
  input: RecordAuditInput,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      companyId: input.companyId,
      estateId: input.estateId,
      actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export interface AuditLogRow {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: Date;
}

const ACTION_LABEL: Record<string, string> = {
  "invite.created": "Invited member",
  "invite.revoked": "Cancelled invite",
  "invite.accepted": "Joined",
  "estate.deactivated": "Deactivated estate",
  "estate.reactivated": "Reactivated estate",
  "pass.revoked": "Revoked visitor pass",
  "company.suspended": "Suspended company",
  "company.reactivated": "Reactivated company",
};

function targetFor(action: string, metadata: unknown): string {
  const m = (metadata ?? {}) as Record<string, unknown>;
  switch (action) {
    case "invite.created":
    case "invite.revoked":
    case "invite.accepted":
      return [m.email, m.role].filter(Boolean).join(" · ") || "—";
    case "estate.deactivated":
    case "estate.reactivated":
      return typeof m.estateName === "string" ? m.estateName : "—";
    case "pass.revoked":
      return [m.visitorName, m.unitLabel].filter(Boolean).join(" · ") || "—";
    case "company.suspended":
    case "company.reactivated":
      return typeof m.companyName === "string" ? m.companyName : "—";
    default:
      return "—";
  }
}

/** Company-admin-scoped for now, matching listMembers/listInvitations — an estate manager's own
 * estate-scoped view is a later addition once that area exists. */
export async function listAuditLog(actor: Actor, companyId: string): Promise<AuditLogRow[]> {
  authorizeCompany(actor, companyId, "manage_company");

  const entries = await db.auditLog.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, actorUserId: true, action: true, metadata: true, createdAt: true },
  });

  const userIds = [...new Set(entries.map((e) => e.actorUserId).filter((id): id is string => !!id))];
  const users = userIds.length
    ? await db.$queryRaw<{ id: string; name: string }[]>`SELECT id, name FROM neon_auth."user" WHERE id = ANY(${userIds}::uuid[])`
    : [];
  const nameByUserId = new Map(users.map((u) => [u.id, u.name]));

  return entries.map((e) => ({
    id: e.id,
    actor: e.actorUserId ? nameByUserId.get(e.actorUserId) ?? "Unknown" : "System",
    action: ACTION_LABEL[e.action] ?? e.action,
    target: targetFor(e.action, e.metadata),
    at: e.createdAt,
  }));
}
