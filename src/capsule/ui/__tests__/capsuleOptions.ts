import type { CapsuleOption } from '../CapsuleFilter.tsx';

/** A single row's three capsules: all, then two with an intent of their own. */
export const OPTIONS: readonly CapsuleOption[] = [
  { value: 'all', label: 'All', count: 1204 },
  { value: 'solved', label: 'Solved', count: 812, intent: 'success' },
  { value: 'failed', label: 'Failed', count: 17, intent: 'danger' },
];

/** The kinds of equation a multiple row picks among. */
export type EquationType = 'acidoBasic' | 'complexation' | 'precipitation';

/** A multiple row's three capsules, each with an intent of its own. */
export const TYPES: ReadonlyArray<CapsuleOption<EquationType>> = [
  { value: 'acidoBasic', label: 'acid-base', intent: 'primary' },
  { value: 'complexation', label: 'complexation', intent: 'success' },
  { value: 'precipitation', label: 'precipitation', intent: 'warning' },
];

/**
 * Whether each capsule of a row says it is pressed, in order.
 * @param html - The row's markup.
 * @returns `'true'` or `'false'` per capsule.
 */
export function pressedStates(html: string): Array<string | undefined> {
  return [...html.matchAll(/aria-pressed="(?<pressed>true|false)"/g)].map(
    (match) => match.groups?.pressed,
  );
}
