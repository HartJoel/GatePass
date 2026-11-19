export const PASS_LIMITS = {
  visitorNameMax: 80,
  noteMax: 200,
  /** 24h default / 7d max, per the architecture skill's adopted suggestion. */
  defaultValidityHours: 24,
  maxValidityHours: 168,
} as const
