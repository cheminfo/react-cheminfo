import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type {
  ProjectionOptions,
  ProjectionResult,
  ProjectionSamples,
} from '../../core/index.ts';
import {
  PROJECTION_COPY,
  resolveProjectionGroups,
  resolveProjectionOptions,
} from '../../core/index.ts';
import { projectionMapChrome } from '../projectionMapChrome.ts';
import { MINIMUM_OUTLINE_POINTS } from '../projectionMapModel.ts';

const RESULT: ProjectionResult = {
  method: 'Principal components',
  axes: [
    { name: 'PC1', share: 0.7296 },
    { name: 'PC2', share: 0.2285 },
  ],
  scores: rowMatrix([
    [-2.6, 0.3],
    [-2.1, -0.2],
    [-2.35, 0.25],
    [1.3, 0.7],
    [1.8, -0.4],
    [1.5, 0.2],
  ]),
};

const SAMPLES: ProjectionSamples = {
  ids: ['a', 'b', 'c', 'd', 'e', 'f'],
  groups: ['setosa', 'setosa', 'setosa', 'virginica', 'virginica', 'virginica'],
  groupLabel: 'Species',
};

test('the key is titled in one short clause, whatever else is drawn', () => {
  expect(chrome().title).toBe('Colour = species.');
  expect(chrome({ ellipse: null }).title).toBe('Colour = species.');
});

test('the paragraph holds every word the figure used to print under itself', () => {
  const { caption } = chrome();

  expect(caption).toContain(PROJECTION_COPY.intro.map);
  expect(caption).toContain(
    'Colour = species. Each outline covers about 95% of that group, assuming the group is roughly bell-shaped.',
  );
});

test('what an outline holds is claimed only where an outline is drawn', () => {
  const { caption } = chrome({ ellipse: null });

  expect(caption).toBe(PROJECTION_COPY.intro.map);
});

test('colouring by nothing names the shape channel rather than no channel', () => {
  const { title, entries } = chrome({ colorBy: 'none' });

  expect(title).toBe('Shape = what each mark is.');
  expect(entries).toHaveLength(0);
});

test('a group too small to outline is named in the key and in the paragraph', () => {
  const short: ProjectionResult = {
    ...RESULT,
    scores: rowMatrix([
      [-2.6, 0.3],
      [-2.1, -0.2],
      [-2.4, 0.1],
      [1.3, 0.7],
      [1.8, -0.4],
    ]),
  };
  const samples: ProjectionSamples = {
    ids: ['a', 'b', 'c', 'd', 'e'],
    groups: ['setosa', 'setosa', 'setosa', 'virginica', 'virginica'],
    groupLabel: 'Species',
  };
  const built = chrome({}, short, samples);

  expect(built.entries[1]?.note).toBe('Not outlined: too few samples.');
  expect(built.caption).toContain('virginica not outlined: too few samples.');
});

test('rows the model never saw are named and explained', () => {
  const built = chrome({}, { ...RESULT, fittedCount: 4 });

  expect(built.entries.at(-1)?.label).toBe(
    'Hollow = added after the map was built',
  );
  expect(built.caption).toContain('placed on the finished map afterwards');
});

/**
 * The key and the paragraph the viewer would build.
 * @param over - The options that differ from the defaults.
 * @param result - What the run produced.
 * @param samples - Who the rows are.
 * @returns The key's title and entries, and the paragraph behind the glyph.
 */
function chrome(
  over: Partial<ProjectionOptions> = {},
  result: ProjectionResult = RESULT,
  samples: ProjectionSamples = SAMPLES,
) {
  const options = resolveProjectionOptions(over, result);
  return projectionMapChrome({
    copy: PROJECTION_COPY,
    groups: resolveProjectionGroups(samples, result.scores.rows),
    colored: options.colorBy === 'group',
    ellipse: options.ellipse,
    minimumPoints: MINIMUM_OUTLINE_POINTS,
    showGroupMeans: options.showGroupMeans,
    markers: result.markers ?? [],
    fittedCount: result.fittedCount ?? result.scores.rows,
    total: result.scores.rows,
  });
}
