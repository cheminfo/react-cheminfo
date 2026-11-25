import { expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import type { ExampleCredit } from '../exampleCredit.ts';
import {
  CC0_1,
  COMMONS_WIDTHS,
  PUBLIC_DOMAIN,
  ccBy,
  ccBySa,
  commonsFile,
  exampleCreditText,
} from '../exampleCredit.ts';

const ISLETS: ExampleCredit = {
  author: 'Xiaojun Wang et al.',
  ...ccBy('3.0'),
  page: 'https://commons.wikimedia.org/wiki/File:PP_cells_in_Pancreatic_Islet.png',
};

test('a file of Wikimedia Commons is served whole, or at a width Commons keeps', () => {
  expect(commonsFile('8/8d/PP_cells_in_Pancreatic_Islet.png')).toBe(
    'https://upload.wikimedia.org/wikipedia/commons/8/8d/PP_cells_in_Pancreatic_Islet.png',
  );
  expect(commonsFile('8/8d/PP_cells_in_Pancreatic_Islet.png', 330)).toBe(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/PP_cells_in_Pancreatic_Islet.png/330px-PP_cells_in_Pancreatic_Islet.png',
  );
  expect(COMMONS_WIDTHS).toStrictEqual([330, 500, 960, 1280, 1920]);
});

test('a width Commons keeps no copy at is refused, rather than a broken picture', () => {
  expect(() =>
    commonsFile('8/8d/PP_cells_in_Pancreatic_Islet.png', 331),
  ).toThrow(
    'Wikimedia Commons keeps no copy of PP_cells_in_Pancreatic_Islet.png 331 px wide: ask for 330, 500, 960, 1280, 1920.',
  );
});

test('a TIFF, an SVG or a movie is copied as a picture, under the name Commons gives it', () => {
  expect(commonsFile('9/98/Oeil_de_coccinelle_MEB.tif', 330)).toBe(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Oeil_de_coccinelle_MEB.tif/lossy-page1-330px-Oeil_de_coccinelle_MEB.tif.jpg',
  );
  expect(commonsFile('a/a7/React-icon.svg', 500)).toBe(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/500px-React-icon.svg.png',
  );
  expect(commonsFile('c/c0/Big_Buck_Bunny_4K.webm', 960)).toBe(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Big_Buck_Bunny_4K.webm/960px--Big_Buck_Bunny_4K.webm.jpg',
  );
});

test('each licence is named as Creative Commons names it, with its page', () => {
  expect([CC0_1, ccBy('4.0'), ccBySa('3.0'), PUBLIC_DOMAIN]).toStrictEqual([
    {
      licence: 'CC0 1.0',
      licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    {
      licence: 'CC BY 4.0',
      licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
    {
      licence: 'CC BY-SA 3.0',
      licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
    { licence: 'public domain' },
  ]);
});

test('a credit reads as one line, naming Commons when the page is there', () => {
  expect(exampleCreditText(ISLETS)).toBe(
    'Image: Xiaojun Wang et al., CC BY 3.0, via Wikimedia Commons',
  );
  expect(
    exampleCreditText({
      author: 'Broad Bioimage Benchmark Collection',
      ...CC0_1,
      page: 'https://bbbc.broadinstitute.org/BBBC039',
    }),
  ).toBe('Image: Broad Bioimage Benchmark Collection, CC0 1.0');
});

test('the line is written in the language asked for', async () => {
  await CHROME_CATALOG.load('fr');

  expect(exampleCreditText(ISLETS, 'fr')).toBe(
    'Image : Xiaojun Wang et al., CC BY 3.0, via Wikimedia Commons',
  );
});
