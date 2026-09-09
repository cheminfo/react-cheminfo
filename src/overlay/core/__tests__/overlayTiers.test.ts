import { expect, test } from 'vitest';

import { overlayMetrics } from '../overlayMetrics.ts';
import type { OverlayTierRoom } from '../overlayTierRoom.ts';
import { overlayTier, overlayTierWidths } from '../overlayTiers.ts';

const COMPACT = overlayMetrics('compact');

const PCA: OverlayTierRoom = {
  tabs: ['Map', 'Every pair', 'What differs', 'How much each explains'],
  shortTabs: ['Map', 'Pairs', 'Differs', 'Explains'],
  settings: [
    { key: 'Colour', value: 'Species', swatches: true },
    { key: 'Outlines', value: '95%' },
  ],
};

const WIDTHS = overlayTierWidths(PCA, COMPACT);

test('the four-tab viewer folds at the widths its own words ask for', () => {
  expect({
    full: Math.round(WIDTHS.full),
    condensed: Math.round(WIDTHS.condensed),
    short: Math.round(WIDTHS.short),
    chip: Math.round(WIDTHS.chip),
  }).toStrictEqual({ full: 690, condensed: 588, short: 435, chip: 417 });
});

test('a bar exactly as wide as a rung needs is on that rung', () => {
  expect(overlayTier(WIDTHS.full, PCA, COMPACT)).toBe('full');
  expect(overlayTier(WIDTHS.condensed, PCA, COMPACT)).toBe('condensed');
  expect(overlayTier(WIDTHS.short, PCA, COMPACT)).toBe('short');
  expect(overlayTier(WIDTHS.chip, PCA, COMPACT)).toBe('chip');
});

test('one pixel short of a rung is the rung below, and one over is not', () => {
  expect(overlayTier(WIDTHS.full - 1, PCA, COMPACT)).toBe('condensed');
  expect(overlayTier(WIDTHS.full + 1, PCA, COMPACT)).toBe('full');
  expect(overlayTier(WIDTHS.condensed - 1, PCA, COMPACT)).toBe('short');
  expect(overlayTier(WIDTHS.condensed + 1, PCA, COMPACT)).toBe('condensed');
  expect(overlayTier(WIDTHS.short - 1, PCA, COMPACT)).toBe('chip');
  expect(overlayTier(WIDTHS.short + 1, PCA, COMPACT)).toBe('short');
  expect(overlayTier(WIDTHS.chip - 1, PCA, COMPACT)).toBe('tiny');
  expect(overlayTier(WIDTHS.chip + 1, PCA, COMPACT)).toBe('chip');
});

test('an unmeasured bar is given the roomiest tier, so it never opens folded', () => {
  expect(overlayTier(0, PCA, COMPACT)).toBe('full');
  expect(overlayTier(-320, PCA, COMPACT)).toBe('full');
  expect(overlayTier(Number.NaN, PCA, COMPACT)).toBe('full');
  expect(overlayTier(Number.POSITIVE_INFINITY, PCA, COMPACT)).toBe('full');
});

test('a viewer with two tabs stays roomy where the four-tab one has folded', () => {
  const two: OverlayTierRoom = {
    tabs: ['Map', 'Every pair'],
    shortTabs: ['Map', 'Pairs'],
    settings: PCA.settings,
  };

  expect(Math.round(overlayTierWidths(two, COMPACT).full)).toBe(437);
  expect(overlayTier(500, two, COMPACT)).toBe('full');
  expect(overlayTier(500, PCA, COMPACT)).toBe('short');
});

test('labels long enough fold a bar the four-tab viewer fits on', () => {
  const six: OverlayTierRoom = {
    tabs: [...PCA.tabs, 'Loadings profile', 'Residuals per sample'],
    shortTabs: [...(PCA.shortTabs ?? []), 'Loadings', 'Residuals'],
    settings: PCA.settings,
  };

  expect(Math.round(overlayTierWidths(six, COMPACT).full)).toBe(955);
  expect(overlayTier(700, PCA, COMPACT)).toBe('full');
  expect(overlayTier(700, six, COMPACT)).toBe('short');
});

test('a tab with no short form keeps its long one rather than going blank', () => {
  const partial: OverlayTierRoom = {
    tabs: ['Map', 'How much each explains'],
    shortTabs: ['Map'],
    settings: PCA.settings,
  };
  const none: OverlayTierRoom = {
    tabs: partial.tabs,
    settings: PCA.settings,
  };

  expect(overlayTierWidths(partial, COMPACT).short).toBe(
    overlayTierWidths(none, COMPACT).short,
  );
});

test('a finger keeps its targets, so the same words fold a wider bar', () => {
  const coarse = overlayTierWidths(PCA, overlayMetrics('compact', 'coarse'));

  expect(Math.round(coarse.full)).toBe(902);
  expect(Math.round(coarse.chip)).toBe(567);
  expect(coarse.chip).toBeGreaterThan(WIDTHS.chip);
});

test('the rungs never ask for more room than the rung above them', () => {
  const rooms: OverlayTierRoom[] = [
    PCA,
    { tabs: [], settings: [{ key: 'Colour', value: 'Species' }] },
    { tabs: ['Map'], settings: [], glyphs: 1 },
    { tabs: ['Map', 'Every pair'], settings: PCA.settings, glyphs: 0 },
  ];

  for (const room of rooms) {
    const widths = overlayTierWidths(room, COMPACT);

    expect(widths.condensed).toBeLessThanOrEqual(widths.full);
    expect(widths.short).toBeLessThanOrEqual(widths.condensed);
    expect(widths.chip).toBeLessThanOrEqual(widths.short);
  }
});

test('a rung that would save nothing is skipped rather than stepped through', () => {
  const single: OverlayTierRoom = {
    tabs: ['Map'],
    settings: [{ key: 'Colour', value: 'Species' }],
  };
  const widths = overlayTierWidths(single, COMPACT);

  expect(widths.chip).toBe(widths.short);
  expect(widths.short).toBe(widths.condensed);
  expect(overlayTier(widths.condensed, single, COMPACT)).toBe('condensed');
  expect(overlayTier(widths.condensed - 1, single, COMPACT)).toBe('tiny');
});

test('a bar with no strip at all still needs room for its settings', () => {
  const bare: OverlayTierRoom = { tabs: [], settings: PCA.settings };
  const widths = overlayTierWidths(bare, COMPACT);

  expect(Math.round(widths.full)).toBe(314);
  expect(overlayTier(314, bare, COMPACT)).toBe('full');
});

test('the glyphs at the end are counted, and asking for none takes their room away', () => {
  const glyphless = overlayTierWidths({ ...PCA, glyphs: 0 }, COMPACT);

  expect(WIDTHS.full - glyphless.full).toBe(56);
  expect(
    Math.round(overlayTierWidths({ ...PCA, glyphs: 1 }, COMPACT).full),
  ).toBe(662);
});
