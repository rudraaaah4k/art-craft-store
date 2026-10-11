export const MOTION_TOKENS = {
  spring: {
    stiff: { type: 'spring' as const, stiffness: 300, damping: 25 },
    gentle: { type: 'spring' as const, stiffness: 100, damping: 20 },
    bouncy: { type: 'spring' as const, stiffness: 400, damping: 10 },
  },
  ease: {
    out: [0.33, 1, 0.68, 1] as const,
    inOut: [0.65, 0, 0.35, 1] as const,
  },
}
