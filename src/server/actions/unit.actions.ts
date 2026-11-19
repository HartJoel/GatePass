"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createUnitSchema } from "@/lib/validation/unit.schema";
import {
  assignResident,
  createUnit,
  unassignResident,
} from "@/server/services/unit.service";
import { requireActor } from "@/server/authz/actor";
import { normalizeError } from "@/server/errors/to-result";
import type { ActionResult } from "@/lib/types";

export async function createUnitAction(
  estateId: string,
  companyId: string,
  input: unknown,
): Promise<ActionResult<{ unitId: string }>> {
  const parsed = createUnitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Check your details and try again.",
        requestId: randomUUID(),
      },
    };
  }

  try {
    const actor = await requireActor();
    const unit = await createUnit(actor, estateId, parsed.data);
    revalidatePath(`/companies/${companyId}/estates/${estateId}/units`);
    return { data: { unitId: unit.id } };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function assignResidentAction(
  estateId: string,
  companyId: string,
  unitId: string,
  membershipId: string,
): Promise<ActionResult<{ assigned: true }>> {
  try {
    const actor = await requireActor();
    await assignResident(actor, estateId, unitId, membershipId);
    revalidatePath(`/companies/${companyId}/estates/${estateId}/units`);
    return { data: { assigned: true } };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function unassignResidentAction(
  estateId: string,
  companyId: string,
  unitId: string,
  membershipId: string,
): Promise<ActionResult<{ assigned: false }>> {
  try {
    const actor = await requireActor();
    await unassignResident(actor, estateId, unitId, membershipId);
    revalidatePath(`/companies/${companyId}/estates/${estateId}/units`);
    return { data: { assigned: false } };
  } catch (err) {
    return normalizeError(err);
  }
}
