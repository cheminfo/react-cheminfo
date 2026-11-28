/**
 * What the editor shell's stories are drawn over: a saver, drafts, documents
 * saved in this browser and a backup, all in memory, so the book needs
 * neither IndexedDB nor a folder of this computer.
 */

import type { FigureSvg } from '../src/download/core/figureSvg.ts';
import { createDocumentSaver } from '../src/storage/core/createDocumentSaver.ts';
import type { DraftStore } from '../src/storage/core/createDraftStore.ts';
import type {
  SavedDocument,
  SavedDocuments,
} from '../src/storage/core/createSavedDocuments.ts';
import type { DocumentFile } from '../src/storage/core/documentFile.ts';
import type { DraftSession } from '../src/storage/core/draftSessionTypes.ts';
import type { SiteBackup } from '../src/storage/core/siteBackup.ts';
import type { SiteFolder } from '../src/storage/core/siteFolderTypes.ts';

function stopNothing(): void {
  // Nothing in memory changes under the story.
}

const FOLDER = {
  current: () => Promise.resolve(undefined),
  choose: () => Promise.resolve(null),
  path: () => [],
  subscribe: () => stopNothing,
} as unknown as SiteFolder;

const ROWS: Array<SavedDocument<string>> = [
  {
    id: 'pendulum',
    name: 'Pendulum',
    savedAt: Date.now() - 600_000,
    data: 'p',
  },
];

/** The documents saved in this browser, one of them already. */
export const SAVED_FIGURES: SavedDocuments<string> = {
  isAvailable: () => Promise.resolve(true),
  list: () => Promise.resolve([...ROWS]),
  named: (name) => Promise.resolve(ROWS.find((row) => row.name === name)),
  save: (name, data) => {
    const row = { id: name, name, savedAt: Date.now(), data };
    ROWS.push(row);
    return Promise.resolve(row);
  },
  update: () => Promise.resolve(undefined),
  rename: () => Promise.resolve(),
  remove: () => Promise.resolve(),
  restore: () => Promise.resolve(0),
  subscribe: () => stopNothing,
};

const FILE = {
  value: null as DocumentFile<string> | null,
  peek: () => FILE.value,
};

/** The saver of the story's bench. */
export const SAVER = createDocumentSaver<string>({
  site: 'mechanics',
  formats: [
    {
      id: 'figure',
      label: 'Figure',
      extension: '.mechanics.svg',
      picker: {
        description: 'Figure',
        accept: { 'image/svg+xml': ['.mechanics.svg'] },
      },
      write: (text) => `<svg xmlns="http://www.w3.org/2000/svg">${text}</svg>`,
    },
  ],
  document: () => 'bench',
  stem: () => 'figure',
  file: FILE,
  savedDocuments: SAVED_FIGURES,
  folder: FOLDER,
});

/** No draft kept yet. */
export const DRAFTS: DraftStore<string> = {
  isAvailable: () => Promise.resolve(true),
  list: () => Promise.resolve([]),
  get: () => Promise.resolve(undefined),
  put: () => Promise.resolve(),
  putMany: () => Promise.resolve(),
  delete: () => Promise.resolve(),
};

/** A draft session that keeps nothing. */
export const DRAFT_SESSION = {
  start: () => Promise.resolve(stopNothing),
  flush: () => Promise.resolve(),
  discardPending: () => undefined,
  heldElsewhere: () => Promise.resolve(new Set()),
  changed: () => undefined,
  open: () => Promise.resolve(true),
  keep: () => stopNothing,
} as DraftSession;

/** A backup of nothing. */
export const BACKUP: SiteBackup = {
  write: () => Promise.resolve(undefined),
  read: () => Promise.resolve(undefined),
  fileName: () => 'mechanics-backup.zip',
};

/** The examples the folder panel lists. */
export const EXAMPLES = [
  { id: 'pendulum', name: 'Pendulum', description: 'A mass on a string.' },
  { id: 'spring', name: 'Spring', description: 'A mass on a spring.' },
  { id: 'lever', name: 'Lever', description: 'A beam on a pivot.' },
];

/**
 * The picture the file bar saves.
 * @returns A circle.
 */
export function writeFigure(): Promise<FigureSvg> {
  return Promise.resolve({
    markup:
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="12"/></svg>',
    width: 40,
    height: 40,
  });
}
