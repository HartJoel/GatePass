import type { Metadata } from "next";
import { PassForm } from "@/features/passes/components/pass-form";
import { requireActor } from "@/server/authz/actor";
import { listMyUnits } from "@/server/services/pass.service";

export const metadata: Metadata = { title: "Create a visitor pass · GatePass" };
export const dynamic = "force-dynamic";

export default async function NewPassPage({
  params,
}: PageProps<"/resident/[estateId]/passes/new">) {
  const { estateId } = await params;
  const actor = await requireActor();
  const units = await listMyUnits(actor, estateId);
  return <PassForm estateId={estateId} units={units} />;
}
