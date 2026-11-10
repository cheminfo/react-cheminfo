import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { loadSpectra } from '../../core/loadSpectra.ts';
import type { XpsSpectrum } from '../../core/xpsSpectrum.ts';
import { DEFAULT_SETTINGS } from '../../core/xpsState.ts';
import { XpsChart } from '../XpsChart.tsx';
import { XpsEditor } from '../XpsEditor.tsx';

/**
 * The spectra of one of the example files.
 * @param name - Its name, without the extension.
 * @returns The spectra it holds.
 */
async function vamasFixture(name: string): Promise<XpsSpectrum[]> {
  const bytes = readFileSync(
    join(import.meta.dirname, '../../core/__tests__/data', `${name}.vms`),
  );
  const { spectra } = await loadSpectra(bytes, { fileName: `${name}.vms` });
  return spectra;
}

/**
 * Where an axis label is written along the bottom.
 * @param markup - The chart.
 * @param label - The tick label.
 * @returns Its horizontal position, `NaN` when it is not written.
 */
function tickX(markup: string, label: string): number {
  const found = new RegExp(
    String.raw`<text x="([\d.]+)"[^>]*dominant-baseline="hanging"[^>]*>${label}</text>`,
  ).exec(markup);
  return found === null ? Number.NaN : Number(found[1]);
}

test('the editor draws the chart, its rails and the panels', async () => {
  const markup = renderToStaticMarkup(
    <XpsEditor
      data={await vamasFixture('cellulose_fitted_following_briggs')}
    />,
  );

  expect(markup).toContain(
    'aria-label="X-ray photoelectron spectrum, drawn with binding energy decreasing from left to right.',
  );
  expect(markup).toContain('aria-label="XPS chart tools"');
  expect(markup).toContain('aria-label="About the XPS viewer"');
  // The status bar and the spectra list, grouped under the one sample.
  expect(markup).toContain('4 spectra drawn of 4');
  expect(markup).toContain('4 spectra, 4 drawn');
  expect(markup).toContain('Survey · 1151 points');
  expect(markup).toContain('C 1s · 241 points');
  // The panels that open by default.
  expect(markup).toContain('aria-label="Close the spectra panel"');
  expect(markup).toContain('aria-label="Close the peaks panel"');
});

test('the chart alone draws on binding energy, backwards', async () => {
  const spectra = await vamasFixture('cellulose_fitted_following_briggs');
  const markup = renderToStaticMarkup(
    <XpsChart
      spectra={spectra}
      settings={DEFAULT_SETTINGS}
      domain={null}
      onDomainChange={() => undefined}
    />,
  );

  expect(markup).toContain('>Binding energy (eV)</text>');
  expect(markup).toContain('>Counts</text>');
  // High binding energy on the left: the axis runs backwards, the data does not.
  expect(tickX(markup, '1000')).toBeLessThan(tickX(markup, '0'));
  // The regions the fit was made over are shaded and named.
  expect(markup).toContain('var(--xps-region, rgba(100, 116, 139, 0.09))');
  expect(markup).toContain('>C 1s</text>');
  expect(markup).toContain('>O 1s</text>');
});
