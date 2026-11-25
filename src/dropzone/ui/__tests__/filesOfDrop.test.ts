import { expect, test } from 'vitest';

import { filesOfDrop } from '../filesOfDrop.ts';

import {
  dropOf,
  fileEntry,
  folderEntry,
  unreadableFolder,
} from './dropEntries.ts';

test('a dropped folder gives its files, named by their path in the drop', async () => {
  const { files, unread } = await filesOfDrop(
    dropOf([
      fileEntry('/x.png'),
      folderEntry('/a', [
        [
          fileEntry('/a/b.tif'),
          folderEntry('/a/c', [[fileEntry('/a/c/d.png')]]),
        ],
      ]),
    ]),
  );

  expect(files.map((file) => [file.name, file.type])).toStrictEqual([
    ['x.png', 'image/png'],
    ['a/b.tif', 'image/tiff'],
    ['a/c/d.png', 'image/png'],
  ]);
  expect(unread).toBeUndefined();
  await expect(files[1]?.text()).resolves.toBe('b.tif');
});

test('a folder read in two batches gives the files of both', async () => {
  const { files } = await filesOfDrop(
    dropOf([
      folderEntry('/a', [[fileEntry('/a/b.tif')], [fileEntry('/a/e.tif')]]),
    ]),
  );

  expect(files.map((file) => file.name)).toStrictEqual(['a/b.tif', 'a/e.tif']);
});

test('the system files a folder carries are left out', async () => {
  const { files } = await filesOfDrop(
    dropOf([
      folderEntry('/a', [
        [
          fileEntry('/a/b.tif'),
          fileEntry('/a/.DS_Store'),
          fileEntry('/a/Thumbs.db'),
        ],
      ]),
    ]),
  );

  expect(files.map((file) => file.name)).toStrictEqual(['a/b.tif']);
});

test('a folder the browser cannot read, or one holding no file, is the drop as the browser listed it', async () => {
  const unread = await filesOfDrop(
    dropOf([fileEntry('/x.png'), unreadableFolder('/a')]),
  );
  const empty = await filesOfDrop(dropOf([folderEntry('/e', [])]));

  expect([
    unread.files.map((file) => [file.name, file.size]),
    unread.unread?.name,
    empty.files.map((file) => [file.name, file.size]),
    empty.unread,
  ]).toStrictEqual([
    [
      ['x.png', 5],
      ['a', 0],
    ],
    'NotReadableError',
    [['e', 0]],
    undefined,
  ]);
});

test('any failure of the walk settles the drop with its own list, and says why', async () => {
  const broken = {
    items: [
      {
        kind: 'file',
        webkitGetAsEntry: () => {
          throw new TypeError('not a drop');
        },
        getAsFile: () => null,
      },
    ],
    files: [],
  } as unknown as DataTransfer;

  const { files, unread } = await filesOfDrop(broken);

  expect([files, unread?.message]).toStrictEqual([[], 'not a drop']);
});
