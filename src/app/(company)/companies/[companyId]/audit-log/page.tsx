import type { Metadata } from 'next'
import { AuditLogView } from '@/features/audit/components/audit-log-view'
import { requireActor } from '@/server/authz/actor'
import { listAuditLog } from '@/server/services/audit.service'

export const metadata: Metadata = { title: 'Audit log · GatePass' }
export const dynamic = 'force-dynamic'

export default async function AuditLogPage({ params }: PageProps<'/companies/[companyId]/audit-log'>) {
  const { companyId } = await params
  const actor = await requireActor()
  const entries = await listAuditLog(actor, companyId)
  return <AuditLogView entries={entries} />
}
