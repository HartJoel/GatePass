import type { CompanyRole, EstateRole } from '@/generated/prisma/enums'

export type CompanyPermission = 'manage_company'
export type EstatePermission = 'manage_estate' | 'create_pass' | 'operate_gate' | 'view_estate'

/** Data only — enforcement lives in src/server/authz/policies.ts. UI may use this to hide
 * buttons, but it is never the source of truth for what a request is allowed to do. */
export const COMPANY_PERMISSIONS: Record<CompanyPermission, readonly CompanyRole[]> = {
  manage_company: ['COMPANY_ADMIN'],
}

export const ESTATE_PERMISSIONS: Record<EstatePermission, readonly EstateRole[]> = {
  manage_estate: ['MANAGER'],
  create_pass: ['RESIDENT'],
  operate_gate: ['GUARD'],
  view_estate: ['MANAGER', 'RESIDENT', 'GUARD'],
}
