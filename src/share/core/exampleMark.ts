/**
 * The examples a page opened, and the documents they opened as, so a link can
 * tell an example still as it opened from one changed since.
 */

import type { ShareOnScreen } from './opensOn.ts';

/** The examples a page opened, as {@link createExampleMark} keeps them. */
export interface ExampleMark<TDocument extends object> {
  /**
   * Say the document on screen is an example, as it opened.
   * @param id - The example.
   * @param document - The document it opened as.
   */
  mark: (id: string, document: TDocument) => void;
  /** Say what is on screen came from no example: a file, a draft, a clear page. */
  clear: () => void;
  /**
   * What the Share dialog is told of the document on screen.
   * @param document - The document on screen.
   * @returns The example it opened on, and whether it has changed since.
   */
  read: (document: TDocument) => Pick<ShareOnScreen, 'example' | 'changed'>;
}

/**
 * Keep the examples a page opened. Documents are compared by identity: every
 * change replaces the document, so the one an example opened as is the one on
 * screen until something is changed, and an undo back to it — even past a file
 * opened since — makes it that example again.
 * @returns The mark.
 */
export function createExampleMark<
  TDocument extends object,
>(): ExampleMark<TDocument> {
  const opened = new WeakMap<TDocument, string>();
  let last: string | null = null;
  return {
    mark: (id, document) => {
      opened.set(document, id);
      last = id;
    },
    clear: () => {
      last = null;
    },
    read: (document) => {
      const example = opened.get(document);
      if (example !== undefined) return { example, changed: false };
      return { example: last, changed: last !== null };
    },
  };
}
