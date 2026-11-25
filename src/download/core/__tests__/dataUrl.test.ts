import { expect, test } from 'vitest';

import {
  blobDataUrl,
  bytesDataUrl,
  svgDataUrl,
  svgOfDataUrl,
} from '../dataUrl.ts';

/** An SVG with a character outside ASCII, which base64 must carry as UTF-8. */
const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><text>Δ 1 µm</text></svg>';

test('bytes become a base64 data URL of their type, padded as base64 is', () => {
  expect([
    bytesDataUrl(new Uint8Array([137, 80, 78, 71]), 'image/png'),
    bytesDataUrl(new Uint8Array([255, 254, 253, 252, 251]), 'image/png'),
  ]).toStrictEqual([
    'data:image/png;base64,iVBORw==',
    'data:image/png;base64,//79/Ps=',
  ]);
});

test('a blob is written as a base64 data URL naming its type', async () => {
  const bytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  await expect(
    blobDataUrl(new Blob([bytes], { type: 'image/png' })),
  ).resolves.toBe('data:image/png;base64,iVBORw0KGgo=');
  await expect(blobDataUrl(new Blob(['hi']))).resolves.toBe(
    'data:application/octet-stream;base64,aGk=',
  );
});

test('an SVG is written as base64 and read back as the same text', async () => {
  const url = svgDataUrl(SVG);

  expect(url).toBe(
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0Ps6UIDEgwrVtPC90ZXh0Pjwvc3ZnPg==',
  );
  expect(url).toBe(
    await blobDataUrl(new Blob([SVG], { type: 'image/svg+xml' })),
  );
  expect(svgOfDataUrl(url)).toBe(SVG);
});

test('an SVG holding the characters a URL reserves is read back whole', () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg"><text>#1 & 2</text></svg>';
  const url = svgDataUrl(svg);

  expect(url).toBe(
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0PiMxICYgMjwvdGV4dD48L3N2Zz4=',
  );
  expect(svgOfDataUrl(url)).toBe(svg);
});

test('a percent-encoded SVG is read back, whatever parameters it carries', () => {
  expect(
    svgOfDataUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`),
  ).toBe(SVG);
  expect(svgOfDataUrl('data:image/svg+xml,<svg/>')).toBe('<svg/>');
  expect(
    svgOfDataUrl(`data:image/svg+xml;charset=utf-8;base64,${btoa('<svg/>')}`),
  ).toBe('<svg/>');
});

test('another picture, or a URL that cannot be decoded, holds no SVG', () => {
  expect(svgOfDataUrl('data:image/png;base64,iVBORw0KGgo=')).toBeUndefined();
  expect(svgOfDataUrl('https://example.org/a.svg')).toBeUndefined();
  expect(svgOfDataUrl('data:image/svg+xml;base64,abc')).toBeUndefined();
  expect(svgOfDataUrl('data:image/svg+xml,%E0%A4%A')).toBeUndefined();
});
