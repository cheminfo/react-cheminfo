import { expect, test } from 'vitest';

import { withFigureReferents } from '../figureReferents.ts';
import { labelAttributes } from '../labels.ts';
import { cropFigureToBox, referentPicture } from '../referentPicture.ts';
import type { FigureReferent } from '../types.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="300pt" height="150pt" viewBox="0 0 400 200"><rect width="400" height="200"/></svg>';

const AMIDE: FigureReferent = {
  key: 'amide',
  box: { x: 100, y: 50, width: 50, height: 25 },
  members: [
    { row: 'me', preview: '<svg viewBox="0 0 9 9"><text>Me</text></svg>' },
    { row: 'et' },
  ],
};

test('a referent is cut out of its figure, margin included, at the scale drawn', () => {
  expect(
    cropFigureToBox(FIGURE, AMIDE.box ?? { x: 0, y: 0, width: 1, height: 1 }),
  ).toBe(
    '<svg xmlns="http://www.w3.org/2000/svg" width="43.5pt" height="24.75pt" viewBox="96 46 58 33"><rect width="400" height="200"/></svg>',
  );
});

test('the cut-out is a picture: none of the metadata of its figure goes with it', () => {
  const svg = withFigureReferents(
    FIGURE.replace(
      '<rect',
      '<metadata><cd:document>{}</cd:document></metadata><rect',
    ),
    { referents: [AMIDE], series: [] },
  );

  expect(referentPicture(svg, AMIDE)).toBe(
    '<svg xmlns="http://www.w3.org/2000/svg" width="43.5pt" height="24.75pt" viewBox="96 46 58 33"><rect width="400" height="200"/></svg>',
  );
});

test('the cut-out leaves out the compound numbers, the host shows them beside it', () => {
  const svg = FIGURE.replace(
    '</svg>',
    `<text x="125" y="90"${labelAttributes({ key: 'amide' })}>1</text><text x="0" y="9">kept</text></svg>`,
  );

  expect(referentPicture(svg, AMIDE)).toBe(
    '<svg xmlns="http://www.w3.org/2000/svg" width="43.5pt" height="24.75pt" viewBox="96 46 58 33"><rect width="400" height="200"/><text x="0" y="9">kept</text></svg>',
  );
});

test('a figure with neither width nor viewBox units is cut in its own units', () => {
  expect(
    cropFigureToBox('<svg><rect/></svg>', { x: 0, y: 0, width: 10, height: 5 }),
  ).toBe(
    '<svg viewBox="-0.8 -0.8 11.6 6.6" width="11.6" height="6.6"><rect/></svg>',
  );
});

test('a member shows its own preview, else the generic structure', () => {
  expect(referentPicture(FIGURE, AMIDE, 'me')).toBe(
    '<svg viewBox="0 0 9 9"><text>Me</text></svg>',
  );
  expect(referentPicture(FIGURE, AMIDE, 'et')).toBe(
    referentPicture(FIGURE, AMIDE),
  );
});

test('a referent drawn nowhere it can be found has no picture', () => {
  expect(referentPicture(FIGURE, { key: 'token' })).toBeUndefined();
});
