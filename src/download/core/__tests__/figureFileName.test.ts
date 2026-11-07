import { expect, test } from 'vitest';

import {
  automaticFileStem,
  figureFileName,
  siteFigureExtension,
  siteFigureName,
} from '../figureFileName.ts';
import { withFigureSource } from '../figureSource.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

test('a site’s figure ends in the site’s own extension, once', () => {
  expect(siteFigureExtension('lcao')).toBe('.lcao.svg');
  expect(siteFigureName('benzene', '3d')).toBe('benzene.3d.svg');
  expect(siteFigureName('benzene.3d.svg', '3d')).toBe('benzene.3d.svg');
  expect(siteFigureName('a/b', 'tlc')).toBe('a-b.tlc.svg');
  expect(siteFigureName('', 'glassware')).toBe('glassware.glassware.svg');
});

test('an SVG is named after the site it says drew it, and plainly otherwise', async () => {
  const sourced = await withFigureSource(FIGURE, {
    site: 'tlc',
    href: 'https://tlc.cheminfo.org/',
  });

  expect(figureFileName('plate', sourced)).toBe('plate.tlc.svg');
  expect(figureFileName('plate', FIGURE)).toBe('plate.svg');
});

test('a file saved without a name is named after what it holds and the minute', () => {
  expect(automaticFileStem('apparatus', new Date(2026, 10, 7, 9, 5))).toBe(
    'apparatus-2026-11-07-0905',
  );
  expect(automaticFileStem('plate', new Date(2027, 0, 31, 23, 59))).toBe(
    'plate-2027-01-31-2359',
  );
});
