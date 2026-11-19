"use server";

import { revalidatePath } from "next/cache";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/services/notification.service";
import { requireActor } from "@/server/authz/actor";
import { normalizeError } from "@/server/errors/to-result";
import type { ActionResult } from "@/lib/types";

export async function markNotificationReadAction(
  estateId: string,
  notificationId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireActor();
    await markNotificationRead(actor, notificationId);
    revalidatePath(`/resident/${estateId}/notifications`);
    return { data: { id: notificationId } };
  } catch (err) {
    return normalizeError(err);
  }
}

export async function markAllNotificationsReadAction(
  estateId: string,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const actor = await requireActor();
    await markAllNotificationsRead(actor, estateId);
    revalidatePath(`/resident/${estateId}/notifications`);
    return { data: { ok: true } };
  } catch (err) {
    return normalizeError(err);
  }
}
