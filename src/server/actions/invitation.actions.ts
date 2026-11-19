"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import {
  acceptInvitationSchema,
  inviteMemberSchema,
} from "@/lib/validation/invitation.schema";
import {
  acceptInvitation,
  inviteMember,
  resendInvitation,
  revokeInvitation,
} from "@/server/services/invitation.service";
import { requireActor } from "@/server/authz/actor";
import { normalizeError } from "@/server/errors/to-result";
import type { ActionResult } from "@/lib/types";

function validationError(message: string): ActionResult<never> {
  return {
    error: { code: "VALIDATION_ERROR", message, requestId: randomUUID() },
  };
}

export async function inviteMemberAction(
  companyId: string,
  input: unknown,
): Promise<
  ActionResult<{ invitationId: string; token: string; expiresAt: Date }>
> {
  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success)
    return validationError(
      parsed.error.issues[0]?.message ?? "Check your details and try again.",
    );

  try {
    const actor = await requireActor();
    const result = await inviteMember(actor, companyId, parsed.data);
    revalidatePath(`/companies/${companyId}/members/invites`);
    return { data: result };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function resendInvitationAction(
  companyId: string,
  invitationId: string,
): Promise<
  ActionResult<{ invitationId: string; token: string; expiresAt: Date }>
> {
  try {
    const actor = await requireActor();
    const result = await resendInvitation(actor, companyId, invitationId);
    revalidatePath(`/companies/${companyId}/members/invites`);
    return { data: result };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function cancelInvitationAction(
  companyId: string,
  invitationId: string,
): Promise<ActionResult<{ invitationId: string }>> {
  try {
    const actor = await requireActor();
    const invitation = await revokeInvitation(actor, companyId, invitationId);
    revalidatePath(`/companies/${companyId}/members/invites`);
    return { data: { invitationId: invitation.id } };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function acceptInvitationAction(
  input: unknown,
): Promise<ActionResult<{ estateId: string | null; companyId: string }>> {
  const parsed = acceptInvitationSchema.safeParse(input);
  if (!parsed.success)
    return validationError(
      parsed.error.issues[0]?.message ?? "Check your details and try again.",
    );

  try {
    const result = await acceptInvitation(parsed.data);
    return { data: result };
  } catch (err) {
    return normalizeError(err);
  }
}
