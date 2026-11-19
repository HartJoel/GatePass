import { redirect } from 'next/navigation'
import { auth } from '@/server/auth/auth'
import { db } from '@/server/db/client'

export const dynamic = 'force-dynamic'

/**
 * Picks a home for whichever role the session user has. A user with several estate
 * memberships lands on the first one found — a chooser for that case is a later enhancement,
 * not needed for the MVP's expected one-role-per-user shape.
 */
export default async function DashboardPage() {
  const { data: session } = await auth.getSession()
  if (!session?.user) redirect('/sign-in')

  const companyMembership = await db.companyMembership.findFirst({
    where: { userId: session.user.id },
    select: { companyId: true },
  })
  if (companyMembership) redirect(`/companies/${companyMembership.companyId}`)

  const estateMembership = await db.estateMembership.findFirst({
    where: { userId: session.user.id, status: 'ACTIVE' },
    select: { estateId: true, role: true, estate: { select: { companyId: true } } },
  })
  if (!estateMembership) redirect('/register')

  if (estateMembership.role === 'RESIDENT') redirect(`/resident/${estateMembership.estateId}`)
  if (estateMembership.role === 'GUARD') redirect(`/guard/${estateMembership.estateId}`)
  redirect(`/companies/${estateMembership.estate.companyId}/estates/${estateMembership.estateId}`)
}
