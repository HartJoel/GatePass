import { redirect } from 'next/navigation'

/**
 * TODO(phase 5): this should read the signed-in actor (getActor()) and route to whichever
 * surface matches them — company admin to their company overview, resident to
 * /resident/[estateId], guard to /guard/[estateId], platform admin to /platform. For now,
 * with no auth/session yet, it always lands on the one demo persona the rest of Phase 3
 * was built against (Kemi Adebayo, company admin of the demo company).
 */
export default function DashboardPage() {
  redirect('/companies/demo-co')
}
