import { expect, test } from 'vitest';

import { FAMILY_TOKEN_VALUES } from '../../../tokens/core/familyTokens.ts';
import {
  parallelInkFrom,
  readParallelInk,
  readParallelTokens,
} from '../parallelInk.ts';

test('the inks fall back to the family s own values off the page', () => {
  const ink = readParallelInk(null);

  expect(ink.hover).toBe(FAMILY_TOKEN_VALUES['--text']);
  expect(ink.line).toBe(FAMILY_TOKEN_VALUES['--text-muted']);
  expect(ink.axis).toBe(FAMILY_TOKEN_VALUES['--text-muted']);
  // A site that declares no accent still singles a row out, in its ink.
  expect(ink.selection).toBe(FAMILY_TOKEN_VALUES['--text']);
  expect(ink.halo).toBe('rgba(255, 255, 255, 0.85)');
  expect(ink.includedAlpha).toBe(0.35);
});

test('what the caller insists on wins over every token', () => {
  const ink = readParallelInk(null, {
    selection: '#ff0000',
    excluded: '#eeeeee',
    includedAlpha: 0.9,
  });

  expect(ink.selection).toBe('#ff0000');
  expect(ink.excluded).toBe('#eeeeee');
  expect(ink.includedAlpha).toBe(0.9);
});

test('the halo is the page s own surface, at 85 per cent', () => {
  const dark = parallelInkFrom({
    text: '#ffffff',
    textMuted: '#cccccc',
    surface: '#101418',
    accent: '#7dd3fc',
  });

  expect(dark.halo).toBe('rgba(16, 20, 24, 0.85)');
  expect(dark.selection).toBe('#7dd3fc');
});

test('a surface written as anything but a hex colour still gets a halo', () => {
  const ink = parallelInkFrom({
    text: '#000000',
    textMuted: '#666666',
    surface: 'color-mix(in oklab, white 90%, black)',
    accent: '#000000',
  });

  expect(ink.halo).toBe('rgba(255, 255, 255, 0.85)');
});

test('off the page every token is the family s own value', () => {
  expect(readParallelTokens(null)).toStrictEqual({
    text: FAMILY_TOKEN_VALUES['--text'],
    textMuted: FAMILY_TOKEN_VALUES['--text-muted'],
    surface: FAMILY_TOKEN_VALUES['--surface'],
    accent: FAMILY_TOKEN_VALUES['--text'],
  });
});
