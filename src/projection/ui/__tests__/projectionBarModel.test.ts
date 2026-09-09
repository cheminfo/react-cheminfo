/*
 * How much of itself the settings bar writes at a given figure width. Every
 * number here is an answer rather than a decision: the content goes in and the
 * thresholds come out, which is why a viewer with two views stays roomy on a
 * figure where one with four has already shortened its names.
 */

import { expect, test } from 'vitest';

import { overlayMetrics } from '../../../overlay/core/overlayMetrics.ts';
import type { ProjectionTab } from '../../core/index.ts';
import {
  DEFAULT_PROJECTION_OPTIONS,
  PROJECTION_COPY,
} from '../../core/index.ts';
import type { ProjectionBarRoom } from '../projectionBarModel.ts';
import {
  projectionBarGlyphs,
  projectionBarTier,
  projectionBarTierWidths,
} from '../projectionBarModel.ts';
import { projectionBarReadings } from '../projectionBarReadings.ts';

const COMPACT = overlayMetrics('compact', 'fine');
const FINGER = overlayMetrics('compact', 'coarse');

/** The three iris species, as the map paints them. */
const GROUPS = {
  label: 'Species',
  entries: [
    { id: 'setosa', label: 'setosa', color: '#0072b2', count: 50 },
    { id: 'versicolor', label: 'versicolor', color: '#d55e00', count: 50 },
    { id: 'virginica', label: 'virginica', color: '#009e73', count: 50 },
  ],
  groupOf: new Int32Array(150),
};

const FOUR_VIEWS: readonly ProjectionTab[] = [
  'map',
  'pairs',
  'variables',
  'shares',
];

test('an unmeasured figure is given the roomiest rung, so nothing flickers', () => {
  for (const width of [0, -1, Number.NaN]) {
    expect(projectionBarTier(width, room('map', FOUR_VIEWS), COMPACT)).toBe(
      'full',
    );
  }
});

test('the map walks down every rung as the figure narrows', () => {
  const map = room('map', FOUR_VIEWS);

  expect(projectionBarTier(1200, map, COMPACT)).toBe('full');
  expect(projectionBarTier(800, map, COMPACT)).toBe('full');
  expect(projectionBarTier(750, map, COMPACT)).toBe('condensed');
  expect(projectionBarTier(600, map, COMPACT)).toBe('short');
  expect(projectionBarTier(510, map, COMPACT)).toBe('chip');
  expect(projectionBarTier(440, map, COMPACT)).toBe('tiny');
});

test('the four widths the map folds at are the ones the content asks for', () => {
  const widths = projectionBarTierWidths(room('map', FOUR_VIEWS), COMPACT);

  expect(Math.round(widths.full)).toBe(774);
  expect(Math.round(widths.condensed)).toBe(672);
  expect(Math.round(widths.short)).toBe(519);
  expect(Math.round(widths.chip)).toBe(501);
});

test('no rung ever asks for more room than the rung above it', () => {
  for (const tab of FOUR_VIEWS) {
    const widths = projectionBarTierWidths(room(tab, FOUR_VIEWS), COMPACT);

    expect(widths.full).toBeGreaterThanOrEqual(widths.condensed);
    expect(widths.condensed).toBeGreaterThanOrEqual(widths.short);
    expect(widths.short).toBeGreaterThanOrEqual(widths.chip);
  }
});

test('two views stay roomy on a figure where four have already shortened', () => {
  const two: readonly ProjectionTab[] = ['map', 'pairs'];

  expect(projectionBarTier(560, room('map', two), COMPACT)).toBe('full');
  expect(projectionBarTier(560, room('map', FOUR_VIEWS), COMPACT)).toBe(
    'short',
  );
});

test('a site that translates the view names has changed the fold widths', () => {
  const french = {
    ...PROJECTION_COPY,
    tab: {
      ...PROJECTION_COPY.tab,
      map: 'Carte des échantillons',
    },
  };
  const wider = projectionBarTierWidths(
    { ...room('map', FOUR_VIEWS), tabLabels: tabNames(FOUR_VIEWS, french.tab) },
    COMPACT,
  );
  const plain = projectionBarTierWidths(room('map', FOUR_VIEWS), COMPACT);

  expect(wider.full - plain.full).toBeCloseTo(
    ('Carte des échantillons'.length - 'Map'.length) * 11 * 0.58,
    6,
  );
});

test("a stepper's two buttons are counted, though nothing is written on them", () => {
  const words = { key: 'Components', label: 'Components', value: '4' };
  const written = { ...room('pairs', FOUR_VIEWS), readings: [words] };
  const stepper = {
    ...written,
    readings: [{ ...words, stepper: true }],
  };

  // Two twenty-four pixel buttons and the gaps around them, which no estimate
  // read off the words could ever see.
  expect(
    projectionBarTierWidths(stepper, COMPACT).full -
      projectionBarTierWidths(written, COMPACT).full,
  ).toBe(2 * COMPACT.buttonSize + 2 * COMPACT.gap);
});

test('a finger keeps the bar wide, however narrow the figure', () => {
  const mouse = projectionBarTierWidths(room('map', FOUR_VIEWS), COMPACT);
  const finger = projectionBarTierWidths(room('map', FOUR_VIEWS), FINGER);

  expect(Math.round(finger.full)).toBe(1052);
  expect(Math.round(finger.chip)).toBe(717);
  expect(finger.chip).toBeGreaterThan(
    mouse.full - mouse.condensed + mouse.chip,
  );
});

test('one view is no strip at all, so the settings alone decide the fold', () => {
  const alone = projectionBarTierWidths(room('map', []), COMPACT);

  expect(Math.round(alone.full)).toBe(398);
  expect(projectionBarTier(400, room('map', []), COMPACT)).toBe('full');
});

/**
 * The bar as one tab of a four-view iris run fills it.
 * @param tab - The tab showing.
 * @param tabs - The views the result can fill.
 * @returns The room the bar needs to hold it.
 */
function room(
  tab: ProjectionTab,
  tabs: readonly ProjectionTab[],
): ProjectionBarRoom {
  return {
    tabLabels: tabNames(tabs, PROJECTION_COPY.tab),
    shortTabLabels: tabNames(tabs, PROJECTION_COPY.shortTab),
    readings: projectionBarReadings({
      tab,
      copy: PROJECTION_COPY,
      options: DEFAULT_PROJECTION_OPTIONS,
      groups: GROUPS,
    }),
    glyphs: projectionBarGlyphs(tab),
  };
}

/**
 * What each view is called, at one of the two lengths.
 * @param tabs - The views the result can fill.
 * @param names - What each is called at that length.
 * @returns The names, in the same order.
 */
function tabNames(
  tabs: readonly ProjectionTab[],
  names: Readonly<Record<ProjectionTab, string>>,
): readonly string[] {
  const labels: string[] = [];
  for (const tab of tabs) labels.push(names[tab]);
  return labels;
}
