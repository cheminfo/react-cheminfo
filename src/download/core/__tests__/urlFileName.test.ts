import { expect, test } from 'vitest';

import { urlFileName } from '../urlFileName.ts';

test('the name is the last segment of the path, decoded', () => {
  expect(
    urlFileName(
      'https://huggingface.co/x/resolve/main/sam_encoder.onnx?download=1#top',
    ),
  ).toBe('sam_encoder.onnx');
  expect(urlFileName('https://example.org/images/PI%20Ag%202.tif')).toBe(
    'PI Ag 2.tif',
  );
  expect(urlFileName(new URL('https://example.org/a/b/'))).toBe('b');
});

test('a relative address is read on its own', () => {
  expect(urlFileName('/examples/islets/islet.png')).toBe('islet.png');
  expect(urlFileName('examples/cells.tif')).toBe('cells.tif');
});

test('a path with no segment gives the fallback, a malformed escape is kept', () => {
  expect(urlFileName('https://example.org/', 'image')).toBe('image');
  expect(urlFileName('https://example.org')).toBe('');
  expect(urlFileName('https://example.org/100%zz.png')).toBe('100%zz.png');
});
