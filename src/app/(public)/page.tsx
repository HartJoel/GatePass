import { redirect } from 'next/navigation'

// TODO(phase 5): once Better Auth exists, check the session first and send a
// signed-in visitor straight to /dashboard instead of always bouncing to sign-in.
export default function RootPage() {
  redirect('/sign-in')
}
