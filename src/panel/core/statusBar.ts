/**
 * The strip along the foot of an editor, which every one of them writes alike.
 *
 * A status bar says what is open and what is under the pointer, in one line of
 * small type over a rule. The geometry is the same in every viewer — that is
 * what makes it read as one application rather than three — so it lives here,
 * and each viewer adds only the items it has to write and whatever colour one
 * of them needs.
 */

/** The strip itself: one row, a rule above it, nothing wrapping. */
export const statusBarStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '4px 10px',
  minHeight: 30,
  borderTop: '1px solid var(--border)',
  fontSize: 13,
  whiteSpace: 'nowrap',
} as const;

/** One thing the bar says, icon and text on one line. */
export const statusItemStyle = {
  display: 'inline-flex',
  alignItems: 'center',
} as const;

/** An item that is context rather than an answer. */
export const statusMutedStyle = { ...statusItemStyle, opacity: 0.6 } as const;

/** What pushes the items after it to the far end of the bar. */
export const statusSpacerStyle = { flex: 1 } as const;

/**
 * An item whose words are cut with an ellipsis when the bar runs out of room,
 * rather than pushing the last items off its end: a calibration, a credit.
 */
export const statusCutStyle = {
  ...statusItemStyle,
  display: 'block',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flexShrink: 1,
} as const;

/**
 * A muted item that takes only the room the bar has left: nothing of its own
 * to start from, growing up to the width of its words, and never less than an
 * ellipsis, so no part of a letter is left showing.
 */
export const statusRoomLeftStyle = {
  ...statusMutedStyle,
  display: 'block',
  minWidth: '1.2em',
  maxWidth: 'max-content',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
} as const;

/**
 * A count with the noun it counts, singular where it has to be.
 * @param count - How many.
 * @param singular - What one of them is called.
 * @param plural - What several are called.
 * @returns The phrase, e.g. `1 peak` or `412 peaks`.
 */
export function countLabel(
  count: number,
  singular: string,
  plural: string,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
