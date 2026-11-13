/**
 * Where Save was told to keep new documents — the folder or this browser — a
 * new document's Ctrl+S asks only its name; a name the dialog said is taken is
 * written over; and the place can be changed or forgotten.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createDocumentSaver } from '../createDocumentSaver.ts';
import type { SavedDocuments } from '../createSavedDocuments.ts';
import type { Cell, DocumentFile } from '../documentFile.ts';
import type { SaveFormat } from '../documentSaverTypes.ts';
import type { FolderEntry, SiteFolder } from '../siteFolderTypes.ts';

const SVG: SaveFormat<string> = {
  id: 'svg',
  label: 'SVG',
  extension: '.tex.svg',
  picker: { description: 'SVG', accept: { 'image/svg+xml': ['.svg'] } },
  write: (text) => `<svg>${text}</svg>`,
};

function cell<T>(value: T): Cell<T> {
  const holder = { value, peek: () => holder.value };
  return holder;
}

function fakeFile(name: string) {
  const written: string[] = [];
  const handle = {
    kind: 'file',
    name,
    queryPermission: () => Promise.resolve('granted'),
    createWritable: () =>
      Promise.resolve({
        write: (content: string) => {
          written.push(content);
          return Promise.resolve();
        },
        close: () => Promise.resolve(),
        abort: () => Promise.resolve(),
      }),
    isSameEntry: (other: { name: string }) =>
      Promise.resolve(other.name === name),
    getFile: () => Promise.resolve({ lastModified: 1 }),
  };
  return { handle: handle as unknown as FileSystemFileHandle, written };
}

function fakeFolder(names: string[]) {
  const files = new Map(names.map((name) => [name, fakeFile(name)]));
  const directory = {
    kind: 'directory',
    name: 'Course',
    getFileHandle: (name: string, options?: { create?: boolean }) => {
      let entry = files.get(name);
      if (!entry && options?.create) {
        entry = fakeFile(name);
        files.set(name, entry);
      }
      return entry
        ? Promise.resolve(entry.handle)
        : Promise.reject(new DOMException('absent', 'NotFoundError'));
    },
  } as unknown as FileSystemDirectoryHandle;
  const folder = {
    writable: () => Promise.resolve(directory),
    list: (): Promise<FolderEntry[]> =>
      Promise.resolve(
        [...files.keys()].map((name) => ({
          name,
          handle: files.get(name)?.handle as FileSystemFileHandle,
          modified: 1,
        })),
      ),
    changed: vi.fn(),
  } as unknown as SiteFolder;
  return { folder, files };
}

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
  const { folder, files } = fakeFolder([]);
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
  const { folder, files } = fakeFolder(['Einstein.tex.svg']);
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
  const { folder } = fakeFolder([]);
  const { saver } = saverOf(folder);

  saver.remember('download');

  expect(saver.remembered()).toBe('download');

  saver.remember(undefined);

  expect(saver.remembered()).toBeUndefined();
  await expect(saver.save()).resolves.toStrictEqual({ kind: 'choose' });
});

test('the names taken in the folder are its files without their extension', async () => {
  const { folder } = fakeFolder(['Nernst.tex.svg', 'Gibbs energy.tex.svg']);
  const { saver } = saverOf(folder);

  await expect(saver.takenNames('folder')).resolves.toStrictEqual(
    new Map([
      ['nernst', 'Nernst'],
      ['gibbs energy', 'Gibbs energy'],
    ]),
  );
});
