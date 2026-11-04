import { expect, test } from 'vitest';

import { readArchive, writeArchive } from '../backupFiles.ts';
import {
  readSiteDocument,
  siteDocumentExtension,
  siteDocumentName,
  writeSiteDocument,
} from '../siteDocument.ts';

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg"><title>Benzene</title></svg>';

test('a document holds its data at the root, and says what else it holds', async () => {
  const archive = await writeSiteDocument(
    {
      data: [{ path: 'drawing.svg', content: SVG }],
      view: { zoom: 2 },
      workspace: {
        id: 'w1',
        name: 'Teaching',
        preferences: { panels: ['glassware'] },
      },
      attachments: [{ path: 'nmr/1h.jdx', content: '##TITLE=1H' }],
    },
    {
      site: 'draw',
      generator: 'draw.cheminfo.org 1.4.0',
      date: new Date('2026-11-04T08:00:00Z'),
    },
  );

  const files = await readArchive(archive);

  expect(files.map((file) => file.path)).toStrictEqual([
    'manifest.json',
    'drawing.svg',
    'view.json',
    'workspace.json',
    'files/nmr/1h.jdx',
  ]);
  expect(JSON.parse(files[0]?.text() ?? '')).toStrictEqual({
    format: 'cheminfo-document',
    version: 1,
    site: 'draw',
    generator: 'draw.cheminfo.org 1.4.0',
    savedAt: '2026-11-04T08:00:00.000Z',
    data: ['drawing.svg'],
    view: 'view.json',
    workspace: 'workspace.json',
    attachments: ['nmr/1h.jdx'],
  });
  expect(files[1]?.text()).toBe(SVG);
});

test('a document is read back whole', async () => {
  const archive = await writeSiteDocument(
    {
      data: [{ path: 'drawing.svg', content: SVG }],
      view: { zoom: 2, tool: 'bond' },
      workspace: { id: 'w1', name: 'Teaching', preferences: { a: 1 } },
      attachments: [{ path: 'photo.png', content: new Uint8Array([1, 2]) }],
    },
    { site: 'draw', date: new Date('2026-11-04T08:00:00Z') },
  );

  const document = await readSiteDocument(archive, 'draw');

  expect(document.site).toBe('draw');
  expect(document.savedAt).toBe('2026-11-04T08:00:00.000Z');
  expect(document.data.map((file) => [file.path, file.text()])).toStrictEqual([
    ['drawing.svg', SVG],
  ]);
  expect(document.view).toStrictEqual({ zoom: 2, tool: 'bond' });
  expect(document.workspace).toStrictEqual({
    id: 'w1',
    name: 'Teaching',
    preferences: { a: 1 },
  });
  expect(document.attachments.map((file) => file.path)).toStrictEqual([
    'photo.png',
  ]);
  expect([...(document.attachments[0]?.bytes ?? [])]).toStrictEqual([1, 2]);
});

test('a document of data alone carries no view and no workspace', async () => {
  const archive = await writeSiteDocument(
    { data: [{ path: 'drawing.svg', content: SVG }] },
    { site: 'draw' },
  );

  const document = await readSiteDocument(archive, 'draw');

  expect(document.view).toBeUndefined();
  expect(document.workspace).toBeUndefined();
  expect(document.attachments).toStrictEqual([]);

  const files = await readArchive(archive);

  expect(files.map((file) => file.path)).toStrictEqual([
    'manifest.json',
    'drawing.svg',
  ]);
});

test('a document zipped again inside a folder still opens', async () => {
  const original = await readArchive(
    await writeSiteDocument(
      { data: [{ path: 'drawing.svg', content: SVG }], view: { zoom: 3 } },
      { site: 'draw' },
    ),
  );
  const rezipped = await writeArchive(
    original.map((file) => ({
      path: `Downloads/benzene/${file.path}`,
      content: file.bytes,
    })),
  );

  const document = await readSiteDocument(rezipped, 'draw');

  expect(document.data[0]?.text()).toBe(SVG);
  expect(document.view).toStrictEqual({ zoom: 3 });
});

test("another site's document, an archive of anything else and a lost data file are refused", async () => {
  const theirs = await writeSiteDocument(
    { data: [{ path: 'conformer.mol', content: 'M  END' }] },
    { site: '3d' },
  );

  await expect(readSiteDocument(theirs, 'draw')).rejects.toThrow(
    'This document was saved by 3d, so it does not open here.',
  );

  const backup = await writeArchive([
    { path: 'manifest.json', content: '{"generator":"draw.cheminfo.org"}' },
  ]);

  await expect(readSiteDocument(backup, 'draw')).rejects.toThrow(
    'This archive holds no saved document, so nothing was opened.',
  );

  const emptied = await writeArchive([
    {
      path: 'manifest.json',
      content: JSON.stringify({
        format: 'cheminfo-document',
        site: 'draw',
        data: ['drawing.svg'],
      }),
    },
  ]);

  await expect(readSiteDocument(emptied, 'draw')).rejects.toThrow(
    'This document has lost its data, so nothing was opened.',
  );
});

test('a view or a workspace that does not read costs nothing but itself', async () => {
  const archive = await writeArchive([
    {
      path: 'manifest.json',
      content: JSON.stringify({
        format: 'cheminfo-document',
        site: 'draw',
        data: ['drawing.svg'],
        view: 'view.json',
        workspace: 'workspace.json',
      }),
    },
    { path: 'drawing.svg', content: SVG },
    { path: 'view.json', content: '{broken' },
    { path: 'workspace.json', content: '{"format":"cheminfo-workspace"}' },
  ]);

  const document = await readSiteDocument(archive, 'draw');

  expect(document.data).toHaveLength(1);
  expect(document.view).toBeUndefined();
  expect(document.workspace).toBeUndefined();
});

test('a data file may not take a name the document keeps for itself', async () => {
  await expect(
    writeSiteDocument(
      { data: [{ path: 'view.json', content: '{}' }] },
      { site: 'draw' },
    ),
  ).rejects.toThrow('view.json is a name the document keeps for itself.');
  await expect(
    writeSiteDocument({ data: [] }, { site: 'draw' }),
  ).rejects.toThrow('A document holds at least one data file.');
});

test("a document is named after its stem and its site's extension", () => {
  expect(siteDocumentName('benzene', 'draw')).toBe('benzene.draw.zip');
  expect(siteDocumentName('a/b: c', 'draw')).toBe('a-b c.draw.zip');
  expect(siteDocumentName('', 'draw')).toBe('draw.draw.zip');
  expect(siteDocumentExtension('periodic-table')).toBe('.periodic-table.zip');
});
