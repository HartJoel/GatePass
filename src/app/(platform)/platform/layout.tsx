import { PlatformShell } from '@/components/layout/platform-shell'
import { ToastProvider } from '@/components/ui/toast'
import { PlatformDataProvider } from '@/features/platform/components/platform-data-provider'

export default function PlatformLayout({ children }: LayoutProps<'/platform'>) {
  return (
    <PlatformDataProvider>
      <ToastProvider>
        <PlatformShell>{children}</PlatformShell>
      </ToastProvider>
    </PlatformDataProvider>
  )
}
