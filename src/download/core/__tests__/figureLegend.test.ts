import { expect, test } from 'vitest';

import { figureLegendMarkup } from '../figureLegend.ts';

const CARD = { width: 120, height: 60, radius: 10 };

test('a key with nothing on it is an empty card', () => {
  expect(figureLegendMarkup({ card: CARD, marks: [], texts: [] })).toBe('');
});

test('the ground is drawn inside its own line, so the line is not clipped', () => {
  const markup = figureLegendMarkup({
    card: { ...CARD, background: '#fefdfc', border: '#112233', borderWidth: 2 },
    marks: [],
    texts: [],
  });

  expect(markup).toBe(
    '<rect x="1" y="1" width="118" height="58" rx="10"' +
      ' fill="#fefdfc" stroke="#112233" stroke-width="2"/>',
  );
});

test('each mark is placed where it sat on the card', () => {
  const markup = figureLegendMarkup({
    card: CARD,
    marks: [
      { markup: '<svg><circle/></svg>', x: 8, y: 24 },
      { markup: '<svg><rect/></svg>', x: 8, y: 42.25 },
    ],
    texts: [],
  });

  expect(markup).toBe(
    '<g transform="translate(8 24)"><svg><circle/></svg></g>' +
      '<g transform="translate(8 42.25)"><svg><rect/></svg></g>',
  );
});

test('a run of words is set on the middle of its own line', () => {
  const markup = figureLegendMarkup({
    card: CARD,
    marks: [],
    texts: [
      {
        text: 'setosa (50)',
        x: 26,
        y: 30,
        color: '#445566',
        fontSize: 12,
        fontWeight: '600',
      },
    ],
  });

  expect(markup).toBe(
    '<text x="26" y="30" dominant-baseline="central" fill="#445566"' +
      ' font-size="12px" font-weight="600">setosa (50)</text>',
  );
});

test('a label carrying markup travels as the words it is', () => {
  const markup = figureLegendMarkup({
    card: CARD,
    marks: [],
    texts: [{ text: 'a < b & "c"', x: 0, y: 0 }],
  });

  expect(markup).toBe(
    '<text x="0" y="0" dominant-baseline="central">a &lt; b &amp; "c"</text>',
  );
});

test('an empty run is left out rather than written as an empty line', () => {
  const markup = figureLegendMarkup({
    card: CARD,
    marks: [],
    texts: [{ text: '', x: 0, y: 0 }],
  });

  expect(markup).toBe('');
});
