/**
 * What every side panel is built out of, in every editor.
 *
 * A panel is the same three parts each time — the box it fills, a toolbar of
 * its own actions under the header, and the body that scrolls — and the reason
 * one file holds the measurements rather than each package holding its own is
 * that a page shows the editors together: a glycan drawn beside its spectrum
 * stacks panels from two packages in one accordion, and a panel that padded
 * itself differently reads as a step in the column.
 *
 * Three copies of this file had already drifted — one had renamed half of it,
 * one had lost a border, and their toolbars stood at two different heights — so
 * the divergence is not hypothetical.
 */

/** The box a panel fills: it takes the height it is given and never overflows it. */
export const panelStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 1px',
  minHeight: 0,
} as const;

/**
 * A panel that only holds what it holds, and is as tall as that.
 *
 * The stack gives it the height its content asks for rather than a share of the
 * side, which is what a panel of a few rows wants.
 */
export const shortPanelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: 8,
} as const;

/**
 * The row of a panel's own actions, directly under its header.
 *
 * The header carries shell chrome only, so what a panel switches on and off
 * travels with the panel instead. No padding of its own: what sits in it is a
 * `Toolbar`, which spaces its own items, and a row that padded them again stood
 * taller than the same row in the editor next door.
 */
export const panelToolbarStyle = {
  display: 'flex',
  borderBottom: '1px solid rgb(217 223 230)',
} as const;

/**
 * How much of a list is left, at the far end of the panel's toolbar row.
 *
 * What a filter left is read while reaching for the filter rather than while
 * reading the rows, so it belongs beside the actions; and at the end of the row,
 * where it stays put as actions are added beside them.
 */
export const panelToolbarCountStyle = {
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  padding: '0 8px',
  fontSize: 11,
  opacity: 0.7,
} as const;

/** What is under the toolbar: the panel's content, scrolling within its share. */
export const panelBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: 8,
  flex: '1 1 1px',
  minHeight: 0,
  overflow: 'auto',
} as const;

/**
 * A list inside a panel body that scrolls on its own.
 *
 * A table with a sticky header cannot share the body's scroll, because a scroll
 * container's padding is inside what it clips: the rows leaving the top show in
 * the eight pixels above a header pinned to `top: 0`, so the list appears to run
 * behind its own header instead of stopping at it. Scrolling the rows in a
 * region with no padding of its own pins the header to the top of what is
 * actually moving, and leaves whatever the panel wrote above the table — the
 * count, the filter box — where it can still be read at the thousandth row.
 */
export const panelScrollAreaStyle = {
  flex: '1 1 1px',
  minHeight: 0,
  overflow: 'auto',
} as const;

/** A table of rows filling the width of the panel it is read in. */
export const panelTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 11,
  fontVariantNumeric: 'tabular-nums',
} as const;

/**
 * A heading cell that stays put while the rows scroll under it.
 *
 * It pads nothing, because what it holds is a button that pads itself: a
 * heading that sorts has to be clickable across the whole cell, and padding the
 * cell instead would leave a dead border around the target.
 */
export const panelStickyHeaderStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  background: 'rgb(255 255 255)',
  textAlign: 'left',
  padding: 0,
  borderBottom: '1px solid rgb(217 223 230)',
} as const;

/** The same heading when it is plain text, which has to pad itself. */
export const panelHeaderCellStyle = {
  ...panelStickyHeaderStyle,
  padding: '2px 6px',
  whiteSpace: 'nowrap',
} as const;

/**
 * A column heading, which is also how the table is reordered.
 *
 * The headers sort rather than a select box above the table, because which order
 * a table is read in changes with every question asked of it, and a select costs
 * two clicks and a menu for what a column heading answers in one.
 */
export const panelColumnButtonStyle = {
  all: 'unset',
  display: 'block',
  width: '100%',
  padding: '3px 4px',
  cursor: 'pointer',
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  opacity: 0.6,
} as const;

/** An ordinary cell of such a table. */
export const panelCellStyle = {
  padding: '1px 6px',
  borderBottom: '1px solid rgb(238 241 245)',
  whiteSpace: 'nowrap',
} as const;

/** A cell holding a number, read down the column against its neighbours. */
export const panelNumberCellStyle = {
  ...panelCellStyle,
  textAlign: 'right',
} as const;

/** What a value is, written small and quiet above it. */
export const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  opacity: 0.6,
} as const;

/** A label with whatever acts on the value it names pushed to the far end. */
export const labelRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 4,
} as const;

/** A row of capsules under such a label, wrapping when it runs out of width. */
export const panelCapsulesStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 4,
  marginTop: 4,
} as const;

/**
 * The same label written beside what it names rather than above it.
 *
 * A label costs a whole line of the panel where it stands on its own, and a
 * choice of two or three capsules does not fill the line it is then given. Set
 * beside them the label reads as the question the capsules answer, and two such
 * questions fit in the height one used to take.
 */
export const inlineLabelStyle = {
  ...labelStyle,
  fontSize: 10,
  flex: '0 0 auto',
} as const;

/** One inline label and the capsules that answer it, kept on one line. */
export const panelCapsuleGroupStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 4,
} as const;

/**
 * Several such groups on one line, wrapping group by group.
 *
 * The wider gap between groups than within one is what keeps them legible as
 * separate questions once they share a line: capsules four pixels apart belong
 * to the label on their left, and the group after it starts a hand's width
 * further along.
 */
export const panelCapsuleRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '4px 12px',
} as const;

/**
 * A capsule sized for such a row.
 *
 * Blueprint's tag has no size below its medium one, so the smaller capsule is
 * asked for here rather than through a prop. Written as a style so a capsule
 * carrying a colour of its own can spread it over this one.
 */
export const smallCapsuleStyle = {
  minHeight: 0,
  minWidth: 0,
  padding: '1px 5px',
  fontSize: 10,
  lineHeight: '14px',
} as const;

/** The name of one group of a list, with the room a group needs above it. */
export const panelHeadingStyle = {
  ...labelStyle,
  padding: '6px 4px 2px',
} as const;

/** What a panel says instead of a list, when it has nothing to list. */
export const panelEmptyStyle = {
  padding: 8,
  fontSize: 12,
  opacity: 0.7,
} as const;
