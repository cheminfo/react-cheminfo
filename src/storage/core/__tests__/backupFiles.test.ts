import { expect, test } from 'vitest';

import {
  backupFileName,
  isArchive,
  readArchive,
  readJsonFile,
  writeArchive,
} from '../backupFiles.ts';

test('a backup is named after the site and the day it is taken', () => {
  expect(
    backupFileName('draw-cheminfo', 'zip', new Date('2026-11-01T09:30:00Z')),
  ).toBe('draw-cheminfo-backup-2026-11-01.zip');
});

test('files written into an archive come back in order, text and bytes alike', async () => {
  const archive = await writeArchive([
    { path: 'manifest.json', content: '{"version":1}' },
    { path: 'drawings/benzène.svg', content: new Blob(['<svg/>']) },
    { path: 'raw.bin', content: new Uint8Array([0, 1, 255]) },
  ]);

  expect(archive.type).toBe('application/zip');
  await expect(isArchive(archive)).resolves.toBe(true);

  const files = await readArchive(archive);

  expect(files.map((file) => file.path)).toStrictEqual([
    'manifest.json',
    'drawings/benzène.svg',
    'raw.bin',
  ]);
  expect(files[0]?.text()).toBe('{"version":1}');
  expect(files[1]?.text()).toBe('<svg/>');
  expect([...(files[2]?.bytes ?? [])]).toStrictEqual([0, 1, 255]);
});

test('an empty archive is an archive with no files', async () => {
  const archive = await writeArchive([]);

  await expect(isArchive(archive)).resolves.toBe(true);
  await expect(readArchive(archive)).resolves.toStrictEqual([]);
});

test('a file that is not an archive is refused, whatever its name', async () => {
  const notZip = new File(['{"version":1}'], 'backup.zip');

  await expect(isArchive(notZip)).resolves.toBe(false);
  await expect(readArchive(notZip)).rejects.toThrow(
    'This file is not a ZIP archive, so nothing was imported.',
  );
});

test('a JSON backup is parsed, and anything else refused in one sentence', async () => {
  await expect(
    readJsonFile(new Blob(['{"version":2,"rows":[]}'])),
  ).resolves.toStrictEqual({ version: 2, rows: [] });
  await expect(readJsonFile(new Blob(['<svg/>']))).rejects.toThrow(
    'This file is not JSON, so nothing was imported.',
  );
});
