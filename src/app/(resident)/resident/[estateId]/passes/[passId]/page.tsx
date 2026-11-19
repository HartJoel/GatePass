import type { Metadata } from "next";
import { PassDetail } from "@/features/passes/components/pass-detail";
import { requireActor } from "@/server/authz/actor";
import { getPass } from "@/server/services/pass.service";

export const metadata: Metadata = { title: "Visitor pass · GatePass" };
export const dynamic = "force-dynamic";

export default async function PassDetailPage({
  params,
}: PageProps<"/resident/[estateId]/passes/[passId]">) {
  const { estateId, passId } = await params;
  const actor = await requireActor();
  const pass = await getPass(actor, estateId, passId);
  return <PassDetail estateId={estateId} pass={pass} />;
}
