/*
 * Two groupings of the same samples on one map, as a reader meets them through
 * the viewer: colour for one and shape for the other, both named in the key
 * and on the card, with the names a reader reads kept apart from the ids the
 * callbacks speak in.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type {
  ProjectionOptions,
  ProjectionResult,
  ProjectionSamples,
} from '../../core/index.ts';
import { resolveProjectionGroups } from '../../core/index.ts';
import { ProjectionReadout } from '../ProjectionReadout.tsx';
import { ProjectionViewer } from '../ProjectionViewer.tsx';

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
  ids: ['s1', 's2', 's3', 's4', 's5', 's6'],
  labels: [
    'Control A',
    'Control B',
    'Control C',
    'Treated A',
    'Treated B',
    'Treated C',
  ],
  groupings: [
    {
      id: 'cluster',
      label: 'Cluster',
      groups: ['1', '1', '2', '2', '2', '2'],
    },
    {
      id: 'class',
      label: 'Class',
      groups: [
        'control',
        'control',
        'control',
        'treated',
        'treated',
        'treated',
      ],
    },
  ],
};

test('the key says what the colour and the shape each stand for', () => {
  const html = draw();

  expect(html).toContain('Colour = cluster. Shape = class.');
  expect(html).toContain('control (3)');
  expect(html).toContain('treated (3)');
});

test('the second grouping gives the dots their shapes', () => {
  const points = pointsLayer(draw());

  expect(countOf(points, '<circle')).toBe(3);
  expect(countOf(points, '<path')).toBe(3);
});

test('with the shape turned off every dot is a disc again', () => {
  const html = draw({ shapeBy: 'none' });
  const points = pointsLayer(html);

  expect(countOf(points, '<circle')).toBe(6);
  expect(countOf(points, '<path')).toBe(0);
  expect(html).toContain('Colour = cluster.');
  expect(html).not.toContain('Shape = class.');
});

test('the colour turned off leaves the shapes the reader asked for', () => {
  const html = draw({ colorBy: 'none', shapeBy: 'class' });

  expect(html).toContain('Shape = class.');
  expect(html).not.toContain('Colour = cluster.');
  expect(countOf(pointsLayer(html), '<path')).toBe(3);
});

test('the names written beside the dots are the labels, not the ids', () => {
  const html = draw({ showIds: true });

  expect(html).toContain('Control A');
  expect(html).not.toContain('>s1<');
});

test('the card is titled by the label and names the sample in every grouping', () => {
  const html = renderToStaticMarkup(
    <ProjectionReadout
      index={3}
      result={RESULT}
      samples={SAMPLES}
      groups={resolveProjectionGroups(SAMPLES.groupings?.[0], 6)}
      colorBy="cluster"
      xAxis={0}
      yAxis={1}
      x={20}
      y={20}
      boxWidth={400}
      boxHeight={300}
    />,
  );

  expect(html).toContain('Treated A');
  expect(html).not.toContain('>s4<');
  expect(html).toContain('>Cluster<');
  expect(html).toContain('>Class<');
  expect(html).toContain('>treated<');
});

function draw(options?: Partial<ProjectionOptions>): string {
  return renderToStaticMarkup(
    <ProjectionViewer result={RESULT} samples={SAMPLES} options={options} />,
  );
}

function pointsLayer(html: string): string {
  const start = html.indexOf('<g data-layer="points"');
  return html.slice(start, html.indexOf('</g>', start));
}

function countOf(html: string, needle: string): number {
  return html.split(needle).length - 1;
}
