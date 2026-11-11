import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { toIrSpectrum } from '../../core/toIrSpectrum.ts';
import { FluorescenceEditor } from '../FluorescenceEditor.tsx';

/**
 * An emission spectrum as a fluorometer writes it: a 1 nm grid from 450 to
 * 650 nm, one band 800 tall at 520 nm on a baseline of 10.
 * @returns The spectrum, as the viewer holds it.
 */
function emission() {
  const points = 201;
  const wavenumber = new Float64Array(points);
  const intensity = new Float64Array(points);
  for (let index = 0; index < points; index++) {
    const wavelength = 450 + index;
    const offset = (wavelength - 520) / 18;
    wavenumber[index] = wavelength;
    intensity[index] = 10 + 800 * Math.exp(-0.5 * offset * offset);
  }
  return toIrSpectrum(
    {
      wavenumber,
      intensity,
      meta: null,
      origin: { format: 'text', fileName: 'emission.csv' },
      name: 'emission',
    },
    { id: 'emission', color: '#0072b2' },
  );
}

test('a fluorescence viewer reads intensity over wavelengths, short to long', () => {
  const markup = renderToStaticMarkup(
    <FluorescenceEditor data={[emission()]} />,
  );

  expect(markup).toContain('wavelength (nm)');
  expect(markup).toContain('>intensity<');
  expect(markup).toContain('short at the left to long at the right');
  expect(markup).toContain('aria-label="Fluorescence spectrum viewer"');
  expect(markup).toContain('aria-label="About the fluorescence viewer"');
  expect(markup).not.toContain('transmittance (%)');
  expect(markup).not.toContain('Absorbance or transmittance');
  expect(markup).not.toContain('wavenumber (cm⁻¹)');
});

test('the emission maximum is picked on the intensity and listed with it', () => {
  const markup = renderToStaticMarkup(
    <FluorescenceEditor data={[emission()]} />,
  );

  expect(markup).toContain('Pick the maxima (p)');
  expect(markup).toContain('>520</td>');
  expect(markup).toContain('>810</td>');
});
