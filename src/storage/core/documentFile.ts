/**
 * Where a document is kept, which Save writes to again, and the signals a
 * site holds it in. The library takes the site's own signals by injection, so
 * it never depends on `@preact/signals` itself.
 */

/** A value a site reads from one of its signals, computed or not. */
export interface ReadonlyCell<T> {
  /** The value; reading it subscribes whoever reads it. */
  readonly value: T;
  /**
   * The value, read without subscribing to it.
   * @returns The value.
   */
  peek: () => T;
}

/** A value a site keeps in one of its signals. */
export interface Cell<T> {
  /** The value; writing it notifies whoever reads it. */
  value: T;
  /**
   * The value, read without subscribing to it.
   * @returns The value.
   */
  peek: () => T;
}

/** The three signal functions the library needs, from the site's own copy. */
export interface SignalTools {
  /** Run several writes as one change: `batch` from `@preact/signals-react`. */
  batch: (callback: () => void) => void;
  /** Run a function again whenever what it read changes; returns a stop. */
  effect: (callback: () => void) => () => void;
  /** Read signals without subscribing to them. */
  untracked: <T>(callback: () => T) => T;
}

/** Where Save keeps a document. */
export type SaveTarget = 'file' | 'folder' | 'browser' | 'download';

/** Every place, in the order a choice offers them. */
export const SAVE_TARGETS: readonly SaveTarget[] = [
  'file',
  'folder',
  'browser',
  'download',
];

/** What a document file keeps beside the data, in the site's archive. */
export interface DocumentPartsKept {
  /** The view: where the page looks, the selection. */
  view: boolean;
  /** The workspace: the panels and their settings. */
  workspace: boolean;
}

/** The file a document is kept in, which Save writes to again. */
export interface DocumentFile<D> {
  /**
   * Its name: the file's, extension included, or the name it is kept under in
   * this browser.
   */
  name: string;
  /**
   * The file Save writes over: one the visitor picked, or one made in the
   * site's folder.
   * @default undefined — Save asks, or does what the visitor chose before
   */
  handle?: FileSystemFileHandle;
  /**
   * The document saved in this browser that Save replaces.
   * @default undefined — not kept in this browser
   */
  savedId?: string;
  /**
   * What Save writes beside the data, in the site's archive.
   * @default undefined — the data alone
   */
  parts?: DocumentPartsKept;
  /** The document as it was last saved. */
  saved: D;
}
