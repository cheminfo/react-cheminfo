import { expect, test } from 'vitest';

import { withFigureSource } from '../../../download/core/figureSource.ts';
import { readOpenedFigure } from '../figureOpening.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

const STATE = { version: 1, value: { plate: { lanes: 3 } } };

test('a figure of the site opens on the state it carries', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: 'tlc',
    href: 'https://tlc.cheminfo.org/',
    state: STATE,
  });

  await expect(readOpenedFigure(svg, 'tlc')).resolves.toStrictEqual({
    kind: 'own',
    state: {
      site: 'tlc',
      href: 'https://tlc.cheminfo.org/',
      ...STATE,
      edited: false,
    },
  });
});

test('a figure of another site belongs on that site, on the host the family knows', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: 'lcao',
    href: 'https://lcao.cheminfo.org/playground?smiles=C',
    state: STATE,
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
