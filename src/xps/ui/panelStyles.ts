/**
 * What every side panel is built out of.
 *
 * A panel is the same three parts each time — the box it fills, a toolbar of its
 * own actions under the header, and the body that scrolls — so the shape lives
 * here rather than being copied into each of the seven. The header carries shell
 * chrome only, which is why a panel's own switches are a row of their own
 * directly beneath it: they travel with the panel when it is folded away or
 * reordered, and the header stays identical across the stack.
 *
 * Everything is a plain frozen object rather than a class name, because the
 * package ships no stylesheet. What every editor of the family shares comes
 * from `react-cheminfo/core`; what is XPS's own is written here.
 */

import {
  panelCellStyle,
  panelColumnButtonStyle,
  panelHeadingStyle,
} from '../../panel/core/panelStyles.ts';

// The parts every editor of the family shares, so a panel here reads exactly
// like one of the infrared or mass viewer.
export {
  labelStyle,
  panelBodyStyle,
  panelCellStyle,
  panelColumnButtonStyle,
  panelNumberCellStyle,
  panelScrollAreaStyle,
  panelStickyHeaderStyle,
  panelStyle,
  panelTableStyle,
  panelToolbarCountStyle,
  panelToolbarStyle,
} from '../../panel/core/panelStyles.ts';

/**
 * A heading that names a column without offering to reorder it: the sorting
 * heading's type, without the pointer that promises a click.
 */
export const panelColumnTitleStyle = {
  ...panelColumnButtonStyle,
  cursor: 'default',
} as const;

/**
 * A cell holding a name, taking whatever width the numbers leave, and cut short
 * rather than wrapped so the rows keep one height.
 *
 * `maxWidth: 0` beside `width: 100%` is what makes an automatic table give the
 * name the room left over rather than the room its longest name asks for: a
 * fit's shape string is wider than the panel, and without it the numbers are
 * pushed out of sight to the right.
 */
export const panelTextCellStyle = {
  ...panelCellStyle,
  width: '100%',
  maxWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

/**
 * The row being looked at, marked by a fill rather than by a border: a border
 * would move every row under it by a pixel as the pointer travels the chart.
 * A plain row carries no style at all — the hairline between rows is the
 * shared cell's own.
 */
export const panelLitRowStyle = { background: 'rgb(215 227 245)' } as const;

/** One labelled control of a small form inside a panel body. */
export const panelFieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const;

/**
 * The name of one group of a list, and whatever folds it away: the family's
 * group heading, drawn as a button.
 */
export const panelGroupHeaderStyle = {
  all: 'unset',
  ...panelHeadingStyle,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
} as const;

/**
 * The track a share is drawn in.
 *
 * A composition is read as a set of proportions long before any of its numbers
 * are, so every row carries the picture of its own share beside the figure.
 */
export const panelBarTrackStyle = {
  width: '100%',
  height: 6,
  borderRadius: 3,
  background: 'rgb(237 240 243)',
  overflow: 'hidden',
} as const;

/** How much of the track one row fills. */
export const panelBarFillStyle = {
  height: '100%',
  background: 'var(--accent)',
} as const;

/** A sentence about the list, written above it and quieter than it. */
export const panelSummaryStyle = {
  fontSize: 11,
  opacity: 0.7,
} as const;
