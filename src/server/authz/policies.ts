import { AppError } from '@/server/errors/app-error'
import { COMPANY_PERMISSIONS, ESTATE_PERMISSIONS, type CompanyPermission, type EstatePermission } from '@/lib/permissions'
import type { Actor } from '@/server/authz/actor'
import type { CompanyRole, EstateRole } from '@/generated/prisma/enums'

export interface CompanyGrant {
  role: CompanyRole
  companyId: string
}

/** Synchronous, fail closed. No relationship at all -> NOT_FOUND (don't reveal existence);
 * relationship but wrong role -> FORBIDDEN. */
export function authorizeCompany(actor: Actor, companyId: string, permission: CompanyPermission): CompanyGrant {
  const membership = actor.companies.find((c) => c.companyId === companyId)
  if (!membership) throw new AppError('NOT_FOUND', 'Not found.')
  if (membership.companyStatus === 'SUSPENDED') throw new AppError('COMPANY_SUSPENDED', 'This company is suspended.')
  if (membership.status === 'DEACTIVATED') throw new AppError('FORBIDDEN', 'Your access has been deactivated.')
  if (!COMPANY_PERMISSIONS[permission].includes(membership.role)) throw new AppError('FORBIDDEN', 'You don’t have permission to do that.')
  return { role: membership.role, companyId }
}

export interface EstateGrant {
  role: EstateRole | 'COMPANY_ADMIN'
  /** Null when the grant comes from company-admin inheritance rather than a direct
   * EstateMembership row. */
  membershipId: string | null
  companyId: string
}

/** Company admins inherit the admin-type permissions (manage/view the estate) — never the
 * role-specific operational ones. "A company admin CANNOT create passes or operate the gate"
 * is a hard exclusion in the gatepass-auth skill; without this allowlist, every company admin
 * would silently pass create_pass/operate_gate checks too, since they're a company admin of
 * every one of their own estates. */
const COMPANY_ADMIN_INHERITED_PERMISSIONS: readonly EstatePermission[] = ['manage_estate', 'view_estate']

/** Synchronous, fail closed. Company admins inherit management permissions in their company's
 * estates via actor.companies[].estateIds, so they're checked before falling back to a direct
 * EstateMembership. */
export function authorizeEstate(actor: Actor, estateId: string, permission: EstatePermission): EstateGrant {
  const companyMembership = actor.companies.find((c) => c.estateIds.includes(estateId))
  if (companyMembership && COMPANY_ADMIN_INHERITED_PERMISSIONS.includes(permission)) {
    if (companyMembership.companyStatus === 'SUSPENDED') throw new AppError('COMPANY_SUSPENDED', 'This company is suspended.')
    if (companyMembership.status === 'DEACTIVATED') throw new AppError('FORBIDDEN', 'Your access has been deactivated.')
    return { role: 'COMPANY_ADMIN', membershipId: null, companyId: companyMembership.companyId }
  }

  const estateMembership = actor.estates.find((e) => e.estateId === estateId)
  if (!estateMembership) {
    // A company admin of this estate's company has a real relationship to it (just not this
    // permission) — FORBIDDEN, not NOT_FOUND, which is reserved for no relationship at all.
    if (companyMembership) throw new AppError('FORBIDDEN', 'You don’t have permission to do that.')
    throw new AppError('NOT_FOUND', 'Not found.')
  }
  if (estateMembership.companyStatus === 'SUSPENDED') throw new AppError('COMPANY_SUSPENDED', 'This company is suspended.')
  if (estateMembership.status === 'DEACTIVATED') throw new AppError('FORBIDDEN', 'Your access has been deactivated.')
  if (!ESTATE_PERMISSIONS[permission].includes(estateMembership.role)) throw new AppError('FORBIDDEN', 'You don’t have permission to do that.')
  return { role: estateMembership.role, membershipId: estateMembership.membershipId, companyId: estateMembership.companyId }
}
