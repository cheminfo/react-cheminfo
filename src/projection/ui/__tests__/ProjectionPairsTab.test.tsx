import { getClasses, getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type { ProjectionResult, ProjectionSamples } from '../../core/index.ts';
import {
  DEFAULT_PROJECTION_OPTIONS,
  pcaResult,
  resolveProjectionGroups,
} from '../../core/index.ts';
import { ProjectionPairsTab } from '../ProjectionPairsTab.tsx';

const rows = getNumbers();
const result = pcaResult(new PCA(rows, { scale: true }), {
  rows,
  scaled: true,
});
const samples: ProjectionSamples = {
  ids: rows.map((_, at) => `row-${at}`),
  groups: getClasses(),
  groupLabel: 'Species',
};
const groups = resolveProjectionGroups(samples, result.scores.rows);

/** Six components, which is the most a grid ever lays out. */
const SIX: ProjectionResult = {
  method: 'Principal components',
  axes: [1, 2, 3, 4, 5, 6].map((number) => ({ name: `PC${number}` })),
  scores: rowMatrix([
    [-2, 1, 0.5, -0.5, 0.2, -0.2],
    [-1, 0.5, -0.5, 0.5, -0.2, 0.2],
    [0, -1, 1, 0, 0.4, 0],
    [1, -0.5, -1, 1, -0.4, 0.4],
    [2, 1.5, 0.25, -1, 0.1, -0.4],
    [0.5, -1.5, -0.25, 0.25, -0.1, 0.1],
  ]),
};

test('four components lay out sixteen cells, every one of them openable', () => {
  const html = render();

  expect(count(html, / — open"/g)).toBe(16);
  expect(html).toContain('aria-label="PC1 versus PC1 — open"');
  expect(html).toContain('aria-label="PC1 versus PC3 — open"');
});

test('colour is the group, in the same order and the same inks as the map', () => {
  const html = render();

  expect(html).toContain('#0072b2');
  expect(html).toContain('#d55e00');
  expect(html).toContain('#009e73');
  expect(html).toContain('setosa (50)');
  expect(html).toContain('virginica (50)');
});

test('the key floats on the grid, naming the grouping in one short line', () => {
  const html = render();

  expect(html).toContain('Colour = Species.');
  // The corner it floats in, which is the one cell of the grid that is a
  // mirror of another rather than the only place a pair is drawn.
  expect(count(html, /position:absolute;top:6px;right:6px/g)).toBe(1);
  expect(html).not.toContain(
    'The strip along the diagonal shows how the samples spread out along that component on its own.',
  );
});

test('the same outlines the map draws are drawn in every cell', () => {
  const html = render();

  // One outline per group in each of the twelve cells off the diagonal, and
  // every one of them translucent rather than a bare ring.
  expect(count(html, /<ellipse/g)).toBe(36);
  expect(count(html, /fill-opacity="0.1"/g)).toBe(36);
});

test('turning the outlines off on the map turns them off in the grid', () => {
  const html = render({ ellipse: null });

  expect(count(html, /<ellipse/g)).toBe(0);
  expect(count(html, / — open"/g)).toBe(16);
});

test('colouring by nothing drops the groups from the grid and from the key', () => {
  const html = render({ colorBy: 'none' });

  expect(html).not.toContain('#0072b2');
  expect(html).not.toContain('setosa');
  expect(count(html, / — open"/g)).toBe(16);
});

test('fewer components lay out fewer cells', () => {
  const html = render({ pairCount: 2 });

  expect(count(html, / — open"/g)).toBe(4);
  expect(html).not.toContain('PC3');
});

test('six components lay out thirty-six cells when the width can draw them', () => {
  const html = renderToStaticMarkup(
    <ProjectionPairsTab
      result={SIX}
      groups={resolveProjectionGroups({ ids: [] }, SIX.scores.rows)}
      options={{ ...DEFAULT_PROJECTION_OPTIONS, pairCount: 6 }}
      width={900}
      height={520}
      onSelectPair={() => undefined}
    />,
  );

  expect(count(html, / — open"/g)).toBe(36);
  expect(html).toContain('aria-label="PC1 versus PC6 — open"');
});

test('a grid asked for more than six components still lays out six', () => {
  const html = renderToStaticMarkup(
    <ProjectionPairsTab
      result={SIX}
      groups={resolveProjectionGroups({ ids: [] }, SIX.scores.rows)}
      options={{ ...DEFAULT_PROJECTION_OPTIONS, pairCount: 9 }}
      width={900}
      height={520}
      onSelectPair={() => undefined}
    />,
  );

  expect(count(html, / — open"/g)).toBe(36);
});

function render(over: Partial<typeof DEFAULT_PROJECTION_OPTIONS> = {}): string {
  return renderToStaticMarkup(
    <ProjectionPairsTab
      result={result}
      groups={groups}
      options={{ ...DEFAULT_PROJECTION_OPTIONS, ...over }}
      width={800}
      height={480}
      onSelectPair={() => undefined}
      testId="pairs"
    />,
  );
}

function count(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}
