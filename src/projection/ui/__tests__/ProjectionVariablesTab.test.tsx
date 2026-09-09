import { getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type {
  LoadingProfiles,
  ProjectionOptions,
  ProjectionResult,
  VariableAxis,
} from '../../core/index.ts';
import {
  DEFAULT_PROJECTION_OPTIONS,
  loadingProfiles,
  pcaResult,
} from '../../core/index.ts';
import { ProjectionVariablesTab } from '../ProjectionVariablesTab.tsx';
import { variableTrack, writeValue } from '../projectionVariablesModel.ts';

const IRIS_AXIS: VariableAxis = {
  kind: 'named',
  names: ['Sepal length', 'Sepal width', 'Petal length', 'Petal width'],
};

const rows = getNumbers();
const iris = pcaResult(new PCA(rows, { scale: true }), {
  rows,
  scaled: true,
  variables: IRIS_AXIS,
});

const SPECTRUM_AXIS: VariableAxis = {
  kind: 'continuous',
  values: [1600, 1650, 1700],
  label: 'Wavenumber',
  unit: 'cm⁻¹',
};

const spectrum: ProjectionResult = {
  method: 'Principal components',
  axes: [
    { name: 'PC 1', share: 0.8 },
    { name: 'PC 2', share: 0.2 },
  ],
  scores: rowMatrix([
    [1, 0],
    [-1, 0],
  ]),
  loadings: {
    weights: rowMatrix([
      [0.1, 0.5, -0.2],
      [0.3, 0.081, 0.6],
    ]),
    variables: SPECTRUM_AXIS,
    valueLabel: 'Absorbance',
  },
};

const PEAKS_AXIS: VariableAxis = {
  kind: 'peaks',
  values: [200, 250, 800],
  label: 'm/z',
};

const peaks: ProjectionResult = {
  method: 'Principal components',
  axes: [
    { name: 'PC 1', share: 0.8 },
    { name: 'PC 2', share: 0.2 },
  ],
  scores: rowMatrix([
    [1, 0],
    [-1, 0],
  ]),
  loadings: {
    weights: rowMatrix([
      [0.1, 0.5, -0.2],
      [0.3, 0.081, 0.6],
    ]),
    variables: PEAKS_AXIS,
    valueLabel: 'Loading',
  },
};

test('one panel per component, each titled with its own share', () => {
  const html = render(iris);

  expect(count(html, /role="img" aria-label="PC/g)).toBe(3);
  expect(html).toContain('PC1 — 73.0 %');
  expect(html).toContain('PC2 — 22.9 %');
  expect(html).toContain('PC3 — 3.7 %');
  expect(html).not.toContain('PC4 —');
});

test('colour is the component, and the two ends of one component share it', () => {
  const html = render(iris);

  expect(html).toContain('data-series="component-0"');
  expect(html).toContain('data-series="component-0-other"');
  // Two lines on the panel and the swatch in its title, and no other ink.
  expect(count(html, /stroke="#e69f00"/g)).toBe(2);
  expect(count(html, /stroke="#56b4e9"/g)).toBe(2);
  expect(count(html, /stroke="#4d4d4d"/g)).toBe(2);
});

test('the average sample is grey and dashed behind every panel, never a palette colour', () => {
  const html = render(iris);

  expect(count(html, /data-series="average"/g)).toBe(3);
  expect(count(html, /stroke-dasharray="4 3"/g)).toBe(3);
  // One per panel: the tab carries no key that would draw a fourth.
  expect(count(html, /stroke="var\(--text-faint\)"/g)).toBe(3);
});

test('named measurements draw bars from the zero line once the panel means weights', () => {
  const html = render(iris, { variablesView: 'weights' });
  const panel = html.slice(html.indexOf('data-series="component-0"'));

  expect(html).toContain('<g data-series="component-0" fill="#e69f00"');
  expect(count(panel.slice(0, panel.indexOf('</g>')), /<rect/g)).toBe(4);
  expect(html).not.toContain('data-series="component-0-other"');
});

test('a continuous axis draws lines, and names itself under the last panel', () => {
  const html = render(spectrum, { variablesCount: 2 });

  expect(count(html, /<path data-series="component-/g)).toBe(2);
  expect(html).not.toContain('<g data-series="component-0" fill=');
  expect(html).toContain('>Wavenumber (cm⁻¹)</text>');
  expect(html).toContain('>1600 cm⁻¹</text>');
});

test('a resampled axis labels its ticks whole, and reads out in full', () => {
  const resampled: ProjectionResult = {
    ...spectrum,
    loadings: {
      ...(spectrum.loadings as NonNullable<ProjectionResult['loadings']>),
      variables: {
        kind: 'continuous',
        values: [800, 878.9834, 957.9668],
        label: 'Wavenumber',
        unit: 'cm⁻¹',
      },
    },
  };
  const html = render(resampled, { variablesCount: 2 });

  expect(html).toContain('>879 cm⁻¹</text>');
  expect(html).not.toContain('878.9834 cm⁻¹</text>');
  expect(
    variableTrack(
      profilesOf(resampled, { variablesView: 'weights' }),
      1,
      1,
      writeValue,
    ).readout,
  ).toBe('878.9834 cm⁻¹ · PC 2 weight +0.081');
});

test('a peak list draws sticks standing at the masses, not a line across slots', () => {
  const html = render(peaks, { variablesCount: 2 });

  expect(html).toContain('>m/z</text>');
  // The zero rule a stick is read from, one per panel.
  expect(count(html, /data-chart-rule="zero"/g)).toBe(2);

  // Three peaks, so three move-and-line pairs in the one path.
  const drawn = pathOf(html, 'component-0');

  expect(count(drawn, /M/g)).toBe(3);
  expect(count(drawn, /V/g)).toBe(3);

  // The gap 300 to 800 is ten times the gap 200 to 250, and is drawn so. A
  // band axis would put all three one slot apart.
  const at = [...drawn.matchAll(/M(?<x>[\d.]+) /g)].map((found) =>
    Number(found.groups?.x),
  );

  expect((at[2] as number) - (at[1] as number)).toBeGreaterThan(
    9 * ((at[1] as number) - (at[0] as number)),
  );
});

test('a peak list is never reordered by strength, since a mass has a place', () => {
  const strongest = render(peaks, {
    variablesCount: 1,
    variableOrder: 'strongest',
  });
  const original = render(peaks, {
    variablesCount: 1,
    variableOrder: 'original',
  });

  expect(pathOf(strongest, 'component-0')).toBe(
    pathOf(original, 'component-0'),
  );
});

test('a panel names its own colour, so the stack needs no key under it', () => {
  const html = render(iris);

  // The swatch and the name are the key: one per panel, in the panel's ink.
  expect(count(html, /background:#e69f00/g)).toBe(1);
  expect(html).not.toContain('Average sample');
  expect(html.toLowerCase()).not.toContain('reconstructed');
});

test('a run with no weights draws nothing rather than an empty frame', () => {
  const html = renderToStaticMarkup(
    <ProjectionVariablesTab profiles={null} width={620} height={480} />,
  );

  expect(html).not.toContain('<svg');
});

test('the tracking readout is written out, so a caller never rebuilds it', () => {
  const built = profilesOf(spectrum, { variablesView: 'weights' });
  const track = variableTrack(built, 1, 1, writeValue);

  expect(track.readout).toBe('1650 cm⁻¹ · PC 2 weight +0.081');
  expect(track.index).toBe(1);
  expect(track.label).toBe('1650 cm⁻¹');
  expect(track.position).toBe(1650);
  expect(track.series).toStrictEqual([
    { axis: 0, name: 'PC 1', color: '#e69f00', value: 0.5 },
    { axis: 1, name: 'PC 2', color: '#56b4e9', value: 0.081 },
  ]);
});

test('a negative weight is reported with a real minus sign, never a hyphen', () => {
  const built = profilesOf(iris, {
    variablesView: 'weights',
    variablesCount: 3,
  });

  expect(variableTrack(built, 2, 0, writeValue).readout).toBe(
    'Petal length · PC1 weight +0.58',
  );
  expect(variableTrack(built, 1, 0, writeValue).readout).toBe(
    'Sepal width · PC1 weight −0.269',
  );
});

/**
 * The panels the viewer would have built for this result and these options.
 * @param result - What the run produced.
 * @param over - The options that differ from the defaults.
 * @returns The panels.
 */
function profilesOf(
  result: ProjectionResult,
  over: Partial<ProjectionOptions>,
): LoadingProfiles {
  const options = { ...DEFAULT_PROJECTION_OPTIONS, ...over };
  return loadingProfiles({
    loadings: result.loadings ?? {
      weights: rowMatrix([]),
      variables: IRIS_AXIS,
    },
    axes: result.axes,
    view: options.variablesView,
    count: options.variablesCount,
    spread: options.spread,
    sharedScale: options.sharedScale,
    order: options.variableOrder,
  });
}

function render(
  result: ProjectionResult,
  over: Partial<ProjectionOptions> = {},
): string {
  const options = { ...DEFAULT_PROJECTION_OPTIONS, ...over };
  return renderToStaticMarkup(
    <ProjectionVariablesTab
      profiles={profilesOf(result, over)}
      options={options}
      width={620}
      height={480}
      testId="variables"
    />,
  );
}

function count(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}

function pathOf(html: string, id: string): string {
  const start = html.indexOf(`data-series="${id}"`);
  if (start === -1) return '';
  const from = html.indexOf('d="', start) + 3;
  return html.slice(from, html.indexOf('"', from));
}
