import { getClassesAsNumber, getNumbers } from 'ml-dataset-iris';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ScatterPlotProps } from '../ScatterPlot.tsx';
import { ScatterPlot } from '../ScatterPlot.tsx';

const rows = getNumbers();
const irisX = rows.map((row) => row[0] as number);
const irisY = rows.map((row) => row[1] as number);
const irisGroupOf = getClassesAsNumber();

const GROUPS = [
  { id: 'setosa', label: 'Setosa', color: 'var(--text)' },
  { id: 'versicolor', label: 'Versicolor', color: 'var(--text-muted)' },
  { id: 'virginica', label: 'Virginica', color: 'var(--text-faint)' },
] as const;

const IRIS = {
  x: irisX,
  y: irisY,
  width: 640,
  height: 480,
  xAxis: { domain: [4, 8], label: 'Sepal length' },
  yAxis: { domain: [1.5, 4.5], label: 'Sepal width' },
  groupOf: irisGroupOf,
  groups: GROUPS,
} as const satisfies ScatterPlotProps;

test('every iris sample is one dot, and the cloud is the only thing counted', () => {
  const html = renderToStaticMarkup(<ScatterPlot {...IRIS} />);

  expect(occurrences(layer(html, 'points'), '<circle')).toBe(150);
  expect(occurrences(layer(html, 'marks'), '<circle')).toBe(0);
});

test('a selection rings fifty dots and leaves all hundred and fifty drawn', () => {
  const chosen = Array.from({ length: 50 }, (_, index) => index * 3);
  const html = renderToStaticMarkup(
    <ScatterPlot {...IRIS} selected={chosen} />,
  );

  expect(occurrences(layer(html, 'marks'), '<circle')).toBe(50);
  expect(occurrences(layer(html, 'points'), '<circle')).toBe(150);
});

test('a selected dot keeps its group colour and gains a ring in the accent', () => {
  const html = renderToStaticMarkup(<ScatterPlot {...IRIS} selected={[0]} />);
  const marks = layer(html, 'marks');

  expect(occurrences(layer(html, 'points'), 'fill="var(--accent)"')).toBe(0);
  expect(occurrences(layer(html, 'points'), 'fill="var(--text)"')).toBe(50);
  expect(occurrences(marks, 'stroke="var(--accent)"')).toBe(1);
  expect(occurrences(marks, 'fill="none"')).toBe(1);
});

test('asking for outlines draws one per group', () => {
  const html = renderToStaticMarkup(
    <ScatterPlot {...IRIS} ellipse={{ kind: 'coverage', probability: 0.95 }} />,
  );

  expect(occurrences(layer(html, 'ellipses'), '<ellipse')).toBe(3);
});

test('a group on a straight line is drawn as the segment it is', () => {
  const html = renderToStaticMarkup(
    <ScatterPlot
      {...IRIS}
      x={[0, 1, 2, 3, 4, 5]}
      y={[0, 1, 2, 0, 4, 1]}
      groupOf={[0, 0, 0, 1, 1, 1]}
      groups={GROUPS.slice(0, 2)}
      ellipse={{ kind: 'standardDeviations', standardDeviations: 2 }}
    />,
  );
  const ellipses = layer(html, 'ellipses');

  expect(occurrences(ellipses, '<line')).toBe(1);
  expect(occurrences(ellipses, '<ellipse')).toBe(1);
});

test('points from `outlinedFrom` on are hollow and the rest stay filled', () => {
  const html = renderToStaticMarkup(
    <ScatterPlot {...IRIS} outlinedFrom={140} />,
  );
  const points = layer(html, 'points');

  expect(occurrences(points, 'fill="none"')).toBe(10);
  expect(occurrences(points, 'stroke-width="1.5"')).toBe(10);
  expect(occurrences(points, '<circle')).toBe(150);
});

test('naming the points writes each name in its group’s colour, where it fits', () => {
  const names = irisGroupOf.map((group, index) => `${group}-${index}`);
  const html = renderToStaticMarkup(
    <ScatterPlot {...IRIS} pointLabels={names} />,
  );
  const labels = layer(html, 'labels');

  // Twelve of the hundred and fifty land in a crowd with no room left around
  // it and are dropped rather than written over a name already there.
  expect(occurrences(labels, '<text')).toBe(138);
  expect(labels).toContain('>0-0</text>');
  expect(occurrences(labels, 'fill="var(--text)"')).toBe(50);
});

test('naming the groups writes each name once, and nothing when it is off', () => {
  const html = renderToStaticMarkup(<ScatterPlot {...IRIS} showGroupLabels />);
  const labels = layer(html, 'labels');

  expect(occurrences(labels, '<text')).toBe(3);
  expect(labels).toContain('>Setosa</text>');
  expect(labels).toContain('>Virginica</text>');
  expect(layer(renderToStaticMarkup(<ScatterPlot {...IRIS} />), 'labels')).toBe(
    '',
  );
});

test('a plot nobody named still tells a screen reader what it shows', () => {
  const html = renderToStaticMarkup(<ScatterPlot {...IRIS} />);

  expect(html).toContain('role="img"');
  expect(html).toContain(
    'aria-label="A scatter plot of 150 points, Sepal width against Sepal length."',
  );
});

test('the gesture rectangle is the plot itself and carries no dot handlers', () => {
  const html = renderToStaticMarkup(<ScatterPlot {...IRIS} testId="map" />);

  expect(html).toContain('data-testid="map"');
  expect(occurrences(html, '<rect')).toBe(2);
  expect(occurrences(html, 'fill="transparent"')).toBe(1);
});

function layer(html: string, name: string): string {
  const start = html.indexOf(`<g data-layer="${name}"`);
  if (start === -1) return '';
  return html.slice(start, html.indexOf('</g>', start));
}

function occurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}
