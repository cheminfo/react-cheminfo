/**
 * A row of buttons with the name box among them, wrapping when the dialog is
 * too narrow for them.
 */
export const exportButtonsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 6,
} as const;

/** One group of an export dialog: what it offers, in a column. */
export const exportSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const;

/** Text that says something about a control rather than being one. */
export const exportNoteStyle = { fontSize: 12, opacity: 0.7 } as const;
