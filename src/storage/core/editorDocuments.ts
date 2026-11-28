/**
 * Everything an editor keeps its documents with, wired once the way every
 * editor of the family wires it: the drafts kept as the document changes,
 * the documents saved in this browser under a name, their backup, and Save,
 * which writes the figure that opens here again.
 */

import type { Language } from '../../i18n/core/languages.ts';
import type { Cell, SignalTools } from '../../state/core/cells.ts';

import { createDocumentSaver } from './createDocumentSaver.ts';
import { createDraftSession } from './createDraftSession.ts';
import type { DraftStore } from './createDraftStore.ts';
import { createDraftStore } from './createDraftStore.ts';
import type { SavedDocument, SavedDocuments } from './createSavedDocuments.ts';
import { createSavedDocuments } from './createSavedDocuments.ts';
import type { DocumentSaver } from './documentSaverTypes.ts';
import { createDraftStatus } from './draftKeeping.ts';
import type {
  DraftCells,
  DraftSession,
  DraftStatus,
} from './draftSessionTypes.ts';
import { figureSaveFormats } from './figureSaveFormats.ts';
import type { SiteBackup } from './siteBackup.ts';
import { createSiteBackup } from './siteBackup.ts';

/** What an editor keeps its documents with. */
export interface EditorDocumentsOptions<D> {
  /**
   * The site's name, as its figures name it: its stores are
   * `<site>-cheminfo`, its backups say `<site>.cheminfo.org` made them.
   */
  site: string;
  /**
   * Who a backup says made it.
   * @default `${site}.cheminfo.org`
   */
  generator?: string;
  /** Read a kept document, trusted for nothing. */
  read: (value: unknown) => D | undefined;
  /** The document on screen, the file it is kept in and its draft. */
  cells: DraftCells<D>;
  /** The site's `batch`, `effect`, `untracked` and `signal`. */
  signals: SignalTools & { signal: <T>(value: T) => Cell<T> };
  /** An empty document. */
  empty: () => D;
  /** Whether a document holds nothing worth keeping. */
  isEmpty: (document: D) => boolean;
  /**
   * Show a document in place of the one on screen: `forget` for a draft
   * reopened, which leaves nothing to undo behind it.
   */
  open: (document: D, options: { forget: boolean }) => void;
  /**
   * Once a draft is on screen: clear the selection, frame it.
   * @default nothing more is done
   */
  shown?: () => void;
  /** Say something to the visitor, in the status line. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
  /** The figure on the page, as the SVG that opens here again. */
  figure: () => Promise<string>;
  /**
   * The name a new file is offered under, before its extension.
   * @default 'figure'
   */
  stem?: () => string;
  /**
   * How many drafts are kept.
   * @default 10
   */
  limit?: number;
  /**
   * Whether a draft also keeps the document as it was last saved.
   * @default true
   */
  keepSaved?: boolean;
  /**
   * The language messages are said in.
   * @default English
   */
  language?: () => Language;
}

/** What an editor keeps its documents with, and the moves around them. */
export interface EditorDocuments<D> {
  /** Where the drafts are written. */
  drafts: DraftStore<D>;
  /** The site's draft session. */
  draftSession: DraftSession;
  /** What a drafts list reads. */
  draftStatus: DraftStatus;
  /** The documents saved in this browser under a name. */
  saved: SavedDocuments<D>;
  /** Everything kept in this browser, out as one file and back in. */
  backup: SiteBackup;
  /** Save and Save as, wired to the document on screen. */
  saver: DocumentSaver<D>;
  /** Remember that the document on screen is the one just saved. */
  markSaved: (document: SavedDocument<D>) => void;
  /** Open a document saved in this browser; undo brings back the one before. */
  openSaved: (document: SavedDocument<D>) => void;
  /** Keep the document in the file it was opened from, which Save writes. */
  keepInFile: (handle: FileSystemFileHandle) => void;
  /** The document on screen is kept in no file and no draft. */
  keepNowhere: () => void;
}

/**
 * Wire an editor's drafts, saved documents, backup and Save.
 * @param options - The site, its document and how it is read and shown.
 * @returns The stores, the saver, and the moves around them.
 */
export function createEditorDocuments<D>(
  options: EditorDocumentsOptions<D>,
): EditorDocuments<D> {
  const { site, read, cells, signals, empty, isEmpty, open } = options;
  const { notify, figure, shown, language } = options;
  const { limit = 10, keepSaved = true, stem = () => 'figure' } = options;
  const { generator = `${site}.cheminfo.org` } = options;
  const { document: onScreen, file, draftId } = cells;
  const name = `${site}-cheminfo`;
  const draftStatus = createDraftStatus(signals.signal);
  const drafts = createDraftStore<D>({ name, read });
  const draftSession = createDraftSession<D>({
    scope: name,
    store: drafts,
    cells,
    status: draftStatus,
    signals,
    empty,
    isEmpty,
    reset: (document) => {
      open(document, { forget: true });
    },
    notify,
    limit,
    keepSaved,
    ...(shown ? { shown } : {}),
    ...(language ? { language } : {}),
  });
  const saved = createSavedDocuments<D>({ name, read });
  const backup = createSiteBackup({
    stem: name,
    generator,
    documents: saved,
    drafts: {
      store: drafts,
      session: draftSession,
      current: () => draftId.peek(),
    },
  });
  const saver = createDocumentSaver<D>({
    site,
    formats: figureSaveFormats<D>({ site, figure }),
    document: () => {
      const document = onScreen.peek();
      return isEmpty(document) ? undefined : document;
    },
    stem,
    file,
    savedDocuments: saved,
  });

  function markSaved(document: SavedDocument<D>): void {
    file.value = {
      name: document.name,
      savedId: document.id,
      saved: document.data,
    };
  }

  function keepNowhere(): void {
    signals.batch(() => {
      file.value = null;
      draftId.value = null;
    });
  }

  return {
    drafts,
    draftSession,
    draftStatus,
    saved,
    backup,
    saver,
    markSaved,
    openSaved: (document) => {
      open(document.data, { forget: false });
      keepNowhere();
      markSaved(document);
    },
    keepInFile: (handle) => {
      file.value = {
        name: handle.name,
        handle,
        saved: onScreen.peek(),
      };
    },
    keepNowhere,
  };
}
