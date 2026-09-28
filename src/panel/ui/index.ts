/**
 * The parts an editor is assembled from: its panels, its dialogs and the rail
 * they are opened from.
 *
 * Every one of them is handed what it shows and reports what was pressed, so
 * none of them reads a store and none of them knows which editor it is in.
 * That is what lets the same panel stack carry a spectrum, a chromatogram and
 * a drawing.
 */

export type { AboutDialogFrameProps } from './AboutDialogFrame.tsx';
export { AboutDialogFrame } from './AboutDialogFrame.tsx';
export type { ClearButtonProps } from './ClearButton.tsx';
export { ClearButton } from './ClearButton.tsx';
export type {
  DocumentationDialogFrameProps,
  DocumentationSection,
} from './DocumentationDialogFrame.tsx';
export { DocumentationDialogFrame } from './DocumentationDialogFrame.tsx';
export type { FilterInputProps } from './FilterInput.tsx';
export { FilterInput } from './FilterInput.tsx';
export type { HelpLabelProps } from './HelpLabel.tsx';
export { HelpLabel } from './HelpLabel.tsx';
export type {
  PanelEmptyProps,
  PanelMessageIntent,
  PanelMessageProps,
} from './PanelMessage.tsx';
export { PanelEmpty, PanelMessage } from './PanelMessage.tsx';
export type { PanelRailProps, RailPanel } from './PanelRail.tsx';
export { PanelRail } from './PanelRail.tsx';
export type { LinkProps, SectionProps } from './Section.tsx';
export { Link, Section } from './Section.tsx';
export type {
  PanelDescriptor,
  SidePanelStackProps,
} from './SidePanelStack.tsx';
export { SidePanelStack } from './SidePanelStack.tsx';
export type { SpectrumColorSwatchProps } from './SpectrumColorSwatch.tsx';
export { SpectrumColorSwatch } from './SpectrumColorSwatch.tsx';
export { useConfirmOnEnter } from './useConfirmOnEnter.ts';
export type { FilterBox } from './useFilterBox.ts';
export { useFilterBox } from './useFilterBox.ts';
export type { VirtualRows } from './useVirtualRows.ts';
export { useVirtualRows } from './useVirtualRows.ts';
export type { VirtualWindowRows } from './useVirtualWindowRows.ts';
export { useVirtualWindowRows } from './useVirtualWindowRows.ts';
