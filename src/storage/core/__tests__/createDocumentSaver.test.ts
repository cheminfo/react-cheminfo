/**
 * Save asks where the first time and never writes or downloads before the
 * visitor answered; then each place keeps one document: a file written over,
 * a file made in the site's folder, a document in this browser, or a new
 * download each time.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { downloadBlob } from '../../../download/core/downloadBlob.ts';
import { createDocumentSaver } from '../createDocumentSaver.ts';
import type { SavedDocument, SavedDocuments } from '../createSavedDocuments.ts';
import type { SiteFolder } from '../createSiteFolder.ts';
import type { Cell, DocumentFile } from '../documentFile.ts';
import type { SaveFormat } from '../documentSaverTypes.ts';

vi.mock('../../../download/core/downloadBlob.ts', () => ({
  downloadBlob: vi.fn(),
}));

const HTML: SaveFormat<string> = {
  id: 'document',
  label: 'Document',
  extension: '.write.html',
  picker: { description: 'Document', accept: { 'text/html': ['.html'] } },
  write: (text) => `<p>${text}</p>`,
};

function stopNothing(): void {
  // Nothing was subscribed to.
}

function cell<T>(value: T): Cell<T> {
  const holder = { value, peek: () => holder.value };
  return holder;
}

// A file of this computer, recording what is written into it.
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
  };
  return { handle: handle as unknown as FileSystemFileHandle, written };
}

// A folder holding the named files.
function fakeFolder(names: string[]) {
  const files = new Map(names.map((name) => [name, fakeFile(name)]));
  const directory = {
    kind: 'directory',
    name: 'Notebook',
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
    changed: vi.fn(),
  } as unknown as SiteFolder;
  return { folder, files };
}

// Documents kept in this browser, in memory.
function memoryDocuments(): SavedDocuments<string> & {
  rows: Array<SavedDocument<string>>;
} {
  const rows: Array<SavedDocument<string>> = [];
  return {
    rows,
    isAvailable: () => Promise.resolve(true),
    list: () => Promise.resolve([...rows]),
    named: (name) => Promise.resolve(rows.find((row) => row.name === name)),
    save: (name, data) => {
      const previous = rows.find((row) => row.name === name);
      const row = {
        id: previous?.id ?? `id-${rows.length + 1}`,
        name,
        savedAt: 1,
        data,
      };
      if (previous) rows[rows.indexOf(previous)] = row;
      else rows.push(row);
      return Promise.resolve(row);
    },
    update: (id, data) => {
      const row = rows.find((candidate) => candidate.id === id);
      if (row) row.data = data;
      return Promise.resolve(row);
    },
    rename: () => Promise.resolve(),
    remove: () => Promise.resolve(),
    restore: () => Promise.resolve(0),
    subscribe: () => stopNothing,
  };
}

function saverOf(
  extra: {
    folder?: SiteFolder;
    savedDocuments?: SavedDocuments<string>;
  } = {},
) {
  const file = cell<DocumentFile<string> | null>(null);
  const text = cell('Aspirin');
  const saver = createDocumentSaver<string>({
    site: 'test',
    formats: [HTML],
    document: () => (text.value === '' ? undefined : text.value),
    stem: () => 'report',
    file,
    ...extra,
  });
  return { saver, file, text };
}

const entries = new Map<string, string>();

beforeEach(() => {
  entries.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  });
  vi.mocked(downloadBlob).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the first save asks where, and downloads or picks nothing before', async () => {
  const picker = vi.fn();
  vi.stubGlobal('showSaveFilePicker', picker);
  const { saver } = saverOf();

  await expect(saver.save()).resolves.toStrictEqual({ kind: 'choose' });
  expect(picker).not.toHaveBeenCalled();
  expect(downloadBlob).not.toHaveBeenCalled();
});

test('Firefox and Safari offer this browser and a download; Chrome a file and a folder too', () => {
  const documents = memoryDocuments();

  expect(saverOf({ savedDocuments: documents }).saver.targets()).toStrictEqual([
    'browser',
    'download',
  ]);

  vi.stubGlobal('showSaveFilePicker', vi.fn());
  vi.stubGlobal('showDirectoryPicker', vi.fn());

  expect(saverOf({ savedDocuments: documents }).saver.targets()).toStrictEqual([
    'file',
    'folder',
    'browser',
    'download',
  ]);
});

test('a file picked once is written over by every save after', async () => {
  const picked = fakeFile('report.write.html');
  const picker = vi.fn<
    (options: { suggestedName: string }) => Promise<FileSystemFileHandle>
  >(() => Promise.resolve(picked.handle));
  vi.stubGlobal('showSaveFilePicker', picker);
  const { saver, file, text } = saverOf();

  const first = await saver.saveTo({ ...saver.suggestion(), target: 'file' });

  expect(first).toStrictEqual({
    kind: 'saved',
    target: 'file',
    name: 'report.write.html',
  });
  expect(picker.mock.calls[0]?.[0]).toMatchObject({
    suggestedName: 'report.write.html',
  });

  text.value = 'Aspirin, 2 g';
  await saver.save();

  expect(picker).toHaveBeenCalledOnce();
  expect(picked.written).toStrictEqual([
    '<p>Aspirin</p>',
    '<p>Aspirin, 2 g</p>',
  ]);
  expect(file.value).toStrictEqual({
    name: 'report.write.html',
    handle: picked.handle,
    saved: 'Aspirin, 2 g',
  });
});

test('the choice is remembered: the next document goes there without asking', async () => {
  const picked = fakeFile('report.write.html');
  vi.stubGlobal('showSaveFilePicker', () => Promise.resolve(picked.handle));
  const first = saverOf();
  await first.saver.saveTo({ ...first.saver.suggestion(), target: 'file' });

  const next = saverOf();

  expect(next.saver.remembered()).toBe('file');
  await expect(next.saver.save()).resolves.toMatchObject({
    kind: 'saved',
    target: 'file',
  });
});

test('a folder keeps every document, under a name no other file takes', async () => {
  vi.stubGlobal('showDirectoryPicker', vi.fn());
  const { folder, files } = fakeFolder(['report.write.html']);
  const { saver, file } = saverOf({ folder });

  const outcome = await saver.saveTo({
    ...saver.suggestion(),
    target: 'folder',
  });

  expect(outcome).toStrictEqual({
    kind: 'saved',
    target: 'folder',
    name: 'report (2).write.html',
    wanted: 'report.write.html',
  });
  expect(files.get('report (2).write.html')?.written).toStrictEqual([
    '<p>Aspirin</p>',
  ]);
  expect(files.get('report.write.html')?.written).toStrictEqual([]);
  expect(file.value?.name).toBe('report (2).write.html');

  await saver.saveTo({ ...saver.suggestion(), target: 'folder' });

  expect(files.get('report (2).write.html')?.written).toHaveLength(2);
});

test('in this browser, a save replaces the document it is, renamed or not', async () => {
  const documents = memoryDocuments();
  await documents.save('report', 'Someone else’s');
  const { saver, text } = saverOf({ savedDocuments: documents });

  await expect(
    saver.saveTo({ ...saver.suggestion(), target: 'browser' }),
  ).resolves.toStrictEqual({
    kind: 'saved',
    target: 'browser',
    name: 'report (2)',
    wanted: 'report',
  });

  text.value = 'Aspirin, 2 g';
  await saver.save();

  expect(documents.rows.map((row) => [row.name, row.data])).toStrictEqual([
    ['report', 'Someone else’s'],
    ['report (2)', 'Aspirin, 2 g'],
  ]);
});

test('a download each time makes a new copy on every save', async () => {
  const { saver } = saverOf();
  await saver.saveTo({ ...saver.suggestion(), target: 'download' });
  await saver.save();

  expect(
    vi.mocked(downloadBlob).mock.calls.map((call) => call[1]),
  ).toStrictEqual(['report.write.html', 'report.write.html']);
});

test('nothing to save says so, and a refused write says why', async () => {
  const { saver, text, file } = saverOf();
  text.value = '';

  await expect(saver.save()).resolves.toStrictEqual({ kind: 'empty' });

  text.value = 'Aspirin';
  const locked = fakeFile('locked.write.html');
  (
    locked.handle as unknown as { createWritable: () => Promise<never> }
  ).createWritable = () =>
    Promise.reject(new DOMException('Not allowed.', 'NotAllowedError'));
  file.value = { name: 'locked.write.html', handle: locked.handle, saved: '' };

  await expect(saver.save()).resolves.toStrictEqual({
    kind: 'failed',
    name: 'locked.write.html',
    message: 'Not allowed.',
  });
});
