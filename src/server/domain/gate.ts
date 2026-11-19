import type { PassStatus, RejectionReason } from "@/generated/prisma/enums";

export const REJECTION_MESSAGE: Record<RejectionReason, string> = {
  NOT_FOUND: "No pass matches that code. Check it with the visitor and try again.",
  NOT_YET_VALID: "This pass isn’t valid yet.",
  EXPIRED: "This pass has expired.",
  REVOKED: "This pass was revoked and can’t be used.",
  ALREADY_USED: "This pass has already been used.",
  GUARD_REJECTED: "Entry was rejected.",
};

/** A pass that exists but can't be used right now — never NOT_FOUND (caller already knows the
 * row exists) or null (a valid, usable pass has no rejection reason). */
export function deriveRejectionReason(
  pass: { status: PassStatus; validFrom: Date; expiresAt: Date },
  now: Date,
): RejectionReason | null {
  if (pass.status === "REVOKED") return "REVOKED";
  if (pass.status === "REDEEMED") return "ALREADY_USED";
  if (now < pass.validFrom) return "NOT_YET_VALID";
  if (now >= pass.expiresAt) return "EXPIRED";
  return null;
}
