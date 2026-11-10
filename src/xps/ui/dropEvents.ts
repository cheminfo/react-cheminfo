/**
 * What a drag and a paste actually carry, and whether the viewer should take it.
 *
 * Kept apart from the hook because these are the decisions rather than the
 * plumbing: a paste into the tolerance box is being typed, a drag of selected
 * text is not a file, and both look identical to a listener that only asks
 * whether an event arrived.
 */

import { isEditingField } from '../../panel/core/isEditingField.ts';

/**
 * Whether a drag is carrying files rather than a selection of text.
 *
 * Dragging a transition name out of the peak table and back over the chart is
 * not a drop, and answering it with the drop highlight promises something that
 * will not happen.
 * @param event - The drag event.
 * @returns Whether at least one of the things being dragged is a file.
 */
export function carriesFiles(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('Files') === true;
}

/**
 * Take whatever a paste carries: a file, or two columns of numbers.
 *
 * The paste is refused — `preventDefault` — only once something has been taken
 * from it, so a paste this viewer has no use for still reaches whatever else on
 * the page wants it.
 * @param event - The paste, as the clipboard delivered it.
 * @param read - What to do with files.
 * @param readText - What to do with text.
 */
export function takePaste(
  event: ClipboardEvent,
  read: (files: FileList) => void,
  readText: (text: string) => void,
): void {
  if (isEditingField(event.target)) return;
  const clipboard = event.clipboardData;
  if (clipboard === null) return;
  if (clipboard.files.length > 0) {
    event.preventDefault();
    read(clipboard.files);
    return;
  }
  const text = clipboard.getData('text/plain');
  if (text.trim() === '') return;
  event.preventDefault();
  readText(text);
}
