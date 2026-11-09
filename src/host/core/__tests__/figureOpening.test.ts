import { expect, test } from 'vitest';

import { withFigureSource } from '../../../download/core/figureSource.ts';
import { writeArchive } from '../../../storage/core/backupFiles.ts';
import { writeSiteDocument } from '../../../storage/core/siteDocument.ts';
import { readOpenedFigure, readOpenedFile } from '../figureOpening.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

const STATE = { version: 1, value: { plate: { lanes: 3 } } };

test('a figure of the site opens on the state it carries', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: 'tlc',
    href: 'https://tlc.cheminfo.org/',
    data: STATE,
  });

  await expect(readOpenedFigure(svg, 'tlc')).resolves.toStrictEqual({
    kind: 'own',
    state: {
      site: 'tlc',
      href: 'https://tlc.cheminfo.org/',
      data: STATE,
      edited: false,
    },
  });
});

test('a figure of another site belongs on that site, on the host the family knows', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: 'lcao',
    href: 'https://lcao.cheminfo.org/playground?smiles=C',
    data: STATE,
  });

  await expect(readOpenedFigure(svg, 'tlc')).resolves.toStrictEqual({
    kind: 'elsewhere',
    svg,
    destination: {
      site: 'lcao',
      url: 'https://lcao.cheminfo.org/playground?smiles=C',
    },
  });
  await expect(
    readOpenedFigure(svg, 'tlc', { lcao: 'http://localhost:10820' }),
  ).resolves.toMatchObject({
    destination: { url: 'http://localhost:10820/playground?smiles=C' },
  });
});

test('a picture of the site carrying no state, or any other file, is no figure to open', async () => {
  const stateless = await withFigureSource(FIGURE, {
    site: 'tlc',
    href: 'https://tlc.cheminfo.org/',
  });

  await expect(readOpenedFigure(stateless, 'tlc')).resolves.toStrictEqual({
    kind: 'none',
  });
  await expect(readOpenedFigure(FIGURE, 'tlc')).resolves.toStrictEqual({
    kind: 'none',
  });
  await expect(readOpenedFigure('not a picture', 'tlc')).resolves.toStrictEqual(
    { kind: 'none' },
  );
});

const WORKSPACE = { id: 'w1', name: 'Plate', preferences: { lanes: 4 } };

test('a document of the site opens on its figure and the workspace it was saved with', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: 'tlc',
    href: 'https://tlc.cheminfo.org/',
    data: STATE,
  });
  const document = await writeSiteDocument(
    { data: [{ path: 'plate.tlc.svg', content: svg }], preferences: WORKSPACE },
    { site: 'tlc' },
  );

  await expect(readOpenedFile(document, 'tlc')).resolves.toStrictEqual({
    figure: {
      kind: 'own',
      state: {
        site: 'tlc',
        href: 'https://tlc.cheminfo.org/',
        data: STATE,
        edited: false,
      },
    },
    workspace: WORKSPACE,
  });
  await expect(readOpenedFile(new Blob([svg]), 'tlc')).resolves.toStrictEqual({
    figure: await readOpenedFigure(svg, 'tlc'),
  });
});

test("another site's document sends its figure there, without its workspace", async () => {
  const svg = await withFigureSource(FIGURE, {
    site: 'lcao',
    href: 'https://lcao.cheminfo.org/playground?smiles=C',
    data: STATE,
  });
  const document = await writeSiteDocument(
    {
      data: [{ path: 'orbitals.lcao.svg', content: svg }],
      preferences: WORKSPACE,
    },
    { site: 'lcao' },
  );

  await expect(readOpenedFile(document, 'tlc')).resolves.toStrictEqual({
    figure: {
      kind: 'elsewhere',
      svg,
      destination: {
        site: 'lcao',
        url: 'https://lcao.cheminfo.org/playground?smiles=C',
      },
    },
  });
});

test('an archive that is no document, or a document without a figure, holds none', async () => {
  const archive = await writeArchive([{ path: 'notes.txt', content: 'hi' }]);
  const molfile = await writeSiteDocument(
    { data: [{ path: 'conformer.mol', content: 'M  END' }] },
    { site: 'tlc' },
  );

  await expect(readOpenedFile(archive, 'tlc')).resolves.toStrictEqual({
    figure: { kind: 'none' },
  });
  await expect(readOpenedFile(molfile, 'tlc')).resolves.toStrictEqual({
    figure: { kind: 'none' },
  });
});
