'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/overlay'
import { useToast } from '@/components/ui/toast'
import { PassCard } from '@/features/passes/components/pass-card'
import { usePassesData } from '@/features/passes/components/passes-data-provider'

export function PassDetail({ passId }: { passId: string }) {
  const { estateId } = useParams<{ estateId: string }>()
  const { passes, revokePass } = usePassesData()
  const toast = useToast()
  const pass = passes.find((p) => p.id === passId)
  const [confirmRevoke, setConfirmRevoke] = useState(false)

  if (!pass) {
    return (
      <>
        <Link href={`/resident/${estateId}/passes`} className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden />
          Passes
        </Link>
        <h1 className="type-h1 mb-6 text-ink">Pass not found</h1>
        <Banner tone="info" title="We couldn’t find that pass">
          It may have been removed. Go back to your passes to pick another.
        </Banner>
      </>
    )
  }

  const revocable = pass.status === 'active'

  return (
    <>
      <header className="mb-6">
        <Link href={`/resident/${estateId}/passes`} className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden />
          Passes
        </Link>
        <h1 className="type-h1 text-ink">Visitor pass</h1>
      </header>

      <PassCard pass={pass} detail />

      {revocable && (
        <Button variant="destructive-ghost" fullWidth className="mt-4" onClick={() => setConfirmRevoke(true)}>
          Revoke pass
        </Button>
      )}

      <Modal
        open={confirmRevoke}
        onClose={() => setConfirmRevoke(false)}
        title="Revoke this pass?"
        description={`${pass.visitor} will no longer be able to use this code at the gate. This can’t be undone.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmRevoke(false)}>
              Keep pass
            </Button>
            <Button
              variant="destructive-ghost"
              onClick={() => {
                revokePass(pass.id)
                toast({ tone: 'neutral', title: 'Pass revoked', description: pass.visitor })
                setConfirmRevoke(false)
              }}
            >
              Revoke pass
            </Button>
          </>
        }
      />
    </>
  )
}
