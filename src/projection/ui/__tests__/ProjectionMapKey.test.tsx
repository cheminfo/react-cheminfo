/*
 * The key of the map floats inside the plot the frame drew, so a column of
 * wide labels up the left moves it with the plot instead of leaving it over
 * the labels.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type { ProjectionResult, ProjectionSamples } from '../../core/index.ts';
import { ProjectionViewer } from '../ProjectionViewer.tsx';

const SAMPLES: ProjectionSamples = {
  ids: ['a', 'b', 'c', 'd'],
  groupings: [
    {
      id: 'species',
      label: 'Species',
      groups: ['setosa', 'setosa', 'virginica', 'virginica'],
    },
  ],
};

/**
 * A run of four samples, its second component's scores scaled.
 * @param scale - What the second component's scores are multiplied by.
 * @returns The run.
 */
function run(scale: number): ProjectionResult {
  return {
    method: 'Principal components',
    axes: [
      { name: 'PC1', share: 0.7 },
      { name: 'PC2', share: 0.2 },
    ],
    scores: rowMatrix([
      [-2.6, 0.3 * scale],
      [-2.1, -0.2 * scale],
      [1.3, 0.7 * scale],
      [1.8, -0.4 * scale],
    ]),
  };
}

/**
 * Where the key's layer starts, and where the vertical axis' title stands.
 * @param result - The run.
 * @returns The two, in pixels from the figure's left edge.
 */
function placed(result: ProjectionResult): { key: number; title: number } {
  const html = renderToStaticMarkup(
    <ProjectionViewer result={result} samples={SAMPLES} />,
  );
  const key = /style="position:absolute;top:10px;left:(?<left>[\d.]+)px/u.exec(
    html,
  );
  const title = /transform="rotate\(-90 (?<x>[\d.-]+) /u.exec(html);
  return {
    key: Number(key?.groups?.left),
    title: Number(title?.groups?.x),
  };
}

test('labels of the usual width leave the key where the plot usually starts', () => {
  expect(placed(run(1))).toStrictEqual({ key: 61, title: 23 });
});

test('a column of wide labels moves the key with the plot, off the labels', () => {
  // The frame took the room `-4,000` needs, and its title moved out with it;
  // the key starts where the plot does, not 61 pixels in over the labels.
  expect(placed(run(10_000))).toStrictEqual({ key: 77, title: 23 });
});
