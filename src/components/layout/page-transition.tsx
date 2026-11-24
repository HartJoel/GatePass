'use client'

import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useMotionPresets } from '@/lib/motion'

/**
 * Cross-fades a shell's main content on navigation. Wraps whatever the Server
 * Component page renders — the pages underneath stay Server Components, only
 * this wrapper is a client boundary (same idea as Sidebar/BottomTabs already being
 * client components around server-rendered content).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { rise } = useMotionPresets()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} variants={rise} initial="hidden" animate="visible" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
