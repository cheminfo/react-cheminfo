import type { Language } from '../../i18n/core/languages.ts';

import type { DraftStore } from './createDraftStore.ts';
import type {
  Cell,
  DocumentFile,
  ReadonlyCell,
  SignalTools,
} from './documentFile.ts';

/** What a drafts list reads, in the site's signals. */
export interface DraftStatus {
  /** Whether this browser lets the page keep drafts; undefined until known. */
  available: Cell<boolean | undefined>;
  /** Whether the last work is back, or known not to be coming back. */
  settled: Cell<boolean>;
  /** Bumped when a draft is added, deleted or restored, for lists to re-read. */
  version: Cell<number>;
}

/** The signals the page keeps its document, its file and its draft in. */
export interface DraftCells<D> {
  /** The document on screen: a computed signal will do. */
  document: ReadonlyCell<D>;
  /** The file it is kept in. */
  file: Cell<DocumentFile<D> | null>;
  /** The draft it is kept in; null until it holds something. */
  draftId: Cell<string | null>;
}

/** What a site tells its draft session. */
export interface DraftSessionOptions<D> {
  /** The site's name for its tab claims, e.g. `write-cheminfo`. */
  scope: string;
  /** Where the drafts are written. */
  store: DraftStore<D>;
  /** The document, its file and its draft. */
  cells: DraftCells<D>;
  /** What a drafts list reads. */
  status: DraftStatus;
  /** The site's `batch`, `effect` and `untracked`. */
  signals: SignalTools;
  /** An empty document. */
  empty: () => D;
  /** Whether a document holds nothing worth keeping. */
  isEmpty: (document: D) => boolean;
  /** Show a document in place of the one on screen, forgetting its history. */
  reset: (document: D) => void;
  /**
   * Once a draft is on screen: clear the selection and frame it.
   * @default nothing more is done
   */
  shown?: () => void;
  /** Say something to the visitor. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
  /**
   * The language messages are said in.
   * @default English
   */
  language?: () => Language;
  /**
   * How many drafts are kept: past it, the oldest no tab holds is forgotten.
   * A site that lists its drafts keeps them all; one that does not keeps a few.
   * @default Infinity
   */
  limit?: number;
  /**
   * Whether a draft also keeps the document as it was last saved, for a page
   * that shows what changed since. A large document is kept once without it.
   * @default true
   */
  keepSaved?: boolean;
}

/** What a site does with its drafts. */
export interface DraftSession {
  /**
   * Keep the document as a draft from now on, after reopening the last one
   * when the page opened on nothing a link asked for.
   * @returns A function that stops it.
   */
  start: (options: { linked: boolean }) => Promise<() => void>;
  /** Write what is waiting to be kept. */
  flush: () => Promise<void>;
  /** Drop what is waiting to be kept, which a backup is about to replace. */
  discardPending: () => void;
  /** The drafts open in other tabs, which this one must not open or delete. */
  heldElsewhere: () => Promise<ReadonlySet<string>>;
  /** Make lists of drafts read them again. */
  changed: () => void;
  /** Show a draft, keeping the document on screen in its own. */
  open: (
    id: string,
    options?: { quiet?: boolean; force?: boolean },
  ) => Promise<boolean>;
}
