/**
 * The example the address names, on an editor: opened as the page starts with
 * nothing to undo behind it, opened in place of the document and named in the
 * address, and taken off with the page cleared. The document an example opened
 * as is marked, so the Share dialog tells it from one changed since.
 */

import type { ExampleMark } from '../../share/core/exampleMark.ts';

/** What an editor's examples are opened with. */
export interface EditorExamplesOptions<Id extends string, D extends object> {
  /** The editor's router: what reads and writes `?example=`. */
  editor: {
    linkedExample: () => string | null;
    writeExample: (id: string | null) => void;
  };
  /** Whether a value names one of the site's examples. */
  isExampleId: (value: unknown) => value is Id;
  /** Build an example's document. */
  build: (id: Id) => D;
  /**
   * Show a document in place of the one on screen: `forget` as the page
   * starts, so nothing is left to undo behind it.
   */
  open: (document: D, options: { forget: boolean }) => void;
  /** The document on screen, once one is open: the one an example is marked on. */
  document: () => D;
  /** The mark telling the example on screen from one changed since. */
  mark: ExampleMark<D>;
  /** An empty document, which clearing the page opens. */
  empty: () => D;
  /** The document on screen is kept in no file and no draft. */
  keepNowhere: () => void;
}

/** An editor's examples, as the address names them. */
export interface EditorExamples<Id extends string> {
  /**
   * The example the address names.
   * @returns Its id, or null when it names none of the site's.
   */
  linkedExample: () => Id | null;
  /** Open the example the address names, as the page starts. */
  openLinkedExample: () => void;
  /** Open an example in place of the document, and name it in the address. */
  openExample: (id: Id) => void;
  /** Empty the page, and the address of the example it named. */
  clear: () => void;
}

/**
 * Tie an editor's examples to its address.
 * @param options - The router, the examples and how a document is shown.
 * @returns What opens and clears them.
 */
export function createEditorExamples<Id extends string, D extends object>(
  options: EditorExamplesOptions<Id, D>,
): EditorExamples<Id> {
  const { editor, isExampleId, build, open, document, mark } = options;

  function linkedExample(): Id | null {
    const named = editor.linkedExample();
    return isExampleId(named) ? named : null;
  }

  return {
    linkedExample,
    openLinkedExample: () => {
      const named = linkedExample();
      if (named === null) return;
      open(build(named), { forget: true });
      mark.mark(named, document());
    },
    openExample: (id) => {
      open(build(id), { forget: false });
      mark.mark(id, document());
      options.keepNowhere();
      editor.writeExample(id);
    },
    clear: () => {
      open(options.empty(), { forget: false });
      options.keepNowhere();
      editor.writeExample(null);
    },
  };
}
