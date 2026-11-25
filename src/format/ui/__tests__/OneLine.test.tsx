import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { phrasesOf } from '../../core/phrases.ts';
import { OneLine } from '../OneLine.tsx';

test('a text is split into whole phrases, each after the first carrying its separator, which joined give the text back', () => {
  const text = 'seeds ≥ 6.989 nm · ≥ 23.63 nm²';
  const phrases = phrasesOf(text, ' · ');

  expect(phrases).toStrictEqual([
    { at: 0, text: 'seeds ≥ 6.989 nm' },
    { at: 16, text: ' · ≥ 23.63 nm²' },
  ]);
  expect(phrases.map((phrase) => phrase.text).join('')).toBe(text);
  expect(phrasesOf('1.010 µm/px · typed', ' · ').at(-1)).toStrictEqual({
    at: 11,
    text: ' · typed',
  });
  expect(phrasesOf('PI-Ag_2-2_0010.tif', ' · ')).toStrictEqual([
    { at: 0, text: 'PI-Ag_2-2_0010.tif' },
  ]);
});

test('the line is one, cut with an ellipsis between whole phrases', () => {
  const markup = renderToStaticMarkup(
    <OneLine
      text="PI-Ag_2-2_0010.tif · 2048 × 2048 · 16-bit"
      style={{ color: 'var(--text-muted)' }}
    />,
  );

  expect(markup).toBe(
    '<span style="display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-muted)">' +
      '<span style="display:inline-block;white-space:pre">PI-Ag_2-2_0010.tif</span>' +
      '<span style="display:inline-block;white-space:pre"> · 2048 × 2048</span>' +
      '<span style="display:inline-block;white-space:pre"> · 16-bit</span></span>',
  );
});

test('given two lines, the text wraps after a separator, never inside a phrase, and is cut on its second', () => {
  const markup = renderToStaticMarkup(
    <OneLine text="seeds ≥ 6.989 nm · ≥ 23.63 nm²" lines={2} />,
  );

  expect(markup).toBe(
    '<span style="display:-webkit-box;min-width:0;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;white-space:normal">' +
      '<span style="display:inline-block;white-space:pre">seeds ≥ 6.989 nm</span>' +
      ' · <span style="display:inline-block;white-space:pre">≥ 23.63 nm²</span></span>',
  );
});
