import type { Metadata } from 'next'
import { AuditLogView } from '@/features/audit/components/audit-log-view'
import { DEMO_AUDIT_ENTRIES } from '@/features/access-log/demo-data'

export const metadata: Metadata = { title: 'Audit log · GatePass' }

export default function AuditLogPage() {
  // TODO(phase 5, slice H): load via the audit service, scoped to this company.
  return <AuditLogView entries={DEMO_AUDIT_ENTRIES} />
}
