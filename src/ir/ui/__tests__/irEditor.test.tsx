import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { IrSpectrum } from '../../core/irSpectrum.ts';
import { loadIrSpectra } from '../../core/loadIrSpectra.ts';
import { toIrSpectra } from '../../core/toIrSpectrum.ts';
import { IrEditor } from '../IrEditor.tsx';

/**
 * The fixture, as the viewer holds it.
 *
 * Read through the real reader rather than hand-built, so what the shell is
 * tested against is what a dropped file actually produces — including the bands
 * the picking finds in it.
 * @returns The five-band film.
 */
async function fiveBands(): Promise<IrSpectrum[]> {
  const { spectra } = await loadIrSpectra(
    readFileSync(
      join(import.meta.dirname, '../../core/__tests__/data/five-bands.jdx'),
    ),
    { fileName: 'five-bands.jdx' },
  );
  return toIrSpectra(spectra);
}

test('the shell draws the chart, its rails and the panels', async () => {
  const markup = renderToStaticMarkup(<IrEditor data={await fiveBands()} />);

  // The chart, with both axes named — the wavenumber one running backwards.
  expect(markup).toContain('wavenumber (cm⁻¹)');
  expect(markup).toContain('transmittance (%)');
  expect(markup).toContain('high at the left to low at the right');
  // The status bar.
  expect(markup).toContain('1 spectrum drawn of 1');
  expect(markup).toContain('Synthetic five-band film');
  // The panels that open by default, and not the one that does not.
  expect(markup).toContain('Bands');
  expect(markup).toContain('Spectra');
  expect(markup).not.toContain('Acquisition');
});

test('every tool is offered, and each carries its key', async () => {
  const markup = renderToStaticMarkup(<IrEditor data={await fiveBands()} />);

  expect(markup).toContain('Square zoom (b)');
  expect(markup).toContain('Read (r)');
  expect(markup).toContain('Zoom in (+)');
  expect(markup).toContain('Zoom to fit (f)');
  expect(markup).toContain('Pick the bands (p)');
  expect(markup).toContain('Absorbance or transmittance (t)');
  expect(markup).toContain('About the infrared viewer');
  expect(markup).toContain('Documentation (h)');
});

test('the spectra list hands over one spectrum or the whole of it', async () => {
  const markup = renderToStaticMarkup(<IrEditor data={await fiveBands()} />);

  expect(markup).toContain('aria-label="Download every spectrum"');
  expect(markup).toContain('aria-label="Download this spectrum"');
});

test('the bands are picked, listed, and offered what they might be', async () => {
  const markup = renderToStaticMarkup(<IrEditor data={await fiveBands()} />);

  // The carbonyl of the fixture, and what the table offers for it.
  expect(markup).toContain('1708');
  expect(markup).toContain('ketone C=O stretch');
  // The status bar counts what was found and what was assigned.
  expect(markup).toMatch(/\d+ bands, \d+ assigned/);
});

test('opening in absorbance names that axis instead', async () => {
  const markup = renderToStaticMarkup(
    <IrEditor data={await fiveBands()} mode="absorbance" />,
  );

  expect(markup).toContain('>absorbance<');
  expect(markup).not.toContain('transmittance (%)');
});

test('the panels asked for are the panels opened', async () => {
  const markup = renderToStaticMarkup(
    <IrEditor data={await fiveBands()} defaultPanelIds={['metadata']} />,
  );

  expect(markup).toContain('Acquisition');
  // What the file said about itself, which is what that panel is for.
  expect(markup).toContain('five-bands.jdx');
  expect(markup).toContain('jcamp');
});

test('a viewer opened on nothing says so rather than drawing an empty chart', () => {
  const markup = renderToStaticMarkup(<IrEditor />);

  expect(markup).toContain('no spectrum open');
  expect(markup).toContain('No spectrum is open');
  // And it still draws its axes, so the box does not collapse to nothing.
  expect(markup).toContain('wavenumber (cm⁻¹)');
});
