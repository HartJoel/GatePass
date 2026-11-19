"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { saveEstateSchema } from "@/lib/validation/estate.schema";
import { createEstate, updateEstate } from "@/server/services/estate.service";
import { requireActor } from "@/server/authz/actor";
import { normalizeError } from "@/server/errors/to-result";
import type { ActionResult } from "@/lib/types";

function parseOrError(input: unknown) {
  return saveEstateSchema.safeParse(input);
}

export async function createEstateAction(
  companyId: string,
  input: unknown,
): Promise<ActionResult<{ estateId: string }>> {
  const parsed = parseOrError(input);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message:
          parsed.error.issues[0]?.message ??
          "Check your details and try again.",
        requestId: randomUUID(),
      },
    };
  }

  try {
    const actor = await requireActor();
    const estate = await createEstate(actor, companyId, parsed.data);
    revalidatePath(`/companies/${companyId}/estates`);
    return { data: { estateId: estate.id } };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function updateEstateAction(
  estateId: string,
  companyId: string,
  input: unknown,
): Promise<ActionResult<{ estateId: string }>> {
  const parsed = parseOrError(input);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message:
          parsed.error.issues[0]?.message ??
          "Check your details and try again.",
        requestId: randomUUID(),
      },
    };
  }

  try {
    const actor = await requireActor();
    const estate = await updateEstate(actor, estateId, parsed.data);
    revalidatePath(`/companies/${companyId}/estates`);
    revalidatePath(`/companies/${companyId}/estates/${estateId}`);
    return { data: { estateId: estate.id } };
  } catch (err) {
    return normalizeError(err);
  }
}
