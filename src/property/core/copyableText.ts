/**
 * What a click on a value of a property table copies.
 */

/** What a cell shows when there is no value for it. */
export const NOT_AVAILABLE = '—';

/**
 * The text a reader pastes for a value the page shows, or `null` when there is
 * nothing to take: a value the data does not hold, or one drawn from elements
 * rather than written as text, which names its own copy text instead.
 * @param value - What is on screen.
 * @returns The clipboard text, or null.
 */
export function copyableText(value: unknown): string | null {
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text === '' || text === NOT_AVAILABLE ? null : text;
}
