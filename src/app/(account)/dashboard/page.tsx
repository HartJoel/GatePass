import { redirect } from 'next/navigation'
import { auth } from '@/server/auth/auth'
import { db } from '@/server/db/client'

export const dynamic = 'force-dynamic'

/**
 * TODO(phase 5): once resident/guard memberships are wired up, check EstateMembership too and
 * route a resident to /resident/[estateId] or a guard to /guard/[estateId]. For now this only
 * resolves the company-admin path registered in slice A.
 */
export default async function DashboardPage() {
  const { data: session } = await auth.getSession()
  if (!session?.user) redirect('/sign-in')

  const membership = await db.companyMembership.findFirst({
    where: { userId: session.user.id },
    select: { companyId: true },
  })
  if (!membership) redirect('/register')

  redirect(`/companies/${membership.companyId}`)
}
