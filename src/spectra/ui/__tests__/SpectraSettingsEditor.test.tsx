import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { SpectraSettings } from '../../core/settings.ts';
import { EMPTY_SETTINGS } from '../../core/settings.ts';
import { SpectraSettingsEditor } from '../SpectraSettingsEditor.tsx';

const IR_WORKUP: SpectraSettings = {
  processor: {
    maxMemory: 268_435_456,
    normalization: {
      from: 400,
      to: 4000,
      numberOfPoints: 2048,
      exclusions: [{ from: 2200, to: 2400 }],
      filters: [
        { name: 'rollingBallBaseline' },
        { name: 'savitzkyGolay', options: { windowSize: 11, polynomial: 3 } },
        { name: 'normed', options: { algorithm: 'max', value: 100 } },
      ],
    },
  },
  postProcessing: {
    filters: [{ name: 'pqn' }],
    scale: { method: 'max' },
    ranges: [{ from: 1650, to: 1700, label: 'amide' }],
    calculations: [{ label: 'share', formula: 'amide' }],
  },
};

function noop(): void {
  // The panel is read here, never edited.
}

test('the panel is laid out as the pipeline runs, one part per stage', () => {
  const html = renderToStaticMarkup(
    <SpectraSettingsEditor value={EMPTY_SETTINGS} onChange={noop} />,
  );

  const grid = html.indexOf('Every spectrum onto one grid');
  const matrix = html.indexOf('The matrix of them all');

  expect(grid).toBeGreaterThan(-1);
  expect(matrix).toBeGreaterThan(grid);
});

test('settings that say nothing draw no complaint', () => {
  const html = renderToStaticMarkup(
    <SpectraSettingsEditor value={EMPTY_SETTINGS} onChange={noop} />,
  );

  expect(html).not.toContain('The settings as they stand');
});

test('a whole workup draws every step it names, numbered in the order they run', () => {
  const html = renderToStaticMarkup(
    <SpectraSettingsEditor value={IR_WORKUP} onChange={noop} />,
  );

  expect(html.indexOf('Rolling-ball baseline')).toBeLessThan(
    html.indexOf('Savitzky–Golay smoothing'),
  );
  expect(html).toContain('Normalize');
  expect(html).toContain('value="2048"');
  expect(html).toContain('value="256"');
  expect(html).toContain('amide');
});

test('the component picker is drawn only for a page that has a decomposition', () => {
  const without = renderToStaticMarkup(
    <SpectraSettingsEditor value={EMPTY_SETTINGS} onChange={noop} />,
  );
  const withPanel = renderToStaticMarkup(
    <SpectraSettingsEditor
      value={EMPTY_SETTINGS}
      onChange={noop}
      principalComponents={{
        selection: { x: 0, y: 1 },
        onSelectionChange: noop,
        count: 4,
        explainedVariance: [0.742, 0.153, 0.061, 0.024],
      }}
    />,
  );

  expect(without).not.toContain('Principal components');
  expect(withPanel).toContain('Principal components');
  expect(withPanel).toContain('PC1 — 74.2 %');
  expect(withPanel).toContain('89.5 %');
});

test('a value the processor would throw on is named rather than refused', () => {
  const html = renderToStaticMarkup(
    <SpectraSettingsEditor
      value={{
        ...EMPTY_SETTINGS,
        processor: { normalization: { from: 4000, to: 400 } },
      }}
      onChange={noop}
    />,
  );

  expect(html).toContain('The settings as they stand');
  expect(html).toContain('Resampling — From is not below to.');
  expect(html).toContain('value="4000"');
});
