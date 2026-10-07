import { expect, test } from 'vitest';

import { figureHtmlMarkup } from '../figureHtmlMarkup.ts';

test('a ground is a filled box with the corner the page gave it', () => {
  const markup = figureHtmlMarkup([
    { kind: 'box', x: 1, y: 2, width: 30, height: 40, radius: 3, fill: '#abc' },
  ]);

  expect(markup).toBe(
    '<rect x="1" y="2" width="30" height="40" rx="3" fill="#abc"/>',
  );
});

test('a dashed line keeps its dashes, and a box with nothing to paint is dropped', () => {
  const markup = figureHtmlMarkup([
    {
      kind: 'box',
      x: 0.5,
      y: 0.5,
      width: 9,
      height: 9,
      stroke: 'rgb(1, 2, 3)',
      dash: [3, 3],
    },
    { kind: 'box', x: 0, y: 0, width: 5, height: 5 },
  ]);

  expect(markup).toBe(
    '<rect x="0.5" y="0.5" width="9" height="9" fill="none"' +
      ' stroke="rgb(1, 2, 3)" stroke-width="1" stroke-dasharray="3 3"/>',
  );
});

test('words are fitted to the width the page drew them at', () => {
  const markup = figureHtmlMarkup([
    {
      kind: 'text',
      text: '3.44',
      x: 10,
      y: 20.123,
      width: 14.5,
      color: 'rgb(0, 0, 0)',
      fontSize: 9,
      fontWeight: '400',
    },
  ]);

  expect(markup).toBe(
    '<text x="10" y="20.12" dominant-baseline="central"' +
      ' textLength="14.5" lengthAdjust="spacingAndGlyphs"' +
      ' fill="rgb(0, 0, 0)" font-size="9px" font-weight="400">3.44</text>',
  );
});

test('a style and a type other than the document’s are written, and the words escaped', () => {
  const markup = figureHtmlMarkup([
    {
      kind: 'text',
      text: 'A < B & "C"',
      x: 0,
      y: 0,
      width: 50,
      color: '#000',
      fontSize: 12,
      fontWeight: '700',
      fontStyle: 'italic',
      fontFamily: '"Courier New", monospace',
    },
  ]);

  expect(markup).toContain(' font-style="italic"');
  expect(markup).toContain(' font-family="&quot;Courier New&quot;, monospace"');
  expect(markup).toContain('>A &lt; B &amp; "C"</text>');
});

test('a faded element fades everything inside it at once', () => {
  const markup = figureHtmlMarkup([
    {
      kind: 'group',
      opacity: 0.28,
      children: [
        { kind: 'box', x: 0, y: 0, width: 10, height: 10, fill: '#fff' },
        { kind: 'drawing', markup: '<svg/>', x: 2, y: 3 },
      ],
    },
  ]);

  expect(markup).toBe(
    '<g opacity="0.28"><rect x="0" y="0" width="10" height="10" fill="#fff"/>' +
      '<g transform="translate(2 3)"><svg/></g></g>',
  );
});
