import { expect, test, vi } from 'vitest';

import { loadUvVisSpectra } from '../loadUvVisSpectra.ts';

// What uv-spectrum reads from a fluorometer's export: the light emitted, with
// no absorbance or transmittance derived from it.
vi.mock('uv-spectrum', () => ({
  from: () => ({
    spectra: [
      {
        dataType: 'FLUORESCENCE SPECTRUM',
        variables: {
          x: { data: [400, 410, 420], label: 'Wavelength', units: 'nm' },
          y: { data: [12, 30, 18], label: 'Intensity', units: '' },
        },
      },
    ],
  }),
}));

test('a fluorescence spectrum is refused, saying it is emitted light', async () => {
  await expect(
    loadUvVisSpectra('400,12\n410,30\n420,18', { fileName: 'emission.csv' }),
  ).rejects.toThrow(
    'emission.csv is a fluorescence spectrum, light the sample emits rather than absorbs, which this viewer does not read: it reads absorbance and transmittance.',
  );
});
