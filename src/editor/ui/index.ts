/**
 * The shell every figure editor of the family is assembled from: the file bar
 * above the figure, the status line under it, and the folder panel. Each part
 * is handed what it shows and reports what was pressed, so none of them reads
 * a store and none of them knows which editor it is in.
 */

export type {
  EditorClear,
  EditorFileBarProps,
  EditorHistory,
  EditorRemove,
} from './EditorFileBar.tsx';
export { EditorFileBar } from './EditorFileBar.tsx';
export type {
  EditorFolderDrafts,
  EditorFolderExamples,
  EditorFolderPanelProps,
  EditorFolderSaved,
} from './EditorFolderPanel.tsx';
export { EditorFolderPanel } from './EditorFolderPanel.tsx';
export type { EditorStatusBarProps } from './EditorStatusBar.tsx';
export { EditorStatusBar } from './EditorStatusBar.tsx';
