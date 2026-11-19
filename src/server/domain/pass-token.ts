import { randomInt } from "node:crypto";
import type { Status } from "@/components/ui/status-badge";

/** 6-digit numeric entry code, stored in plaintext (resident choice — see the code field's
 * comment in access.prisma for why this deviates from the usual hash-only token). Zero-padded,
 * so it always reads/types as exactly 6 digits. */
export function generatePassCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** PassStatus (ACTIVE/REDEEMED/REVOKED) + expiresAt -> the UI's derived status. "Expired" is
 * never stored — a pass stays ACTIVE in the database until its window passes. */
export function derivePassStatus(
  pass: { status: "ACTIVE" | "REDEEMED" | "REVOKED"; expiresAt: Date },
  now: Date,
): Status {
  if (pass.status === "REVOKED") return "revoked";
  if (pass.status === "REDEEMED") return "used";
  if (pass.expiresAt <= now) return "expired";
  return "active";
}
