/**
 * Where Save was told to keep new documents — the folder or this browser — a
 * new document's Ctrl+S asks only its name; a name the dialog said is taken is
 * written over; and the place can be changed or forgotten.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createDocumentSaver } from '../createDocumentSaver.ts';
import type { SavedDocuments } from '../createSavedDocuments.ts';
import type { DocumentFile } from '../documentFile.ts';
import type { SaveFormat } from '../documentSaverTypes.ts';
import type { SiteFolder } from '../siteFolderTypes.ts';

import { cell, fakeFolder } from './fakeFileSystem.ts';

const SVG: SaveFormat<string> = {
  id: 'svg',
  label: 'SVG',
  extension: '.tex.svg',
  picker: { description: 'SVG', accept: { 'image/svg+xml': ['.svg'] } },
  write: (text) => `<svg>${text}</svg>`,
};

function saverOf(folder: SiteFolder, savedDocuments?: SavedDocuments<string>) {
  const file = cell<DocumentFile<string> | null>(null);
  const saver = createDocumentSaver<string>({
    site: 'named',
    formats: [SVG],
    document: () => 'E = mc^2',
    stem: () => 'formula',
    file,
    folder,
    ...(savedDocuments ? { savedDocuments } : {}),
  });
  return { saver, file };
}

const entries = new Map<string, string>();

beforeEach(() => {
  entries.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  });
  vi.stubGlobal('showSaveFilePicker', vi.fn());
  vi.stubGlobal('showDirectoryPicker', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('told to keep new documents in the folder, Save asks a new one its name, then writes over it', async () => {
  const { folder, files } = fakeFolder([], { name: 'Course' });
  const { saver } = saverOf(folder);
  saver.remember('folder');

  await expect(saver.save()).resolves.toStrictEqual({
    kind: 'name',
    target: 'folder',
  });

  await saver.saveTo({
    ...saver.suggestion(),
    name: 'Einstein',
    target: 'folder',
  });

  await expect(saver.save()).resolves.toStrictEqual({
    kind: 'saved',
    target: 'file',
    name: 'Einstein.tex.svg',
  });
  expect(files.get('Einstein.tex.svg')?.written).toHaveLength(2);
});

test('a name the dialog said is taken is written over, not beside', async () => {
  const { folder, files } = fakeFolder(['Einstein.tex.svg'], {
    name: 'Course',
  });
  const { saver } = saverOf(folder);

  const outcome = await saver.saveTo({
    ...saver.suggestion(),
    name: 'Einstein',
    target: 'folder',
    replace: true,
  });

  expect(outcome).toStrictEqual({
    kind: 'saved',
    target: 'folder',
    name: 'Einstein.tex.svg',
  });
  expect(files.get('Einstein.tex.svg')?.written).toStrictEqual([
    '<svg>E = mc^2</svg>',
  ]);
  expect(files.size).toBe(1);
});

test('the place can be changed, or forgotten so Save asks again', async () => {
  const { folder } = fakeFolder([], { name: 'Course' });
  const { saver } = saverOf(folder);

  saver.remember('download');

  expect(saver.remembered()).toBe('download');

  saver.remember(undefined);

  expect(saver.remembered()).toBeUndefined();
  await expect(saver.save()).resolves.toStrictEqual({ kind: 'choose' });
});

test('the names taken in the folder are its files without their extension', async () => {
  const { folder } = fakeFolder(['Nernst.tex.svg', 'Gibbs energy.tex.svg'], {
    name: 'Course',
  });
  const { saver } = saverOf(folder);

  await expect(saver.takenNames('folder')).resolves.toStrictEqual(
    new Map([
      ['nernst', 'Nernst'],
      ['gibbs energy', 'Gibbs energy'],
    ]),
  );
});

test('a name kept with a time is saved in the folder without its colon', async () => {
  const { folder, files } = fakeFolder([], { name: 'Course' });
  const { saver } = saverOf(folder);

  const outcome = await saver.saveTo({
    ...saver.suggestion(),
    name: 'Caffeine, 16 Nov 2026, 07:01',
    target: 'folder',
  });

  expect(outcome).toStrictEqual({
    kind: 'saved',
    target: 'folder',
    name: 'Caffeine, 16 Nov 2026, 0701.tex.svg',
  });
  expect([...files.keys()]).toStrictEqual([
    'Caffeine, 16 Nov 2026, 0701.tex.svg',
  ]);
});

test('a folder no longer on the disk is named rather than not found', async () => {
  const directory = {
    kind: 'directory',
    name: 'export',
    getFileHandle: folderGone,
    keys: () => ({ next: folderGone }),
  } as unknown as FileSystemDirectoryHandle;
  const folder = {
    writable: () => Promise.resolve(directory),
    changed: vi.fn(),
  } as unknown as SiteFolder;
  const { saver, file } = saverOf(folder);

  const outcome = await saver.saveTo({
    ...saver.suggestion(),
    name: 'Caffeine',
    target: 'folder',
  });

  expect(outcome).toStrictEqual({
    kind: 'failed',
    name: 'Caffeine.tex.svg',
    message: 'gone',
    missingFolder: 'export',
  });
  expect(file.value).toBeNull();
});

function folderGone(): Promise<never> {
  return Promise.reject(new DOMException('gone', 'NotFoundError'));
}
