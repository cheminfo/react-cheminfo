import { expect, test } from 'vitest';

import { withFigureSource } from '../../../download/core/figureSource.ts';
import {
  figureDestination,
  forwardedFigureDocument,
} from '../figureForward.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

function drawnBy(site: string, href: string): Promise<string> {
  return withFigureSource(FIGURE, { site, href });
}

test('a figure of another site of the family goes to the page it was drawn on', async () => {
  const svg = await drawnBy(
    'lcao',
    'https://lcao.cheminfo.org/playground?smiles=C&orbital=3',
  );

  expect(figureDestination(svg, '3d')).toStrictEqual({
    site: 'lcao',
    url: 'https://lcao.cheminfo.org/playground?smiles=C&orbital=3',
  });
});

test('a figure of the site it was dropped on, or of none, goes nowhere', async () => {
  const own = await drawnBy('3d', 'https://3d.cheminfo.org/?smiles=CC');

  expect(figureDestination(own, '3d')).toBeUndefined();
  expect(figureDestination(FIGURE, '3d')).toBeUndefined();
  expect(
    figureDestination(await drawnBy('nowhere', 'https://example.com/'), '3d'),
  ).toBeUndefined();
});

test('the page opens on the host the family knows, whatever origin the file writes', async () => {
  const svg = await drawnBy('plate', 'https://evil.example/?lanes=3');

  expect(figureDestination(svg, 'draw')?.url).toBe(
    'https://plate.cheminfo.org/?lanes=3',
  );
  expect(
    figureDestination(svg, 'draw', { plate: 'http://localhost:11106' })?.url,
  ).toBe('http://localhost:11106/?lanes=3');
});

test('a figure saved under a name its site has left goes to the site it is now', async () => {
  const svg = await drawnBy('tlc', 'https://tlc.cheminfo.org/?example=flash');

  expect(figureDestination(svg, 'draw')).toStrictEqual({
    site: 'plate',
    url: 'https://plate.cheminfo.org/?example=flash',
  });
  expect(
    figureDestination(svg, 'draw', { plate: 'http://localhost:11106' })?.url,
  ).toBe('http://localhost:11106/?example=flash');
  expect(figureDestination(svg, 'plate')).toBeUndefined();
});

test('the figure is handed over on the figure input, as an SVG', () => {
  expect(forwardedFigureDocument(FIGURE)).toStrictEqual({
    document: 'forwarded-figure',
    items: [{ key: 'figure', kind: 'image.svg', value: { svg: FIGURE } }],
  });
});
