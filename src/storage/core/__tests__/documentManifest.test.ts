import { expect, test } from 'vitest';

import { writeArchive } from '../backupFiles.ts';
import { readArchiveManifest } from '../documentManifest.ts';
import { writeSiteDocument } from '../siteDocument.ts';

const SAVED_AT = new Date('2026-11-04T08:00:00Z');

test('a saved document says what it is from its manifest alone', async () => {
  const archive = await writeSiteDocument(
    { data: [{ path: 'image.json', content: '{}' }], view: { zoom: 2 } },
    { site: 'image', generator: 'image.cheminfo.org 1.0.0', date: SAVED_AT },
  );

  await expect(readArchiveManifest(archive)).resolves.toStrictEqual({
    format: 'cheminfo',
    version: 2,
    site: 'image',
    generator: 'image.cheminfo.org 1.0.0',
    savedAt: '2026-11-04T08:00:00.000Z',
    data: ['image.json'],
    view: 'view.json',
  });
});

test('a document zipped again inside a folder is still found, the shallowest manifest first', async () => {
  const manifest = {
    format: 'cheminfo',
    version: 2,
    site: 'image',
    savedAt: '',
    data: ['image.json'],
  };
  const archive = await writeArchive([
    { path: 'work/deeper/manifest.json', content: '{"format":"other"}' },
    { path: 'work/manifest.json', content: JSON.stringify(manifest) },
    { path: 'work/image.json', content: '{}' },
  ]);

  await expect(readArchiveManifest(archive)).resolves.toStrictEqual(manifest);
});

test('a ZIP of images, a manifest that is no JSON, and a file that is no ZIP are no document', async () => {
  const images = await writeArchive([
    { path: 'cells/a.png', content: new Uint8Array([137, 80, 78, 71]) },
  ]);
  const foreign = await writeArchive([
    { path: 'manifest.json', content: 'version: 3' },
  ]);

  await expect(readArchiveManifest(images)).resolves.toBeUndefined();
  await expect(readArchiveManifest(foreign)).resolves.toBeUndefined();
  await expect(
    readArchiveManifest(new Blob(['not an archive'])),
  ).resolves.toBeUndefined();
});
