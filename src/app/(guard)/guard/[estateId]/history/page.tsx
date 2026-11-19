import type { Metadata } from "next";
import { GuardHistory } from "@/features/access-log/components/guard-history";
import { requireActor } from "@/server/authz/actor";
import { listRecentAccessEvents } from "@/server/services/gate.service";

export const metadata: Metadata = { title: "Entry history · GatePass" };
export const dynamic = "force-dynamic";

export default async function GuardHistoryPage({
  params,
}: PageProps<"/guard/[estateId]/history">) {
  const { estateId } = await params;
  const actor = await requireActor();
  const events = await listRecentAccessEvents(actor, estateId);
  return <GuardHistory events={events} />;
}
