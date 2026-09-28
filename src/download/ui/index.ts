/**
 * Taking what is on the page off it, as a file.
 *
 * The one component here saves a figure, and it is given the `id` of the box
 * the figure sits in rather than the figure itself: a chart does not have to
 * know it is savable, and a bar above one can offer to save it without either
 * of them holding a reference to the other.
 */

export type { FigureDownloadProps } from './FigureDownload.tsx';
export { FigureDownload } from './FigureDownload.tsx';
export type { FigureDownloadPanelProps } from './FigureDownloadPanel.tsx';
export { FigureDownloadPanel } from './FigureDownloadPanel.tsx';

export type { ExportDialogFrameProps } from './ExportDialogFrame.tsx';
export { ExportDialogFrame } from './ExportDialogFrame.tsx';
export type { ExportImageDialogProps } from './ExportImageDialog.tsx';
export { ExportImageDialog } from './ExportImageDialog.tsx';
export type { ExportNameFieldProps } from './ExportNameField.tsx';
export { ExportNameField } from './ExportNameField.tsx';
export type { ExportPictureSectionProps } from './ExportPictureSection.tsx';
export { ExportPictureSection } from './ExportPictureSection.tsx';
export type { DrawingBox } from './useDrawingBox.ts';
export { useDrawingBox } from './useDrawingBox.ts';
