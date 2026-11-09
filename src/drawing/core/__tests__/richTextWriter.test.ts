import { expect, test } from 'vitest';

import { parseRichText } from '../richText.ts';
import { writeRichText } from '../richTextWriter.ts';

test('a run in another size is written in braces with its size', () => {
  expect(parseRichText('a {14pt:**big** H_2O} b', false)).toStrictEqual([
    [
      { text: 'a ' },
      { text: 'big', bold: true, size: 14 },
      { text: ' H', size: 14 },
      { text: '2', script: 'sub', size: 14 },
      { text: 'O', size: 14 },
      { text: ' b' },
    ],
  ]);
  // A size no run can take is text.
  expect(parseRichText('{0pt:a}', false)).toStrictEqual([
    [{ text: '{0pt:a}' }],
  ]);
});

test('runs are written as the marks they are read back from', () => {
  const lines = [
    [
      { text: 'x*' },
      { text: '2−', script: 'sup' as const },
      { text: 'n', italic: true },
      { text: 'big', bold: true, size: 14.5 },
    ],
    [{ text: '}{', script: 'sub' as const }],
  ];
  const written = writeRichText(lines);

  expect(written).toBe(String.raw`x\*^{2−}*n{14.5pt:***big**}
_{\}{}`);
  expect(parseRichText(written, false)).toStrictEqual(lines);
});

test('plain text with formulas is written unchanged, for the chemical rules', () => {
  expect(writeRichText([[{ text: 'Ca2+ and SO4--' }]])).toBe('Ca2+ and SO4--');
});
