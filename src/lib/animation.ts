/** Maximum number of items that get unique stagger delays (1-10) */
export const MAX_STAGGER_INDEX = 10

/** Base animation classes for fade-up entrance */
const FADE_UP_CLASSES = 'opacity-0 animate-fade-up'

/**
 * Returns the stagger delay class for a given index.
 * Items 0-9 get stagger-1 through stagger-10.
 * Items 10+ share stagger-10 (appear together after first 10).
 */
export function getStaggerClass(index: number): string {
  const clampedIndex = Math.min(index, MAX_STAGGER_INDEX - 1)
  return `stagger-${clampedIndex + 1}`
}

/**
 * Returns complete animation classes for list item entrance.
 * Returns empty string when animation is disabled.
 */
export function getEntranceAnimationClasses(index: number, animate: boolean): string {
  if (!animate) return ''
  return `${FADE_UP_CLASSES} ${getStaggerClass(index)}`
}
