'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/overlay'
import { useToast } from '@/components/ui/toast'
import { PassCard } from '@/features/passes/components/pass-card'
import { SharePass } from '@/features/passes/components/share-pass'
import { revokePassAction } from '@/server/actions/pass.actions'
import type { PassRow } from '@/server/services/pass.service'

export function PassDetail({ estateId, pass }: { estateId: string; pass: PassRow | null }) {
  const router = useRouter()
  const toast = useToast()
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [busy, setBusy] = useState(false)
  const passesHref = `/resident/${estateId}/passes`

  if (!pass) {
    return (
      <>
        <Link href={passesHref} className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
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

  async function onRevoke() {
    setBusy(true)
    const result = await revokePassAction(estateId, pass!.id)
    setBusy(false)
    setConfirmRevoke(false)
    if (result.error) {
      toast({ tone: 'danger', title: 'Couldn’t revoke pass', description: result.error.message })
      return
    }
    toast({ tone: 'neutral', title: 'Pass revoked', description: pass!.visitor })
    router.refresh()
  }

  return (
    <>
      <header className="mb-6">
        <Link href={passesHref} className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden />
          Passes
        </Link>
        <h1 className="type-h1 text-ink">Visitor pass</h1>
      </header>

      <PassCard pass={pass} detail />

      {pass.status !== 'revoked' && <SharePass pass={pass} />}

      {revocable && (
        <Button variant="destructive-ghost" fullWidth className="mt-4" disabled={busy} onClick={() => setConfirmRevoke(true)}>
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
            <Button variant="ghost" onClick={() => setConfirmRevoke(false)} disabled={busy}>
              Keep pass
            </Button>
            <Button variant="destructive-ghost" loading={busy} onClick={onRevoke}>
              {busy ? 'Revoking…' : 'Revoke pass'}
            </Button>
          </>
        }
      />
    </>
  )
}
