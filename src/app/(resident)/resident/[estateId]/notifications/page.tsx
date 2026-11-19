import type { Metadata } from "next";
import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { requireActor } from "@/server/authz/actor";
import { listNotifications } from "@/server/services/notification.service";

export const metadata: Metadata = { title: "Alerts · GatePass" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  params,
}: PageProps<"/resident/[estateId]/notifications">) {
  const { estateId } = await params;
  const actor = await requireActor();
  const notifications = await listNotifications(actor, estateId);
  return (
    <NotificationsList estateId={estateId} notifications={notifications} />
  );
}
