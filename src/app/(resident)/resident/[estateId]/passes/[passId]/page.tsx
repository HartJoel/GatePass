import type { Metadata } from "next";
import { PassDetail } from "@/features/passes/components/pass-detail";

export const metadata: Metadata = { title: "Visitor pass · GatePass" };

export default async function PassDetailPage({
  params,
}: PageProps<"/resident/[estateId]/passes/[passId]">) {
  const { passId } = await params;
  return <PassDetail passId={passId} />;
}
