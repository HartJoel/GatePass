// No 'server-only' guard: see the note in env.ts — this stays importable from standalone
// scripts (seed.ts) even though in practice only Next.js request code calls it.
import { cache } from 'react'
import { auth } from '@/server/auth/auth'
import { db } from '@/server/db/client'
import { AppError } from '@/server/errors/app-error'
import type { CompanyRole, CompanyStatus, EstateRole, MembershipStatus } from '@/generated/prisma/enums'

export interface ActorCompany {
  companyId: string
  role: CompanyRole
  status: MembershipStatus
  companyStatus: CompanyStatus
  /** Estates belonging to this company — company admins inherit estate-management
   * permissions across all of them. */
  estateIds: string[]
}

export interface ActorEstate {
  estateId: string
  companyId: string
  membershipId: string
  role: EstateRole
  status: MembershipStatus
  companyStatus: CompanyStatus
}

export interface Actor {
  userId: string
  isPlatformAdmin: boolean
  companies: ActorCompany[]
  estates: ActorEstate[]
}

/** Builds the Actor from the session user, cache()'d so one request only reads it once. The
 * client never supplies roles or ids that are trusted unchecked — everything here comes from
 * our own tables, scoped by the session's real userId. */
export const getActor = cache(async (): Promise<Actor | null> => {
  const { data: session } = await auth.getSession()
  if (!session?.user) return null
  const userId = session.user.id

  const [platformAdmin, companyMemberships, estateMemberships] = await Promise.all([
    db.platformAdmin.findUnique({ where: { userId } }),
    db.companyMembership.findMany({
      where: { userId },
      include: { company: { select: { status: true, estates: { select: { id: true } } } } },
    }),
    db.estateMembership.findMany({
      where: { userId },
      include: { estate: { select: { companyId: true, company: { select: { status: true } } } } },
    }),
  ])

  const companies: ActorCompany[] = companyMemberships.map((m) => ({
    companyId: m.companyId,
    role: m.role,
    status: m.status,
    companyStatus: m.company.status,
    estateIds: m.company.estates.map((e) => e.id),
  }))

  const estates: ActorEstate[] = estateMemberships.map((m) => ({
    estateId: m.estateId,
    companyId: m.estate.companyId,
    membershipId: m.id,
    role: m.role,
    status: m.status,
    companyStatus: m.estate.company.status,
  }))

  return { userId, isPlatformAdmin: !!platformAdmin, companies, estates }
})

export async function requireActor(): Promise<Actor> {
  const actor = await getActor()
  if (!actor) throw new AppError('UNAUTHENTICATED', 'Sign in to continue.')
  return actor
}
