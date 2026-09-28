/**
 * The chrome an editor is laid out with, below the components that wear it.
 *
 * A panel, a status bar and a dialog look the same in every editor of the
 * family, and they have to: a reader who has learnt one editor has learnt the
 * others, and that only holds while the parts are literally the same parts.
 * What is here is the half that draws nothing — the style objects each part is
 * built from, the questions the DOM is asked before a shortcut fires, and the
 * sentences a reader is given when a file goes wrong.
 */

export { listStyle, paragraphStyle } from './dialogStyles.ts';
export { isEditingField } from './isEditingField.ts';
export {
  inlineLabelStyle,
  labelRowStyle,
  labelStyle,
  panelBodyStyle,
  panelCapsuleGroupStyle,
  panelCapsuleRowStyle,
  panelCapsulesStyle,
  panelCellStyle,
  panelColumnButtonStyle,
  panelEmptyStyle,
  panelHeaderCellStyle,
  panelHeadingStyle,
  panelNumberCellStyle,
  panelScrollAreaStyle,
  panelStickyHeaderStyle,
  panelStyle,
  panelTableStyle,
  panelToolbarCountStyle,
  panelToolbarStyle,
  shortPanelStyle,
  smallCapsuleStyle,
} from './panelStyles.ts';
export type { RowPlacement, RowSpacers } from './rowSpacers.ts';
export { rowSpacers } from './rowSpacers.ts';
export {
  countLabel,
  statusBarStyle,
  statusItemStyle,
  statusMutedStyle,
  statusSpacerStyle,
} from './statusBar.ts';
export { filterNeedle, matchesNeedle } from './textFilter.ts';
export { yieldToPainting } from './yieldToPainting.ts';
