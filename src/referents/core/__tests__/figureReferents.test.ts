import { expect, test } from 'vitest';

import {
  FIGURE_SOURCE_NAMESPACE,
  readFigureSource,
  withFigureSource,
} from '../../../download/core/figureSource.ts';
import {
  FIGURE_REFERENTS_NAMESPACE,
  readFigureReferents,
  withFigureReferents,
  withoutFigureReferents,
} from '../figureReferents.ts';
import type { FigureReferents } from '../types.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><rect width="40" height="20"/></svg>';

const REFERENTS: FigureReferents = {
  referents: [
    {
      key: 'k1',
      kind: 'compound',
      name: 'aldehyde',
      box: { x: 1, y: 2, width: 10, height: 8 },
      idCode: 'gCi@DDfZ@@',
      smiles: 'O=Cc1ccccc1',
      mf: 'C7H6O',
    },
    {
      key: 'k2',
      series: 's1',
      members: [
        {
          row: 'r1',
          mf: 'C2H6',
          preview: '<svg><text>R &amp; Me</text></svg>',
        },
      ],
    },
  ],
  series: [
    { key: 's1', columns: ['R1'], rows: [{ id: 'r1', values: { R1: 'Me' } }] },
  ],
};

test('referents ride in the metadata, and read back unchanged', () => {
  const svg = withFigureReferents(FIGURE, REFERENTS);

  expect(
    svg.startsWith(
      `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><metadata><cheminfo:referents xmlns:cheminfo="${FIGURE_REFERENTS_NAMESPACE}">{`,
    ),
  ).toBe(true);
  expect(svg).not.toContain('<svg><text>');
  expect(readFigureReferents(svg)).toStrictEqual(REFERENTS);
});

test('they sit beside the source, and each is written over its own kind', async () => {
  const sourced = await withFigureSource(FIGURE, {
    site: 'draw',
    href: 'https://draw.cheminfo.org/',
  });
  const once = withFigureReferents(sourced, REFERENTS);
  const twice = withFigureReferents(once, {
    referents: [{ key: 'k9' }],
    series: [],
  });

  expect(twice.match(/<metadata>/g)).toHaveLength(1);
  expect(twice).toContain(FIGURE_SOURCE_NAMESPACE);
  expect(readFigureSource(twice)).toStrictEqual({
    site: 'draw',
    href: 'https://draw.cheminfo.org/',
  });
  expect(readFigureReferents(twice)).toStrictEqual({
    referents: [{ key: 'k9' }],
    series: [],
  });
});

test('a figure numbering nothing carries no referents, and loses them', () => {
  const svg = withFigureReferents(FIGURE, REFERENTS);

  expect(withFigureReferents(svg, { referents: [], series: [] })).toBe(FIGURE);
  expect(withoutFigureReferents(svg)).toBe(FIGURE);
  expect(readFigureReferents(FIGURE)).toBeUndefined();
});

test('what does not read is left out', () => {
  const json = JSON.stringify({
    referents: [
      { key: '' },
      { key: 'ok', box: { x: 0, y: 0, width: -1, height: 2 }, mf: 3 },
      'nonsense',
      { key: 'm', members: [{ row: 'r1' }, { preview: '<svg/>' }] },
    ],
    series: [
      {
        key: 's',
        columns: ['R1', 4],
        rows: [{ id: 'a', values: { R1: 'Et', R9: 'x' } }, { values: {} }],
      },
    ],
  }).replaceAll('<', '&lt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><metadata><r:referents xmlns:r="${FIGURE_REFERENTS_NAMESPACE}">${json}</r:referents></metadata></svg>`;

  expect(readFigureReferents(svg)).toStrictEqual({
    referents: [{ key: 'ok' }, { key: 'm', members: [{ row: 'r1' }] }],
    series: [
      { key: 's', columns: ['R1'], rows: [{ id: 'a', values: { R1: 'Et' } }] },
    ],
  });
});

test('broken JSON reads as nothing', () => {
  const svg = `<svg><metadata><cheminfo:referents xmlns:cheminfo="${FIGURE_REFERENTS_NAMESPACE}">{oops</cheminfo:referents></metadata></svg>`;

  expect(readFigureReferents(svg)).toBeUndefined();
});
