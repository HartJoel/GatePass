import "server-only";
import { db } from "@/server/db/client";
import { AppError } from "@/server/errors/app-error";
import type { Actor } from "@/server/authz/actor";
import type { RejectionReason } from "@/generated/prisma/enums";

export interface NotificationRow {
  id: string;
  passId: string | null;
  decision: "approved" | "rejected";
  reason: RejectionReason | null;
  visitor: string | null;
  unit: string | null;
  readAt: Date | null;
  createdAt: Date;
}

/** Scoped by userId === actor.userId only — "own notifications" needs no role check, per the
 * gatepass-auth permission matrix (every role gets their own, nothing more). */
export async function listNotifications(
  actor: Actor,
  estateId: string,
): Promise<NotificationRow[]> {
  const notifications = await db.notification.findMany({
    where: { userId: actor.userId, estateId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      readAt: true,
      createdAt: true,
      accessEvent: {
        select: {
          decision: true,
          reason: true,
          passId: true,
          pass: {
            select: { visitorName: true, unit: { select: { label: true } } },
          },
        },
      },
    },
  });

  return notifications.map((n) => ({
    id: n.id,
    passId: n.accessEvent.passId,
    decision: n.accessEvent.decision === "APPROVED" ? "approved" : "rejected",
    reason: n.accessEvent.reason,
    visitor: n.accessEvent.pass?.visitorName ?? null,
    unit: n.accessEvent.pass?.unit.label ?? null,
    readAt: n.readAt,
    createdAt: n.createdAt,
  }));
}

export async function countUnreadNotifications(
  actor: Actor,
  estateId: string,
): Promise<number> {
  return db.notification.count({
    where: { userId: actor.userId, estateId, readAt: null },
  });
}

export async function markNotificationRead(
  actor: Actor,
  notificationId: string,
) {
  const result = await db.notification.updateMany({
    where: { id: notificationId, userId: actor.userId, readAt: null },
    data: { readAt: new Date() },
  });
  if (result.count === 0) {
    const exists = await db.notification.findFirst({
      where: { id: notificationId, userId: actor.userId },
    });
    if (!exists) throw new AppError("NOT_FOUND", "Not found.");
  }
}

export async function markAllNotificationsRead(actor: Actor, estateId: string) {
  await db.notification.updateMany({
    where: { userId: actor.userId, estateId, readAt: null },
    data: { readAt: new Date() },
  });
}
