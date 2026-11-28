/**
 * An editor's drafts, saved documents, backup and Save are wired one way:
 * stores named after the site, a saved document opened in place of the one on
 * screen and remembered as saved, and nothing to save while the page is empty.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Cell } from '../../../state/core/cells.ts';
import { createSavedDocuments } from '../createSavedDocuments.ts';
import type { DocumentFile } from '../documentFile.ts';
import { createEditorDocuments } from '../editorDocuments.ts';

import { cell } from './fakeFileSystem.ts';
import { stubIndexedDB } from './fakeIndexedDB.ts';

interface Bench {
  pieces: string[];
}

function stopNothing(): undefined {
  return undefined;
}

function readBench(value: unknown): Bench | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const { pieces } = value as { pieces?: unknown };
  return Array.isArray(pieces) ? { pieces: pieces.map(String) } : undefined;
}

beforeEach(() => {
  stubIndexedDB();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function editor(pieces: string[] = []) {
  const cells = {
    document: cell<Bench>({ pieces }),
    file: cell<DocumentFile<Bench> | null>(null),
    draftId: cell<string | null>('draft-1'),
  };
  const opened: Array<{ bench: Bench; forget: boolean }> = [];
  const documents = createEditorDocuments<Bench>({
    site: 'mechanics',
    read: readBench,
    cells,
    signals: {
      batch: (callback) => {
        callback();
      },
      effect: (callback) => {
        callback();
        return stopNothing;
      },
      untracked: (callback) => callback(),
      signal: <T>(value: T): Cell<T> => cell(value),
    },
    empty: () => ({ pieces: [] }),
    isEmpty: (bench) => bench.pieces.length === 0,
    open: (bench, { forget }) => {
      cells.document.value = bench;
      opened.push({ bench, forget });
    },
    notify: () => undefined,
    figure: () => Promise.resolve('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  });
  return { cells, documents, opened };
}

test('a document saved in this browser is kept in the site’s own store', async () => {
  const { documents } = editor();
  await documents.saved.save('Pendulum', { pieces: ['mass', 'string'] });
  const again = createSavedDocuments<Bench>({
    name: 'mechanics-cheminfo',
    read: readBench,
  });
  const listed = await again.list();

  expect(listed.map((document) => document.name)).toStrictEqual(['Pendulum']);
  expect(documents.draftStatus.version.value).toBe(0);
});

test('opening a saved document shows it, keeps it in no draft and remembers it saved', () => {
  const { cells, documents, opened } = editor(['spring']);
  documents.openSaved({
    id: 'd1',
    name: 'Pulley',
    savedAt: 1,
    data: { pieces: ['pulley'] },
  });

  expect(opened).toStrictEqual([
    { bench: { pieces: ['pulley'] }, forget: false },
  ]);
  expect(cells.draftId.value).toBeNull();
  expect(cells.file.value).toStrictEqual({
    name: 'Pulley',
    savedId: 'd1',
    saved: { pieces: ['pulley'] },
  });
});

test('a document opened from a file is kept in it, and keepNowhere forgets both', () => {
  const { cells, documents } = editor(['lever']);
  const handle = { name: 'lever.svg' } as FileSystemFileHandle;
  documents.keepInFile(handle);

  expect(cells.file.value).toStrictEqual({
    name: 'lever.svg',
    handle,
    saved: { pieces: ['lever'] },
  });

  documents.keepNowhere();

  expect(cells.file.value).toBeNull();
  expect(cells.draftId.value).toBeNull();
});

test('Save writes the site’s figure first, then its document', () => {
  const { formats } = editor(['spring']).documents.saver;

  expect(formats.map((format) => format.extension)).toStrictEqual([
    '.mechanics.svg',
    '.mechanics.zip',
  ]);
});
