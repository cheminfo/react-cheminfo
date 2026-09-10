/*
 * The cloud as a reader meets it, which is through the viewer: the tab draws
 * the picture, but the key it floats and the words behind its question mark
 * are built above it, so a test rendering the tab alone could be handed chrome
 * the viewer never builds.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type { ProjectionResult, ProjectionSamples } from '../../core/index.ts';
import { ProjectionViewer } from '../ProjectionViewer.tsx';

const SCORES = rowMatrix([
  [-2.6, 0.3, 0.9],
  [-2.1, -0.2, 0.7],
  [-2.35, 0.25, 1.1],
  [-2.5, 0.1, 0.8],
  [1.3, 0.7, -0.6],
  [1.8, -0.4, -0.9],
  [1.5, 0.2, -0.7],
  [1.6, 0.05, -0.5],
]);

const RESULT: ProjectionResult = {
  method: 'Principal components',
  axes: [
    { name: 'PC1', share: 0.7296 },
    { name: 'PC2', share: 0.2285 },
    { name: 'PC3', share: 0.0367 },
  ],
  scores: SCORES,
};

const SAMPLES: ProjectionSamples = {
  ids: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  groups: ['left', 'left', 'left', 'left', 'right', 'right', 'right', 'right'],
  groupLabel: 'Side',
};

function draw(extra: Record<string, unknown> = {}): string {
  return renderToStaticMarkup(
    <ProjectionViewer
      result={RESULT}
      samples={SAMPLES}
      tab="space"
      {...extra}
    />,
  );
}

test('a run with three axes offers the cloud, and a run with two does not', () => {
  expect(draw()).toContain('>Map in 3D</button>');

  const flat = renderToStaticMarkup(
    <ProjectionViewer
      result={{ ...RESULT, axes: RESULT.axes.slice(0, 2) }}
      samples={SAMPLES}
    />,
  );

  expect(flat).not.toContain('>Map in 3D</button>');
});

test('every sample is one dot inside a twelve-edged box', () => {
  const html = draw();

  expect(occurrences(layer(html, 'points'), '<circle')).toBe(8);
  // Twelve edges and the three labelled arms.
  expect(occurrences(html, '<line')).toBe(15);
});

test('the frame names all three components, shares and all', () => {
  const html = draw();

  expect(html).toContain('>PC1 — 73.0 %</text>');
  expect(html).toContain('>PC2 — 22.9 %</text>');
  expect(html).toContain('>PC3 — 3.7 %</text>');
});

test('each group gets a glass shell', () => {
  const shells = layer(draw(), 'shells');

  expect(occurrences(shells, 'data-shell="left"')).toBe(1);
  expect(occurrences(shells, 'data-shell="right"')).toBe(1);
});

test('turning the shells off leaves the dots alone', () => {
  const html = draw({ options: { ellipse: null } });

  expect(occurrences(html, '<ellipse')).toBe(0);
  expect(occurrences(layer(html, 'points'), '<circle')).toBe(8);
});

test('the cloud promises the share a shell actually holds, not the map’s', () => {
  const html = draw({
    options: { ellipse: { kind: 'standardDeviations', standardDeviations: 2 } },
  });

  // Two standard deviations hold 86% of a flat group and 74% of a solid one.
  // The cloud must quote its own number, or it promises samples it excludes.
  expect(html).toContain('aria-label="Group outlines \u2014 2 SD (about 74%)"');
  expect(html).not.toContain('86%');
});

test('a drag turns the box until the reader says it should select', () => {
  expect(draw()).toContain('>Turn</span>');
  expect(draw({ options: { cloudGesture: 'select' } })).toContain(
    '>Select</span>',
  );
});

test('the third axis is never one already drawn', () => {
  // Axis 0 already runs left to right, so the depth axis moves to the lowest
  // one still free rather than drawing a component against itself.
  const html = draw({ options: { zAxis: 0 } });

  expect(html).toContain('>PC1 \u2014 73.0 %</text>');
  expect(html).toContain('>PC2 \u2014 22.9 %</text>');
  expect(html).toContain('>PC3 \u2014 3.7 %</text>');
});

test('the key names the groups and counts them, as it does on the map', () => {
  const html = draw();

  expect(html).toContain('Colour = side.');
  expect(html).toContain('>left (4)</span>');
  expect(html).toContain('>right (4)</span>');
});

test('the panel is named, so the bar can offer to save the figure', () => {
  expect(draw()).toContain('role="tabpanel"');
});

/**
 * One drawing layer of the figure, on its own.
 *
 * Bounded by the next layer and by the end of the picture, because the key
 * floats *outside* the `<svg>` and draws a dot per group: a slice that ran to
 * the end of the markup would count those dots as samples.
 * @param html - The rendered figure.
 * @param name - The layer's `data-layer` value.
 * @returns That layer's markup, or the empty string when it was not drawn.
 */
function layer(html: string, name: string): string {
  const start = html.indexOf(`<g data-layer="${name}"`);
  if (start === -1) return '';
  const next = html.indexOf('<g data-layer=', start + 1);
  const close = html.indexOf('</svg>', start);
  const ends = [next, close].filter((at) => at !== -1);
  return html.slice(start, ends.length === 0 ? undefined : Math.min(...ends));
}

function occurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}
