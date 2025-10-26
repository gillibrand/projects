const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/**
 * If we should reduce animation effects.
 *
 * @returns true is motion reduction is on via system or local setting.
 */
export function isReduceMotion() {
  return prefersReducedMotion.matches;
}
