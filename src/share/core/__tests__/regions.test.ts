import { expect, test } from 'vitest';

import {
  SHARE_REGIONS_MESSAGE,
  SHARE_REGIONS_REQUEST,
  isShareRegionsRequest,
  readShareRegions,
} from '../regions.ts';

const BOX = { part: 'controls', x: 10, y: 20, width: 300, height: 400 };

test('the request is recognised, and nothing else is', () => {
  expect(isShareRegionsRequest({ type: SHARE_REGIONS_REQUEST })).toBe(true);
  expect(isShareRegionsRequest({ type: SHARE_REGIONS_MESSAGE })).toBe(false);
  expect(isShareRegionsRequest({ type: 42 })).toBe(false);
  expect(isShareRegionsRequest('hello')).toBe(false);
  expect(isShareRegionsRequest(null)).toBe(false);
});

test('a page reports where its parts are', () => {
  const regions = readShareRegions({
    type: SHARE_REGIONS_MESSAGE,
    regions: [BOX],
  });

  expect(regions).toStrictEqual([BOX]);
});

test('a message from anything else is not a report', () => {
  expect(readShareRegions({ type: 'webpack/hmr' })).toBeNull();
  expect(readShareRegions({ type: SHARE_REGIONS_MESSAGE })).toBeNull();
  expect(readShareRegions(undefined)).toBeNull();
});

test('a box the dialog cannot draw is dropped, and the rest kept', () => {
  const regions = readShareRegions({
    type: SHARE_REGIONS_MESSAGE,
    regions: [
      { ...BOX, width: Number.NaN },
      { ...BOX, part: 7 },
      { ...BOX, part: '' },
      { x: 0, y: 0, width: 1, height: 1 },
      'controls',
      null,
      BOX,
    ],
  });

  expect(regions).toStrictEqual([BOX]);
});
