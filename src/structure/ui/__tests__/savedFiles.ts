/**
 * The files a page handed the browser to save, read back in jsdom.
 *
 * A download is an object URL on an anchor that is clicked: the blob is kept
 * when its URL is made, and the click is read off the anchor it was made on.
 * Undone by `vi.restoreAllMocks()`.
 */

import { vi } from 'vitest';

/** One file the browser was asked to save. */
export interface SavedFile {
  /** The name it is saved under. */
  name: string;
  /** Its media type. */
  type: string;
  /** Its content. */
  text: Promise<string>;
}

/**
 * Start recording what is saved.
 * @returns A reader of every file saved since, in order.
 */
export function watchSavedFiles(): () => SavedFile[] {
  const blobs: Blob[] = [];
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    blobs.push(blob as Blob);
    return `blob:test/${blobs.length - 1}`;
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined);
  return () =>
    (click.mock.contexts as HTMLAnchorElement[]).map((anchor) => {
      const blob = blobs[Number(anchor.href.split('/').at(-1))] ?? new Blob();
      return { name: anchor.download, type: blob.type, text: blob.text() };
    });
}

/**
 * Let the work a click started settle: the promises it chains and one turn of
 * the event loop.
 * @returns When it has.
 */
export function settle(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
