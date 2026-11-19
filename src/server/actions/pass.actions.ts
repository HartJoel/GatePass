"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createPassSchema } from "@/lib/validation/pass.schema";
import { createPass, revokePass } from "@/server/services/pass.service";
import { requireActor } from "@/server/authz/actor";
import { normalizeError } from "@/server/errors/to-result";
import type { ActionResult } from "@/lib/types";

export async function createPassAction(
  estateId: string,
  input: unknown,
): Promise<ActionResult<{ passId: string; code: string; visitor: string; unit: string; start: Date; end: Date }>> {
  const parsed = createPassSchema.safeParse(input);
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
    const result = await createPass(actor, estateId, parsed.data);
    revalidatePath(`/resident/${estateId}/passes`);
    return { data: result };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function revokePassAction(
  estateId: string,
  passId: string,
): Promise<ActionResult<{ passId: string }>> {
  try {
    const actor = await requireActor();
    const result = await revokePass(actor, estateId, passId);
    revalidatePath(`/resident/${estateId}/passes`);
    revalidatePath(`/resident/${estateId}/passes/${passId}`);
    return { data: result };
  } catch (err) {
    return normalizeError(err);
  }
}
