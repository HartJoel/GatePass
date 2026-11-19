import { randomBytes, createHash } from "node:crypto";

export const INVITE_VALID_DAYS = 7;

/** Raw token is returned once by the service for the "copy link" screen; only the hash is
 * stored. Never log or persist the raw value. */
export function generateInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(16).toString("base64url");
  return { token, tokenHash: hashInviteToken(token) };
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
