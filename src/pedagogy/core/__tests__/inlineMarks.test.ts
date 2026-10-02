import { expect, test } from 'vitest';

import { parseInlineMarks } from '../inlineMarks.ts';

test('code, strong and emphasis are read in one pass, each keyed by its offset', () => {
  expect(parseInlineMarks('A `[*+]` and **bold `x`** or *it*')).toStrictEqual([
    { kind: 'text', start: 0, text: 'A ' },
    { kind: 'code', start: 2, text: '[*+]' },
    { kind: 'text', start: 8, text: ' and ' },
    {
      kind: 'strong',
      start: 13,
      children: [
        { kind: 'text', start: 15, text: 'bold ' },
        { kind: 'code', start: 20, text: 'x' },
      ],
    },
    { kind: 'text', start: 25, text: ' or ' },
    {
      kind: 'emphasis',
      start: 29,
      children: [{ kind: 'text', start: 30, text: 'it' }],
    },
  ]);
});

test('an asterisk next to whitespace opens nothing, and an unclosed mark is prose', () => {
  expect(parseInlineMarks('2 * 3 * 4')).toStrictEqual([
    { kind: 'text', start: 0, text: '2 * 3 * 4' },
  ]);
  expect(parseInlineMarks('a ` b **c')).toStrictEqual([
    { kind: 'text', start: 0, text: 'a ` b **c' },
  ]);
  expect(parseInlineMarks('')).toStrictEqual([]);
});

test('glossary markers are read only when asked for', () => {
  expect(parseInlineMarks('An [[Anchor|anchors]] here')).toStrictEqual([
    { kind: 'text', start: 0, text: 'An [[Anchor|anchors]] here' },
  ]);
  expect(
    parseInlineMarks('An [[Anchor|anchors]] and *[[ring]]*', {
      glossaryMarkers: true,
    }),
  ).toStrictEqual([
    { kind: 'text', start: 0, text: 'An ' },
    { kind: 'term', start: 3, term: 'anchor', text: 'anchors' },
    { kind: 'text', start: 21, text: ' and ' },
    {
      kind: 'emphasis',
      start: 26,
      children: [{ kind: 'term', start: 27, term: 'ring', text: 'ring' }],
    },
  ]);
});

test('a marker inside a code span stays notation', () => {
  expect(
    parseInlineMarks('`[[a]]` is code', { glossaryMarkers: true }),
  ).toStrictEqual([
    { kind: 'code', start: 0, text: '[[a]]' },
    { kind: 'text', start: 7, text: ' is code' },
  ]);
});

test('a molecular formula is its own mark', () => {
  expect(parseInlineMarks('Caffeine {{C8H10N4O2}} reads 6')).toStrictEqual([
    { kind: 'text', start: 0, text: 'Caffeine ' },
    { kind: 'mf', start: 9, mf: 'C8H10N4O2' },
    { kind: 'text', start: 22, text: ' reads 6' },
  ]);
});

test('a formula is read inside a strong run, and left alone inside a code span', () => {
  expect(parseInlineMarks('**{{H2O}}**')).toStrictEqual([
    {
      kind: 'strong',
      start: 0,
      children: [{ kind: 'mf', start: 2, mf: 'H2O' }],
    },
  ]);
  expect(parseInlineMarks('`{{H2O}}` is notation')).toStrictEqual([
    { kind: 'code', start: 0, text: '{{H2O}}' },
    { kind: 'text', start: 9, text: ' is notation' },
  ]);
});

test('braces that do not close are prose', () => {
  expect(parseInlineMarks('A {{C6H6 with no end')).toStrictEqual([
    { kind: 'text', start: 0, text: 'A {{C6H6 with no end' },
  ]);
});
