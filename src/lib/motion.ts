import { useReducedMotion, type Transition, type Variants } from 'motion/react'

/**
 * Same curve as --ease-calm in globals.css, so CSS transitions and Motion-driven
 * animation read as one system instead of two different "feels".
 */
export const easeOut: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

/**
 * Shared motion presets for the app's flagship surfaces (modals, drawers, toasts,
 * page transitions). Under prefers-reduced-motion every preset becomes an instant
 * state change (duration 0, no travel), never a slower version.
 */
export function useMotionPresets() {
  const reduce = useReducedMotion() ?? false
  const timing = (seconds: number): Transition => ({ duration: reduce ? 0 : seconds, ease: easeOut })

  return {
    reduce,
    /** Parent variants that stagger children in, so a group of elements reads as one moment. */
    group: {
      hidden: {},
      visible: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
    } satisfies Variants,
    /** Fade with a small upward settle. Used for toasts and page transitions. */
    rise: {
      hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: timing(0.2) },
      exit: { opacity: 0, y: reduce ? 0 : -6, transition: { duration: reduce ? 0 : 0.14 } },
    } satisfies Variants,
    /** Backdrop behind a modal or drawer. */
    overlay: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: timing(0.16) },
      exit: { opacity: 0, transition: { duration: reduce ? 0 : 0.16 } },
    } satisfies Variants,
    /** Centred dialog: a small rise and scale, with no overshoot. */
    dialog: {
      hidden: reduce ? { opacity: 1 } : { opacity: 0, scale: 0.97, y: 10 },
      visible: { opacity: 1, scale: 1, y: 0, transition: timing(0.2) },
      exit: { opacity: 0, scale: reduce ? 1 : 0.98, y: reduce ? 0 : 6, transition: { duration: reduce ? 0 : 0.16 } },
    } satisfies Variants,
    /** Side panel that slides in from the right edge. */
    drawer: {
      hidden: { x: reduce ? 0 : '100%' },
      visible: { x: 0, transition: timing(0.3) },
      exit: { x: reduce ? 0 : '100%', transition: { duration: reduce ? 0 : 0.22 } },
    } satisfies Variants,
    /** Scale-in with a light spring, for icons and status marks. */
    pop: {
      hidden: reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 22 },
      },
    } satisfies Variants,
  }
}
