import type { StoreRefusal } from './storeRefusal.ts';

/** A document kept in this browser under a name. */
export interface SavedDocument<TData> {
  /** Its identifier, kept when it is saved again or renamed. */
  id: string;
  /** The name it is listed under, unique among the site's documents. */
  name: string;
  /** When it was last saved, in epoch milliseconds. */
  savedAt: number;
  /** The document, as the site holds it. */
  data: TData;
}

/** Options of `createSavedDocuments`. */
export interface SavedDocumentsOptions<TData> {
  /**
   * The site's database stem, e.g. `write-cheminfo`; the documents are kept in
   * a database of their own, `<name>-documents`.
   */
  name: string;
  /**
   * The document a stored value holds, or undefined when it holds none. Rows
   * are read like a file, so one written by an older build cannot break the
   * page.
   */
  read: (value: unknown) => TData | undefined;
}

/** The documents a site keeps in this browser under a name. */
export interface SavedDocuments<TData> {
  /** Whether this browser lets the page keep them. */
  isAvailable: () => Promise<boolean>;
  /** Every document, the most recently saved first. */
  list: () => Promise<Array<SavedDocument<TData>>>;
  /** The document saved under a name, compared without case or outer spaces. */
  named: (name: string) => Promise<SavedDocument<TData> | undefined>;
  /**
   * Keep a document under a name, in place of the one saved under it before.
   * @throws {StoreRefusal} `name` when the name is empty or longer than
   * `MAX_DOCUMENT_NAME`, `full` when the browser has no room left, and
   * `unavailable` or `blocked` when the database cannot be opened.
   */
  save: (name: string, data: TData) => Promise<SavedDocument<TData>>;
  /**
   * Save a document again under the name it has now, renamed or not.
   * @returns It, or `undefined` when it was forgotten meanwhile.
   * @throws {StoreRefusal} `full` when the browser has no room left, and
   * `unavailable` or `blocked` when the database cannot be opened.
   */
  update: (
    id: string,
    data: TData,
  ) => Promise<SavedDocument<TData> | undefined>;
  /**
   * Give a document another name.
   * @throws {StoreRefusal} `name` when the name is not one a document can
   * take, `taken` when another document goes by it, `full` when the browser
   * has no room left.
   */
  rename: (id: string, name: string) => Promise<void>;
  /** Forget a document. */
  remove: (id: string) => Promise<void>;
  /**
   * Take documents back from a backup, each with the name and the date it was
   * saved under. One saved here under the same name is replaced; the others
   * stay. A document the site no longer reads is left out.
   * @returns How many were taken back.
   * @throws {StoreRefusal} `full` when the browser has no room left, and
   * `unavailable` or `blocked` when the database cannot be opened.
   */
  restore: (
    documents: ReadonlyArray<SavedDocument<unknown>>,
  ) => Promise<number>;
  /**
   * Be told when the documents change, in this tab or another.
   * @returns The function that stops it.
   */
  subscribe: (listener: () => void) => () => void;
}
