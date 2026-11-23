/**
 * Where the document on screen is: saved nowhere, in this browser, in the
 * site's folder — and in which folder below it — a file picked elsewhere on
 * this computer, or a download the page has lost track of.
 */

import { expect, test } from 'vitest';

import { documentPlace, placeKind } from '../documentPlace.ts';
import type { SiteFolder } from '../siteFolderTypes.ts';

function fileHandle(name: string): FileSystemFileHandle {
  return { kind: 'file', name } as unknown as FileSystemFileHandle;
}

function folderHolding(
  handle: FileSystemFileHandle,
  path: string[] | null,
): SiteFolder {
  const root = {
    kind: 'directory',
    name: 'Course',
    resolve: (other: FileSystemFileHandle) =>
      Promise.resolve(other === handle ? path : null),
  };
  return {
    current: () => Promise.resolve(root),
  } as unknown as SiteFolder;
}

test('a document never saved is a draft', async () => {
  const place = await documentPlace(null);

  expect(place).toStrictEqual({ kind: 'draft' });
  expect(placeKind(place)).toBe('nowhere');
});

test('a document saved in this browser is there under its name', async () => {
  const place = await documentPlace({
    name: 'Hybridation',
    savedId: 'a1',
    saved: 'text',
  });

  expect(place).toStrictEqual({ kind: 'browser', name: 'Hybridation' });
  expect(placeKind(place)).toBe('browser');
});

test('a download is no longer anywhere the page knows', async () => {
  const place = await documentPlace({ name: 'notes.write.html', saved: 'x' });

  expect(place).toStrictEqual({ kind: 'download', name: 'notes.write.html' });
  expect(placeKind(place)).toBe('nowhere');
});

test('a file of the folder says the folders it is in', async () => {
  const handle = fileHandle('notes.write.html');
  const folder = folderHolding(handle, [
    'Week 3',
    'Orbitals',
    'notes.write.html',
  ]);

  const place = await documentPlace({ name: 'x', handle, saved: 'x' }, folder);

  expect(place).toStrictEqual({
    kind: 'folder',
    name: 'notes.write.html',
    folder: ['Course', 'Week 3', 'Orbitals'],
  });
  expect(placeKind(place)).toBe('computer');
});

test('a file outside the folder is a file of this computer', async () => {
  const handle = fileHandle('elsewhere.write.html');
  const folder = folderHolding(fileHandle('other'), null);

  const place = await documentPlace({ name: 'x', handle, saved: 'x' }, folder);

  expect(place).toStrictEqual({ kind: 'file', name: 'elsewhere.write.html' });
  expect(placeKind(place)).toBe('computer');
});

test('a file with no folder chosen is a file of this computer', async () => {
  const handle = fileHandle('picked.write.html');

  const place = await documentPlace({ name: 'x', handle, saved: 'x' });

  expect(place).toStrictEqual({ kind: 'file', name: 'picked.write.html' });
});
