import { expect, test } from 'vitest';

import { dataUriBytes, rasterSvgMarkup } from '../exportImage.ts';

test('an image is embedded at its own size', () => {
  expect(
    rasterSvgMarkup('data:image/png;base64,AAAA', { width: 640, height: 480 }),
  ).toBe(
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="640" height="480" viewBox="0 0 640 480"><image width="640" height="480" href="data:image/png;base64,AAAA" xlink:href="data:image/png;base64,AAAA"/></svg>',
  );
});

test('quotes in the address cannot close the attribute', () => {
  expect(rasterSvgMarkup('a"b&c', { width: 1, height: 1 })).toContain(
    'href="a&quot;b&amp;c"',
  );
});

test('a base64 data URI decodes to its bytes', () => {
  expect(
    Array.from(dataUriBytes('data:image/png;base64,iVBORw==')),
  ).toStrictEqual([0x89, 0x50, 0x4e, 0x47]);
});

test('a data URI that is not base64 is refused', () => {
  expect(() => dataUriBytes('data:text/plain,hello')).toThrow(
    'Expected a base64 data URI.',
  );
});
