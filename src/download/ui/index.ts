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
