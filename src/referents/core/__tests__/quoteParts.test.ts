import { expect, test } from 'vitest';

import { quoteParts } from '../quoteParts.ts';

test('an NMR description reads as runs under their marks', () => {
  expect(
    quoteParts(
      '<sup>1</sup>H NMR (400 MHz, CDCl<sub>3</sub>) δ 1.24 (t, <i>J</i> = 7.6 Hz, 3H).',
    ),
  ).toStrictEqual([
    { text: '1', marks: ['superscript'] },
    { text: 'H NMR (400 MHz, CDCl', marks: [] },
    { text: '3', marks: ['subscript'] },
    { text: ') δ 1.24 (t, ', marks: [] },
    { text: 'J', marks: ['italic'] },
    { text: ' = 7.6 Hz, 3H).', marks: [] },
  ]);
});

test('nested marks are all kept, and a mark closed twice only once', () => {
  expect(quoteParts('<b><em>J</em></b></b>1')).toStrictEqual([
    { text: 'J', marks: ['bold', 'italic'] },
    { text: '1', marks: [] },
  ]);
});

test('any other tag is dropped and its text kept, entities decoded', () => {
  expect(
    quoteParts(
      '<script>alert(1)</script><span style="x">a &amp; b</span><img src=x onerror=y>&#x110000;',
    ),
  ).toStrictEqual([{ text: 'alert(1)a & b&#x110000;', marks: [] }]);
});
