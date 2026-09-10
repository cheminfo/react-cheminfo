import { getClassesAsNumber, getNumbers } from 'ml-dataset-iris';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ScatterCloudProps } from '../ScatterCloud.tsx';
import { ScatterCloud } from '../ScatterCloud.tsx';

const rows = getNumbers();
const irisX = rows.map((row) => row[0] as number);
const irisY = rows.map((row) => row[1] as number);
const irisZ = rows.map((row) => row[2] as number);
const irisGroupOf = getClassesAsNumber();

const GROUPS = [
  { id: 'setosa', label: 'Setosa', color: 'var(--text)' },
  { id: 'versicolor', label: 'Versicolor', color: 'var(--text-muted)' },
  { id: 'virginica', label: 'Virginica', color: 'var(--text-faint)' },
] as const;

const IRIS = {
  x: irisX,
  y: irisY,
  z: irisZ,
  width: 640,
  height: 480,
  xLabel: 'Sepal length',
  yLabel: 'Sepal width',
  zLabel: 'Petal length',
  groupOf: irisGroupOf,
  groups: GROUPS,
} as const satisfies ScatterCloudProps;

test('every iris sample is one dot', () => {
  const html = renderToStaticMarkup(<ScatterCloud {...IRIS} />);

  expect(occurrences(layer(html, 'points'), '<circle')).toBe(150);
});

test('the box is twelve edges and three named arms', () => {
  const frame = layer(
    renderToStaticMarkup(<ScatterCloud {...IRIS} />),
    'frame',
  );

  expect(occurrences(frame, '<line')).toBe(15);
  expect(frame).toContain('Sepal length');
  expect(frame).toContain('Sepal width');
  expect(frame).toContain('Petal length');
});

test('no shells are drawn until a size is asked for', () => {
  const html = renderToStaticMarkup(<ScatterCloud {...IRIS} />);

  expect(occurrences(layer(html, 'shells'), '<ellipse')).toBe(0);
});

test('asking for shells draws one ellipse per group', () => {
  const html = renderToStaticMarkup(
    <ScatterCloud
      {...IRIS}
      ellipsoid={{ kind: 'coverage', probability: 0.95 }}
    />,
  );
  const shells = layer(html, 'shells');

  expect(occurrences(shells, 'data-shell=')).toBe(3);
  // A shell's outline is exactly an ellipse, so one element draws it however
  // the box is turned, and there are no seams to read as a wireframe.
  expect(occurrences(shells, '<ellipse')).toBe(3);
  expect(occurrences(shells, '<polygon')).toBe(0);
});

test('a selected sample is ringed, exactly as it is on the map', () => {
  const marks = layer(
    renderToStaticMarkup(<ScatterCloud {...IRIS} selected={[3, 41]} />),
    'marks',
  );

  expect(occurrences(marks, 'data-ring="select"')).toBe(2);
});

test('a group with no room for a shell is left without one', () => {
  const html = renderToStaticMarkup(
    <ScatterCloud
      x={[0, 1, 2]}
      y={[0, 1, 0]}
      z={[0, 0, 1]}
      width={320}
      height={240}
      xLabel="A"
      yLabel="B"
      zLabel="C"
      groupOf={[0, 0, 0]}
      groups={[{ id: 'only', label: 'Only', color: 'var(--text)' }]}
      ellipsoid={{ kind: 'coverage', probability: 0.95 }}
    />,
  );

  expect(occurrences(layer(html, 'shells'), 'data-shell=')).toBe(0);
  expect(occurrences(layer(html, 'points'), '<circle')).toBe(3);
});

test('a sample carries its own group colour', () => {
  const points = layer(
    renderToStaticMarkup(<ScatterCloud {...IRIS} />),
    'points',
  );

  expect(occurrences(points, 'fill="var(--text)"')).toBe(50);
  expect(occurrences(points, 'fill="var(--text-muted)"')).toBe(50);
  expect(occurrences(points, 'fill="var(--text-faint)"')).toBe(50);
});

test('a sample projected into a finished model is drawn hollow', () => {
  const html = renderToStaticMarkup(
    <ScatterCloud {...IRIS} outlinedFrom={100} />,
  );

  expect(occurrences(layer(html, 'points'), 'fill="none"')).toBe(50);
});

test('a dot at the front of the box is drawn larger than one at the back', () => {
  // One sample at each end of the depth axis, everything else held still.
  const html = renderToStaticMarkup(
    <ScatterCloud
      x={[0, 0]}
      y={[0, 0]}
      z={[0, 1]}
      width={320}
      height={320}
      xLabel="A"
      yLabel="B"
      zLabel="C"
      camera={{ yaw: 0, pitch: 0 }}
    />,
  );
  const radii = [...layer(html, 'points').matchAll(/ r="([\d.]+)"/g)].map(
    (found) => Number(found[1]),
  );

  expect(radii).toHaveLength(2);
  expect(radii[1] as number).toBeGreaterThan(radii[0] as number);
});

test('turning the box moves every dot, and turning it back brings them home', () => {
  const straight = renderToStaticMarkup(
    <ScatterCloud {...IRIS} camera={{ yaw: 0, pitch: 0 }} />,
  );
  const turned = renderToStaticMarkup(
    <ScatterCloud {...IRIS} camera={{ yaw: 0.9, pitch: 0.3 }} />,
  );
  const again = renderToStaticMarkup(
    <ScatterCloud {...IRIS} camera={{ yaw: 0, pitch: 0 }} />,
  );

  expect(turned).not.toBe(straight);
  expect(again).toBe(straight);
});

test('zooming in draws the box larger without changing what is in it', () => {
  const near = renderToStaticMarkup(<ScatterCloud {...IRIS} zoom={2} />);
  const far = renderToStaticMarkup(<ScatterCloud {...IRIS} zoom={1} />);

  expect(occurrences(layer(near, 'points'), '<circle')).toBe(150);
  expect(near).not.toBe(far);
});

test('a name is written beside the samples that were given one', () => {
  const labels = irisX.map((_, index) => (index < 3 ? `S${index}` : undefined));
  const html = renderToStaticMarkup(
    <ScatterCloud {...IRIS} pointLabels={labels} />,
  );

  expect(html).toContain('S0');
  expect(html).toContain('S2');
});

test('a group name is written once over its own crowd', () => {
  const html = renderToStaticMarkup(<ScatterCloud {...IRIS} showGroupLabels />);

  expect(occurrences(html, '>Setosa<')).toBe(1);
  expect(occurrences(html, '>Virginica<')).toBe(1);
});

test('a screen reader is told all three axes and how many samples there are', () => {
  const html = renderToStaticMarkup(<ScatterCloud {...IRIS} />);

  expect(html).toContain(
    'A three-dimensional scatter plot of 150 samples: Sepal length across, Sepal width up, and Petal length into the picture.',
  );
});

test('a caller may say what a screen reader is told instead', () => {
  const html = renderToStaticMarkup(
    <ScatterCloud {...IRIS} label="The iris cloud" />,
  );

  expect(html).toContain('aria-label="The iris cloud"');
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
