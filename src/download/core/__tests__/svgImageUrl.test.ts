import { expect, test } from 'vitest';

import { svgImageUrl } from '../figurePng.ts';

test('a document holding native MathML is read back from a data URL', () => {
  const markup =
    '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="40" height="20"><math><mn>1</mn></math></foreignObject></svg>';

  const url = svgImageUrl(markup);
  const prefix = 'data:image/svg+xml;charset=utf-8,';

  expect(url.startsWith(prefix)).toBe(true);
  expect(decodeURIComponent(url.slice(prefix.length))).toBe(markup);
});

test('any other document is read back from an object URL', () => {
  const url = svgImageUrl(
    '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>',
  );

  expect(url.startsWith('blob:')).toBe(true);

  URL.revokeObjectURL(url);
});
