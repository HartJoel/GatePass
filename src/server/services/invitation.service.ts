import "server-only";
import { db } from "@/server/db/client";
import { auth } from "@/server/auth/auth";
import { authorizeCompany, authorizeEstate } from "@/server/authz/policies";
import { AppError } from "@/server/errors/app-error";
import { recordAudit } from "@/server/services/audit.service";
import {
  generateInviteToken,
  hashInviteToken,
  INVITE_VALID_DAYS,
} from "@/server/domain/invite-token";
import type { Actor } from "@/server/authz/actor";
import type {
  AcceptInvitationInput,
  InviteMemberInput,
  InviteRoleValue,
} from "@/lib/validation/invitation.schema";
import type { EstateRole } from "@/generated/prisma/enums";

const DAY_MS = 86_400_000;

const ROLE_LABEL: Record<InviteRoleValue, string> = {
  COMPANY_ADMIN: "Company admin",
  MANAGER: "Estate manager",
  RESIDENT: "Resident",
  GUARD: "Guard",
};

/**
 * Who may invite whom (see gatepass-auth permission matrix): a company admin may invite
 * company admins or managers; a manager may invite residents/guards for their own estate (and
 * a company admin inherits that too, via authorizeEstate).
 */
export async function inviteMember(
  actor: Actor,
  companyId: string,
  input: InviteMemberInput,
) {
  const email = input.email.trim().toLowerCase();

  if (input.role === "COMPANY_ADMIN") {
    authorizeCompany(actor, companyId, "manage_company");
  } else if (input.role === "MANAGER") {
    if (!input.estateId)
      throw new AppError("VALIDATION_ERROR", "Choose an estate for this role.");
    authorizeCompany(actor, companyId, "manage_company");
  } else {
    if (!input.estateId)
      throw new AppError("VALIDATION_ERROR", "Choose an estate for this role.");
    authorizeEstate(actor, input.estateId, "manage_estate");
  }

  const estateId = input.role === "COMPANY_ADMIN" ? null : input.estateId!;

  if (estateId) {
    const estate = await db.estate.findUnique({
      where: { id_companyId: { id: estateId, companyId } },
    });
    if (!estate) throw new AppError("NOT_FOUND", "Not found.");
  }

  const existingUser = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM neon_auth."user" WHERE email = ${email}
  `;
  if (existingUser.length) {
    const already = estateId
      ? await db.estateMembership.findUnique({
          where: { estateId_userId: { estateId, userId: existingUser[0].id } },
        })
      : await db.companyMembership.findUnique({
          where: { companyId_userId: { companyId, userId: existingUser[0].id } },
        });
    if (already) throw new AppError("CONFLICT", "This person is already a member.");
  }

  const pending = await db.invitation.findFirst({
    where: {
      companyId,
      email,
      estateId,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (pending)
    throw new AppError(
      "CONFLICT",
      "This person already has a pending invite. Resend it from Pending invites.",
    );

  const { token, tokenHash } = generateInviteToken();
  const invitation = await db.$transaction(async (tx) => {
    const invitation = await tx.invitation.create({
      data: {
        companyId,
        estateId,
        email,
        role: input.role,
        tokenHash,
        expiresAt: new Date(Date.now() + INVITE_VALID_DAYS * DAY_MS),
        invitedByUserId: actor.userId,
      },
    });

    await recordAudit(tx, actor.userId, {
      companyId,
      estateId: estateId ?? undefined,
      action: "invite.created",
      entityType: "Invitation",
      entityId: invitation.id,
      metadata: { email, role: ROLE_LABEL[input.role] },
    });

    return invitation;
  });

  return { invitationId: invitation.id, token, expiresAt: invitation.expiresAt };
}

/** Company-admin-scoped for now; estate managers get their own estate-scoped invite view once
 * that area exists (no UI for it yet). */
export async function listInvitations(actor: Actor, companyId: string) {
  authorizeCompany(actor, companyId, "manage_company");

  return db.invitation.findMany({
    where: { companyId, acceptedAt: null, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      estateId: true,
      createdAt: true,
      expiresAt: true,
    },
  });
}

export async function resendInvitation(
  actor: Actor,
  companyId: string,
  invitationId: string,
) {
  authorizeCompany(actor, companyId, "manage_company");

  const invitation = await db.invitation.findUnique({ where: { id: invitationId } });
  if (!invitation || invitation.companyId !== companyId)
    throw new AppError("NOT_FOUND", "Not found.");
  if (invitation.acceptedAt || invitation.revokedAt)
    throw new AppError("CONFLICT", "This invite is no longer active.");

  const { token, tokenHash } = generateInviteToken();
  const updated = await db.invitation.update({
    where: { id: invitationId },
    data: { tokenHash, expiresAt: new Date(Date.now() + INVITE_VALID_DAYS * DAY_MS) },
  });

  return { invitationId: updated.id, token, expiresAt: updated.expiresAt };
}

export async function revokeInvitation(
  actor: Actor,
  companyId: string,
  invitationId: string,
) {
  authorizeCompany(actor, companyId, "manage_company");

  const invitation = await db.invitation.findUnique({ where: { id: invitationId } });
  if (!invitation || invitation.companyId !== companyId)
    throw new AppError("NOT_FOUND", "Not found.");
  if (invitation.acceptedAt)
    throw new AppError("CONFLICT", "This invite has already been accepted.");
  if (invitation.revokedAt) return invitation;

  return db.$transaction(async (tx) => {
    const updated = await tx.invitation.update({
      where: { id: invitationId },
      data: { revokedAt: new Date() },
    });

    await recordAudit(tx, actor.userId, {
      companyId,
      estateId: invitation.estateId ?? undefined,
      action: "invite.revoked",
      entityType: "Invitation",
      entityId: invitationId,
      metadata: { email: invitation.email, role: ROLE_LABEL[invitation.role] },
    });

    return updated;
  });
}

export type InvitationLookupStatus = "ready" | "invalid" | "expired" | "used";

export interface InvitationLookup {
  status: InvitationLookupStatus;
  company: string;
  estate: string;
  role: string;
  email: string;
}

/** Public lookup for the accept-invite page — a dead/expired/used link is a business outcome,
 * not an error (gatepass-code-patterns). */
export async function getInvitationByToken(token: string): Promise<InvitationLookup> {
  const tokenHash = hashInviteToken(token);
  const invitation = await db.invitation.findUnique({
    where: { tokenHash },
    include: { company: { select: { name: true } }, estate: { select: { name: true } } },
  });

  if (!invitation) return { status: "invalid", company: "", estate: "", role: "", email: "" };

  const details = {
    company: invitation.company.name,
    estate: invitation.estate?.name ?? "",
    role: ROLE_LABEL[invitation.role],
    email: invitation.email,
  };

  if (invitation.revokedAt) return { status: "invalid", ...details };
  if (invitation.acceptedAt) return { status: "used", ...details };
  if (invitation.expiresAt <= new Date()) return { status: "expired", ...details };
  return { status: "ready", ...details };
}

/** Public (no actor yet): creates the account if the invited email has none, or reuses the
 * current session if already signed in as the invited email. Membership (+ unit assignment for
 * residents) is created and the invite marked accepted in one transaction. */
export async function acceptInvitation(input: AcceptInvitationInput) {
  const tokenHash = hashInviteToken(input.token);
  const invitation = await db.invitation.findUnique({ where: { tokenHash } });
  if (!invitation || invitation.revokedAt)
    throw new AppError("NOT_FOUND", "This invite link isn’t valid.");
  if (invitation.acceptedAt)
    throw new AppError("CONFLICT", "This invite has already been used.");
  if (invitation.expiresAt <= new Date())
    throw new AppError("CONFLICT", "This invite has expired.");

  const { data: session } = await auth.getSession();
  let userId: string;

  if (session?.user) {
    if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new AppError(
        "FORBIDDEN",
        "Sign out and open this link again with the invited email.",
      );
    }
    userId = session.user.id;
  } else {
    const { data, error } = await auth.signUp.email({
      email: invitation.email,
      name: invitation.email.split("@")[0],
      password: input.password,
    });
    if (error || !data?.user) {
      throw new AppError(
        "CONFLICT",
        error?.message ??
          "An account already exists for this email. Sign in, then open this link again.",
      );
    }
    userId = data.user.id;
  }

  await db.$transaction(async (tx) => {
    if (!invitation.estateId) {
      await tx.companyMembership.upsert({
        where: { companyId_userId: { companyId: invitation.companyId, userId } },
        create: { companyId: invitation.companyId, userId, role: "COMPANY_ADMIN" },
        update: {},
      });
    } else {
      const membership = await tx.estateMembership.upsert({
        where: { estateId_userId: { estateId: invitation.estateId, userId } },
        // Only reachable with an estateId set when role is MANAGER/RESIDENT/GUARD — inviteMember
        // never creates an estate-scoped Invitation with role COMPANY_ADMIN.
        create: { estateId: invitation.estateId, userId, role: invitation.role as EstateRole },
        update: {},
      });

      if (invitation.role === "RESIDENT" && invitation.unitId) {
        await tx.residentAssignment.upsert({
          where: {
            membershipId_unitId: { membershipId: membership.id, unitId: invitation.unitId },
          },
          create: {
            estateId: invitation.estateId,
            unitId: invitation.unitId,
            membershipId: membership.id,
          },
          update: {},
        });
      }
    }

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    await recordAudit(tx, userId, {
      companyId: invitation.companyId,
      estateId: invitation.estateId ?? undefined,
      action: "invite.accepted",
      entityType: "Invitation",
      entityId: invitation.id,
      metadata: { email: invitation.email, role: ROLE_LABEL[invitation.role] },
    });
  });

  return { estateId: invitation.estateId, companyId: invitation.companyId };
}
