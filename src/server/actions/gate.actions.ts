"use server";

import { randomUUID } from "node:crypto";
import { decideSchema, verifyCodeSchema } from "@/lib/validation/gate.schema";
import { decide, verifyCode, type DecideResult, type VerifyResult } from "@/server/services/gate.service";
import { requireActor } from "@/server/authz/actor";
import { normalizeError } from "@/server/errors/to-result";
import type { ActionResult } from "@/lib/types";

export async function verifyCodeAction(estateId: string, input: unknown): Promise<ActionResult<VerifyResult>> {
  const parsed = verifyCodeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Enter the visitor code.",
        requestId: randomUUID(),
      },
    };
  }

  try {
    const actor = await requireActor();
    const result = await verifyCode(actor, estateId, parsed.data.code);
    return { data: result };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function decideAction(estateId: string, input: unknown): Promise<ActionResult<DecideResult>> {
  const parsed = decideSchema.safeParse(input);
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
    const result = await decide(actor, estateId, parsed.data);
    return { data: result };
  } catch (err) {
    return normalizeError(err);
  }
}
