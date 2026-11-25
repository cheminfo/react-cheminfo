import { expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { LANGUAGES } from '../../../i18n/core/languages.ts';
import type { CreditId } from '../credits.ts';
import { creditOf, credits } from '../credits.ts';

// The works image.cheminfo.org stands on, each in the registry with its licence.
const IMAGE_WORKS = [
  'image-js',
  'tiff',
  'fast-png',
  'zod',
  'culori',
  'pragmatic-drag-and-drop',
  'mediabunny',
  'onnxruntime-web',
  'micro-sam',
  'slimsam',
  'arraybuffer-xml-parser',
] as const satisfies readonly CreditId[];

test('the image works are credited under the licences their authors chose', () => {
  expect(
    credits(IMAGE_WORKS).map((entry) => [
      entry.id,
      entry.license,
      entry.own ?? false,
    ]),
  ).toStrictEqual([
    ['image-js', 'MIT', true],
    ['tiff', 'MIT', true],
    ['fast-png', 'MIT', true],
    ['zod', 'MIT', false],
    ['culori', 'MIT', false],
    ['pragmatic-drag-and-drop', 'Apache-2.0', false],
    ['mediabunny', 'MPL-2.0', false],
    ['onnxruntime-web', 'MIT', false],
    ['micro-sam', 'MIT AND CC-BY-4.0', false],
    ['slimsam', 'Apache-2.0', false],
    ['arraybuffer-xml-parser', 'MIT', true],
  ]);
  // A build lists them under these names, which are then not written twice.
  expect(creditOf('pragmatic-drag-and-drop')?.packageName).toBe(
    '@atlaskit/pragmatic-drag-and-drop',
  );
});

test('the image works say what they do in every language of the family', async () => {
  const catalogs = await Promise.all(
    LANGUAGES.map((language) => CHROME_CATALOG.load(language)),
  );
  const english = credits(IMAGE_WORKS).map((entry) => entry.description);

  expect(
    IMAGE_WORKS.map((id) => catalogs[0]?.[`credits.${id}.description`]),
  ).toStrictEqual(english);

  // Every other language writes each one in its own words.
  const untranslated: string[] = [];
  for (let index = 1; index < LANGUAGES.length; index++) {
    for (let work = 0; work < IMAGE_WORKS.length; work++) {
      const key = `credits.${IMAGE_WORKS[work]}.description`;
      if ([undefined, '', english[work]].includes(catalogs[index]?.[key])) {
        untranslated.push(`${LANGUAGES[index]} ${key}`);
      }
    }
  }

  expect(untranslated).toStrictEqual([]);
});

test('culori is credited for the colours the objects are told apart by', () => {
  expect(credits(['culori'])).toStrictEqual([
    {
      id: 'culori',
      name: 'culori',
      href: 'https://github.com/Evercoder/culori',
      packageName: 'culori',
      description:
        'converts the colours picked in OKLCH into the sRGB a screen paints.',
      license: 'MIT',
    },
  ]);
});
