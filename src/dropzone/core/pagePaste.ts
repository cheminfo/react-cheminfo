/**
 * A paste anywhere on a page: the files, or the text, someone pastes while no
 * field has the focus — a screenshot, a SMILES, a link. A field keeps its own
 * pastes, and a paste the page already took is left alone, so a page whose
 * start zone takes pastes and the workbench behind it can both listen.
 */

import { isEditingField } from '../../panel/core/isEditingField.ts';

import type { DropTransfer } from './dropTransfer.ts';
import { readDropTransfer } from './dropTransfer.ts';

/** What a page takes of a paste. */
export interface PagePasteOptions {
  /**
   * Whether pasted text is taken as well as files.
   * @default true
   */
  takesText?: boolean;
  /**
   * Whether the page takes a paste at all now, asked before it is taken: a
   * page that hands its pastes elsewhere while a part of it is shown.
   * @default always
   */
  accepts?: () => boolean;
}

/**
 * Listen to pastes on the whole page.
 * @param onTransfer - Where a paste the page takes goes.
 * @param options - See {@link PagePasteOptions}.
 * @returns The function that stops listening.
 */
export function listenToPagePaste(
  onTransfer: (transfer: DropTransfer) => void,
  options: PagePasteOptions = {},
): () => void {
  const { takesText = true, accepts } = options;
  if (typeof document === 'undefined') return () => undefined;
  const onPaste = (event: ClipboardEvent): void => {
    if (event.defaultPrevented || accepts?.() === false) return;
    if (isEditingField(event.target)) return;
    if (isEditingField(document.activeElement)) return;
    const transfer = readDropTransfer(event.clipboardData);
    if (transfer === null) return;
    if (transfer.kind === 'text' && !takesText) return;
    event.preventDefault();
    onTransfer(transfer);
  };
  document.addEventListener('paste', onPaste);
  return () => document.removeEventListener('paste', onPaste);
}
