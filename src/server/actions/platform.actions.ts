"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { suspendCompanySchema } from "@/lib/validation/platform.schema";
import { reactivateCompany, suspendCompany } from "@/server/services/platform.service";
import { requireActor } from "@/server/authz/actor";
import { normalizeError } from "@/server/errors/to-result";
import type { ActionResult } from "@/lib/types";

export async function suspendCompanyAction(
  companyId: string,
  input: unknown,
): Promise<ActionResult<{ companyId: string }>> {
  const parsed = suspendCompanySchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Enter a reason.",
        requestId: randomUUID(),
      },
    };
  }

  try {
    const actor = await requireActor();
    await suspendCompany(actor, companyId, parsed.data.reason);
    revalidatePath("/platform/companies");
    revalidatePath(`/platform/companies/${companyId}`);
    return { data: { companyId } };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function reactivateCompanyAction(
  companyId: string,
): Promise<ActionResult<{ companyId: string }>> {
  try {
    const actor = await requireActor();
    await reactivateCompany(actor, companyId);
    revalidatePath("/platform/companies");
    revalidatePath(`/platform/companies/${companyId}`);
    return { data: { companyId } };
  } catch (err) {
    return normalizeError(err);
  }
}
