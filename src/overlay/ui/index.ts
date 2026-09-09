/**
 * The chrome that floats over a figure: a small card of controls, the plain
 * sentence under it, the key naming what its colours mean, and the card that
 * follows the pointer.
 *
 * It is a domain of its own rather than part of any chart, because a scatter,
 * a spectrum and a map all want the same card in the same corner, and because
 * the rules for one are the reason two figures in this package look like they
 * belong to the same tool.
 */

export type { OverlayActionProps } from './OverlayAction.tsx';
export { OverlayAction } from './OverlayAction.tsx';
export type { OverlayBarProps } from './OverlayBar.tsx';
export { OverlayBar } from './OverlayBar.tsx';
export type { OverlayCaptionProps } from './OverlayCaption.tsx';
export { OverlayCaption } from './OverlayCaption.tsx';
export type { OverlayChipProps, OverlayChipSetting } from './OverlayChip.tsx';
export { OverlayChip } from './OverlayChip.tsx';
export { OverlayDivider } from './OverlayDivider.tsx';
export type { OverlayGroupProps } from './OverlayGroup.tsx';
export { OverlayGroup } from './OverlayGroup.tsx';
export type { OverlayInfoProps } from './OverlayInfo.tsx';
export { OverlayInfo } from './OverlayInfo.tsx';
export type { OverlayLayerProps } from './OverlayLayer.tsx';
export { OverlayLayer } from './OverlayLayer.tsx';
export type {
  OverlayLegendEntry,
  OverlayLegendProps,
} from './OverlayLegend.tsx';
export { OverlayLegend } from './OverlayLegend.tsx';
export type { OverlayLegendMarkProps } from './OverlayLegendMark.tsx';
export { OverlayLegendMark } from './OverlayLegendMark.tsx';
export type { OverlayNumberProps } from './OverlayNumber.tsx';
export { OverlayNumber } from './OverlayNumber.tsx';
export type { OverlayPanelProps } from './OverlayPanel.tsx';
export { OverlayPanel } from './OverlayPanel.tsx';
export type { OverlayPillOption, OverlayPillsProps } from './OverlayPills.tsx';
export { OverlayPills } from './OverlayPills.tsx';
export type { OverlaySegmentedSize } from './overlayPillStyles.ts';
export type {
  OverlayReadoutProps,
  OverlayReadoutRow,
} from './OverlayReadout.tsx';
export { OverlayReadout } from './OverlayReadout.tsx';
export type {
  OverlayControlProps,
  OverlayOption,
  OverlayRowLayout,
  OverlayRowProps,
} from './OverlayRow.tsx';
export { OverlayRow } from './OverlayRow.tsx';
export type { OverlaySegmentedProps } from './OverlaySegmented.tsx';
export { OverlaySegmented } from './OverlaySegmented.tsx';
export type {
  OverlaySelectAppearance,
  OverlaySelectProps,
} from './OverlaySelect.tsx';
export { OverlaySelect } from './OverlaySelect.tsx';
export type { OverlaySwatchIconProps } from './OverlaySwatchIcon.tsx';
export { OverlaySwatchIcon } from './OverlaySwatchIcon.tsx';
export type {
  OverlayToggleAppearance,
  OverlayToggleProps,
} from './OverlayToggle.tsx';
export { OverlayToggle } from './OverlayToggle.tsx';
export type { OverlayValueButtonProps } from './OverlayValueButton.tsx';
export { OverlayValueButton } from './OverlayValueButton.tsx';
export type { OverlayValueMenuProps } from './OverlayValueMenu.tsx';
export { OverlayValueMenu } from './OverlayValueMenu.tsx';
export type { OverlaySurface } from './overlaySurface.ts';
export { useCoarsePointer, useOverlaySurface } from './overlaySurface.ts';
