// @vitest-environment jsdom
import { expect, test } from 'vitest';

import { assignPdfFonts } from '../pdfFonts.ts';

function parsed(svg: string): Element {
  return new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
}

test('a Latin-1 text in Times or Courier keeps the PDF’s own font', () => {
  const root = parsed(
    '<svg xmlns="http://www.w3.org/2000/svg"><text font-family="Times New Roman">CH3</text><g font-family="monospace"><text>OH</text></g></svg>',
  );

  expect([...assignPdfFonts(root)]).toStrictEqual([]);

  const families: Array<string | null> = [];
  for (const text of root.querySelectorAll('text')) {
    families.push(text.getAttribute('font-family'));
  }

  expect(families).toStrictEqual(['times', 'courier']);
});

test('any other text is set in Arimo, in the faces its runs ask for', () => {
  const root = parsed(
    '<svg xmlns="http://www.w3.org/2000/svg"><text font-family="Times">Δ<tspan font-weight="bold" font-family="Arial">H</tspan></text><text font-family="Helvetica" font-style="italic">k<tspan font-weight="700">2</tspan></text></svg>',
  );

  expect([...assignPdfFonts(root)].toSorted()).toStrictEqual([
    'bold',
    'bolditalic',
    'italic',
    'normal',
  ]);

  const texts = root.querySelectorAll('text');

  expect(texts[0]?.getAttribute('font-family')).toBe('Arimo');
  expect(texts[1]?.getAttribute('font-family')).toBe('Arimo');
  expect(root.querySelectorAll('tspan[font-family]')).toHaveLength(0);
});
