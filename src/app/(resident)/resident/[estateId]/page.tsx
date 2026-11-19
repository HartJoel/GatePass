import type { Metadata } from "next";
import { ResidentDashboard } from "@/features/passes/components/resident-dashboard";
import { auth } from "@/server/auth/auth";
import { requireActor } from "@/server/authz/actor";
import { listPasses } from "@/server/services/pass.service";

export const metadata: Metadata = { title: "Home · GatePass" };
export const dynamic = "force-dynamic";

export default async function ResidentHomePage({
  params,
}: PageProps<"/resident/[estateId]">) {
  const { estateId } = await params;
  const actor = await requireActor();
  const { data: session } = await auth.getSession();
  const passes = await listPasses(actor, estateId);

  return (
    <ResidentDashboard
      estateId={estateId}
      residentName={session?.user.name ?? "there"}
      passes={passes}
    />
  );
}
