import "server-only";
import { db } from "@/server/db/client";
import { authorizeEstate } from "@/server/authz/policies";
import { deriveRejectionReason, REJECTION_MESSAGE } from "@/server/domain/gate";
import type { Actor } from "@/server/authz/actor";
import type { DecideInput } from "@/lib/validation/gate.schema";
import type { RejectionReason } from "@/generated/prisma/enums";

export interface GatePassPeek {
  visitorName: string;
  unitLabel: string;
  note: string | null;
  validFrom: Date;
  expiresAt: Date;
}

export type VerifyResult =
  | { outcome: "VALID"; pass: GatePassPeek }
  | {
      outcome: "REJECTED";
      reason: RejectionReason;
      message: string;
      eventId: string;
    };

/** Read-only for a valid pass: records nothing, changes nothing. An invalid code (including one
 * belonging to another estate — it must look identical to an unknown one) records a REJECTED
 * event immediately, before the guard ever gets to decide. */
export async function verifyCode(
  actor: Actor,
  estateId: string,
  code: string,
): Promise<VerifyResult> {
  const access = authorizeEstate(actor, estateId, "operate_gate");
  const guardId = access.membershipId!;
  const now = new Date();

  const pass = await db.visitorPass.findFirst({
    where: { code, estateId },
    select: {
      id: true,
      status: true,
      validFrom: true,
      expiresAt: true,
      visitorName: true,
      note: true,
      unit: { select: { label: true } },
    },
  });

  if (!pass) {
    const event = await db.accessEvent.create({
      data: { estateId, guardId, decision: "REJECTED", reason: "NOT_FOUND" },
    });
    return {
      outcome: "REJECTED",
      reason: "NOT_FOUND",
      message: REJECTION_MESSAGE.NOT_FOUND,
      eventId: event.id,
    };
  }

  const reason = deriveRejectionReason(pass, now);
  if (reason) {
    const event = await db.accessEvent.create({
      data: {
        estateId,
        guardId,
        passId: pass.id,
        decision: "REJECTED",
        reason,
      },
    });
    return {
      outcome: "REJECTED",
      reason,
      message: REJECTION_MESSAGE[reason],
      eventId: event.id,
    };
  }

  return {
    outcome: "VALID",
    pass: {
      visitorName: pass.visitorName,
      unitLabel: pass.unit.label,
      note: pass.note,
      validFrom: pass.validFrom,
      expiresAt: pass.expiresAt,
    },
  };
}

export interface DecideResult {
  outcome: "APPROVED" | "REJECTED";
  reason?: RejectionReason;
  eventId: string;
  replayed: boolean;
}

/** APPROVE = atomic redemption via a conditional updateMany inside one transaction; a race loser
 * re-reads the row and records an ordinary ALREADY_USED rejection. REJECT never touches the
 * pass. Idempotent on (guardId, clientRequestId) — a retried request returns the stored outcome
 * instead of creating a second event. */
export async function decide(
  actor: Actor,
  estateId: string,
  input: DecideInput,
): Promise<DecideResult> {
  const access = authorizeEstate(actor, estateId, "operate_gate");
  const guardId = access.membershipId!;

  const existing = await db.accessEvent.findUnique({
    where: {
      guardId_clientRequestId: {
        guardId,
        clientRequestId: input.clientRequestId,
      },
    },
  });
  if (existing) {
    return {
      outcome: existing.decision === "APPROVED" ? "APPROVED" : "REJECTED",
      reason: existing.reason ?? undefined,
      eventId: existing.id,
      replayed: true,
    };
  }

  return db.$transaction(async (tx) => {
    const pass = await tx.visitorPass.findFirst({
      where: { code: input.code, estateId },
      select: {
        id: true,
        status: true,
        validFrom: true,
        expiresAt: true,
        issuer: { select: { userId: true } },
      },
    });

    if (input.decision === "REJECT") {
      const event = await tx.accessEvent.create({
        data: {
          estateId,
          guardId,
          passId: pass?.id ?? null,
          decision: "REJECTED",
          reason: "GUARD_REJECTED",
          note: input.note,
          clientRequestId: input.clientRequestId,
        },
      });
      if (pass)
        await tx.notification.create({
          data: {
            userId: pass.issuer.userId,
            estateId,
            accessEventId: event.id,
          },
        });
      return {
        outcome: "REJECTED" as const,
        reason: "GUARD_REJECTED" as const,
        eventId: event.id,
        replayed: false,
      };
    }

    if (!pass) {
      const event = await tx.accessEvent.create({
        data: {
          estateId,
          guardId,
          decision: "REJECTED",
          reason: "NOT_FOUND",
          clientRequestId: input.clientRequestId,
        },
      });
      return {
        outcome: "REJECTED" as const,
        reason: "NOT_FOUND" as const,
        eventId: event.id,
        replayed: false,
      };
    }

    const now = new Date();
    const claimed = await tx.visitorPass.updateMany({
      where: {
        id: pass.id,
        estateId,
        status: "ACTIVE",
        validFrom: { lte: now },
        expiresAt: { gt: now },
      },
      data: { status: "REDEEMED", redeemedAt: now, redeemedById: guardId },
    });

    if (claimed.count === 1) {
      const event = await tx.accessEvent.create({
        data: {
          estateId,
          guardId,
          passId: pass.id,
          decision: "APPROVED",
          clientRequestId: input.clientRequestId,
        },
      });
      await tx.notification.create({
        data: { userId: pass.issuer.userId, estateId, accessEventId: event.id },
      });
      return {
        outcome: "APPROVED" as const,
        eventId: event.id,
        replayed: false,
      };
    }

    const fresh = await tx.visitorPass.findUniqueOrThrow({
      where: { id: pass.id },
      select: { status: true, validFrom: true, expiresAt: true },
    });
    const reason = deriveRejectionReason(fresh, now) ?? "ALREADY_USED";
    const event = await tx.accessEvent.create({
      data: {
        estateId,
        guardId,
        passId: pass.id,
        decision: "REJECTED",
        reason,
        clientRequestId: input.clientRequestId,
      },
    });
    await tx.notification.create({
      data: { userId: pass.issuer.userId, estateId, accessEventId: event.id },
    });
    return {
      outcome: "REJECTED" as const,
      reason,
      eventId: event.id,
      replayed: false,
    };
  });
}

export interface AccessEventRow {
  id: string;
  visitor: string | null;
  unit: string | null;
  decision: "approved" | "rejected";
  at: Date;
}

/** The guard's own decisions in the last 24h — matches the "access:read:recent" permission
 * (guard-only; broader estate-wide access log/filters are slice F, not this one). */
export async function listRecentAccessEvents(
  actor: Actor,
  estateId: string,
): Promise<AccessEventRow[]> {
  const access = authorizeEstate(actor, estateId, "operate_gate");
  const since = new Date(Date.now() - 24 * 3_600_000);

  const events = await db.accessEvent.findMany({
    where: {
      estateId,
      guardId: access.membershipId!,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      decision: true,
      createdAt: true,
      pass: {
        select: { visitorName: true, unit: { select: { label: true } } },
      },
    },
  });

  return events.map((e) => ({
    id: e.id,
    visitor: e.pass?.visitorName ?? null,
    unit: e.pass?.unit.label ?? null,
    decision: e.decision === "APPROVED" ? "approved" : "rejected",
    at: e.createdAt,
  }));
}
