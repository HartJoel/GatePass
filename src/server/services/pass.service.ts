import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db/client";
import { authorizeEstate } from "@/server/authz/policies";
import { AppError } from "@/server/errors/app-error";
import { derivePassStatus, generatePassCode } from "@/server/domain/pass-token";
import type { Actor } from "@/server/authz/actor";
import type { CreatePassInput } from "@/lib/validation/pass.schema";
import type { Status } from "@/components/ui/status-badge";

export interface PassRow {
  id: string;
  code: string;
  visitor: string;
  unit: string;
  start: Date;
  end: Date;
  status: Status;
}

const MAX_CODE_ATTEMPTS = 5;

/** Only unit a resident currently has an active ResidentAssignment to — passes can't be issued
 * for any other unit, even within the resident's own estate. */
export async function listMyUnits(
  actor: Actor,
  estateId: string,
): Promise<{ id: string; label: string }[]> {
  const access = authorizeEstate(actor, estateId, "create_pass");

  const assignments = await db.residentAssignment.findMany({
    where: { estateId, membershipId: access.membershipId!, endedAt: null },
    select: { unit: { select: { id: true, label: true } } },
    orderBy: { unit: { label: "asc" } },
  });
  return assignments.map((a) => a.unit);
}

export async function createPass(
  actor: Actor,
  estateId: string,
  input: CreatePassInput,
) {
  const access = authorizeEstate(actor, estateId, "create_pass");
  const membershipId = access.membershipId!;

  const assignment = await db.residentAssignment.findFirst({
    where: { estateId, unitId: input.unitId, membershipId, endedAt: null },
    select: { unit: { select: { label: true } } },
  });
  if (!assignment)
    throw new AppError("FORBIDDEN", "You are not assigned to that unit.");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.durationHours * 3_600_000);

  for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
    const code = generatePassCode();
    try {
      const pass = await db.visitorPass.create({
        data: {
          estateId,
          unitId: input.unitId,
          issuerId: membershipId,
          visitorName: input.visitorName.trim(),
          note: input.note?.trim() || null,
          code,
          validFrom: now,
          expiresAt,
        },
      });
      return {
        passId: pass.id,
        code: pass.code,
        visitor: pass.visitorName,
        unit: assignment.unit.label,
        start: pass.validFrom,
        end: pass.expiresAt,
      };
    } catch (err) {
      const isCodeCollision =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002";
      if (!isCodeCollision || attempt === MAX_CODE_ATTEMPTS) throw err;
    }
  }
  throw new AppError("INTERNAL", "Couldn’t generate a unique code. Try again.");
}

export async function listPasses(
  actor: Actor,
  estateId: string,
): Promise<PassRow[]> {
  const access = authorizeEstate(actor, estateId, "create_pass");
  const now = new Date();

  const passes = await db.visitorPass.findMany({
    where: { estateId, issuerId: access.membershipId! },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      visitorName: true,
      validFrom: true,
      expiresAt: true,
      status: true,
      unit: { select: { label: true } },
    },
  });

  return passes.map((p) => ({
    id: p.id,
    code: p.code,
    visitor: p.visitorName,
    unit: p.unit.label,
    start: p.validFrom,
    end: p.expiresAt,
    status: derivePassStatus(p, now),
  }));
}

export async function getPass(
  actor: Actor,
  estateId: string,
  passId: string,
): Promise<PassRow | null> {
  const access = authorizeEstate(actor, estateId, "create_pass");
  const now = new Date();

  const pass = await db.visitorPass.findUnique({
    where: { id_estateId: { id: passId, estateId } },
    select: {
      id: true,
      code: true,
      visitorName: true,
      validFrom: true,
      expiresAt: true,
      status: true,
      issuerId: true,
      unit: { select: { label: true } },
    },
  });
  if (!pass || pass.issuerId !== access.membershipId) return null;

  return {
    id: pass.id,
    code: pass.code,
    visitor: pass.visitorName,
    unit: pass.unit.label,
    start: pass.validFrom,
    end: pass.expiresAt,
    status: derivePassStatus(pass, now),
  };
}

export async function revokePass(
  actor: Actor,
  estateId: string,
  passId: string,
) {
  const access = authorizeEstate(actor, estateId, "create_pass");

  const pass = await db.visitorPass.findUnique({
    where: { id_estateId: { id: passId, estateId } },
    select: { id: true, issuerId: true },
  });
  if (!pass || pass.issuerId !== access.membershipId)
    throw new AppError("NOT_FOUND", "Not found.");

  const result = await db.visitorPass.updateMany({
    where: { id: pass.id, estateId, status: "ACTIVE" },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
      revokedByUserId: actor.userId,
    },
  });
  if (result.count === 0)
    throw new AppError("CONFLICT", "This pass can no longer be revoked.");

  return { passId: pass.id };
}
