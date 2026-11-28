import { expect, test } from 'vitest';

import { carriedValue } from '../carriedValue.ts';

test('the value of the version the site reads is handed back', () => {
  expect(
    carriedValue(
      { data: { version: 2, value: { spectra: [] } } },
      { version: 2, site: 'uv-vis' },
    ),
  ).toStrictEqual({ spectra: [] });
  expect(
    carriedValue(
      { view: { version: 1, value: 'zoomed' } },
      { version: 1, site: 'plot', part: 'view' },
    ),
  ).toBe('zoomed');
});

test('another version is refused naming the site’s host', () => {
  expect(() =>
    carriedValue(
      { data: { version: 1, value: null } },
      { version: 2, site: 'plot' },
    ),
  ).toThrow('This figure was saved by another version of plot.cheminfo.org.');
  expect(() =>
    carriedValue({}, { version: 1, site: 'nmr', host: 'nmr.example.org' }),
  ).toThrow('This figure was saved by another version of nmr.example.org.');
});

test('a figure carrying nothing is refused in the site’s own words when given', () => {
  expect(() =>
    carriedValue(
      {},
      { version: 1, site: 'uv-vis', missing: 'This holds no spectra to open.' },
    ),
  ).toThrow('This holds no spectra to open.');
});
