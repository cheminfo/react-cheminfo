import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { calciteSpectrum as calcite } from '../../core/__tests__/ramanFixture.ts';
import { IrEditor } from '../IrEditor.tsx';
import { RamanEditor } from '../RamanEditor.tsx';

beforeAll(async () => {
  await CHROME_CATALOG.load('fr');
});

test('a Raman viewer names its axes for Raman and runs them low to high', () => {
  const markup = renderToStaticMarkup(<RamanEditor data={[calcite()]} />);

  expect(markup).toContain('Raman shift (cm⁻¹)');
  expect(markup).toContain('>intensity<');
  expect(markup).toContain('low at the left to high at the right');
  expect(markup).toContain('200–3200 cm⁻¹');
  expect(markup).not.toContain('wavenumber (cm⁻¹)');
  expect(markup).not.toContain('transmittance (%)');
});

test('a Raman viewer offers no mode toggle and no assignments', () => {
  const markup = renderToStaticMarkup(<RamanEditor data={[calcite()]} />);

  expect(markup).not.toContain('Absorbance or transmittance');
  expect(markup).not.toContain('Name the assignments');
  expect(markup).not.toContain('could be');
  expect(markup).not.toContain('assigned');
});

test('a Raman viewer keeps the shell: the panels, the zoom tools and the export', () => {
  const markup = renderToStaticMarkup(<RamanEditor data={[calcite()]} />);

  expect(markup).toContain('aria-label="Raman spectrum tools"');
  expect(markup).toContain('aria-label="Raman spectrum viewer"');
  expect(markup).toContain('aria-label="About the Raman viewer"');
  expect(markup).toContain('aria-label="Download every spectrum"');
  expect(markup).toContain('aria-label="Download this spectrum"');
  expect(markup).toContain('Read (r)');
  expect(markup).toContain('Square zoom (b)');
  expect(markup).toContain('Zoom in (+)');
  expect(markup).toContain('Zoom out (-)');
  expect(markup).toContain('Zoom to fit (f)');
  expect(markup).toContain('Save figure… (x)');
  expect(markup).toContain('Pick the bands (p)');
  expect(markup).toContain('1 spectrum drawn of 1');
});

test('the Raman bands are picked on intensity and listed with it', () => {
  const markup = renderToStaticMarkup(<RamanEditor data={[calcite()]} />);

  expect(markup).toContain('3 bands');

  for (const cell of ['1000', '1600', '2900', '5100', '3100', '1100']) {
    expect(markup).toContain(`>${cell}</td>`);
  }
});

test('the acquisition panel says the spectrum came from a WDF file', () => {
  const markup = renderToStaticMarkup(
    <RamanEditor data={[calcite()]} defaultPanelIds={['metadata']} />,
  );

  expect(markup).toContain('>wdf</td>');
  expect(markup).toContain('calcite.wdf');
  expect(markup).toContain('>1501</td>');
});

test('a French page writes the Raman words in French, and infrared in English', () => {
  const raman = renderToStaticMarkup(
    <SiteLanguage value="fr">
      <RamanEditor data={[calcite()]} />
    </SiteLanguage>,
  );
  const infrared = renderToStaticMarkup(
    <SiteLanguage value="fr">
      <IrEditor />
    </SiteLanguage>,
  );

  expect(raman).toContain('déplacement Raman (cm⁻¹)');
  expect(raman).toContain('>intensité<');
  expect(raman).toContain('aria-label="Outils du spectre Raman"');
  expect(raman).toContain('aria-label="À propos de la visionneuse Raman"');
  expect(infrared).toContain('wavenumber (cm⁻¹)');
  expect(infrared).toContain('aria-label="Infrared spectrum tools"');
});
