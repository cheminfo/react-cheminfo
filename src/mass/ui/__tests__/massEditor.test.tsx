import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { massFixture } from '../../core/__tests__/massFixtures.ts';
import { MassChart } from '../MassChart.tsx';
import { MassEditor } from '../MassEditor.tsx';

test('the shell draws the chart, its rails and the panels', async () => {
  const markup = renderToStaticMarkup(
    <MassEditor data={await massFixture('taxine-b-ms2.jdx')} />,
  );

  // The chart, with both axes named.
  expect(markup).toContain('aria-label="Mass spectrum. Drag across it');
  expect(markup).toContain('relative intensity (%)');
  // The status bar, resolution and all.
  expect(markup).toContain('1 spectrum drawn of 1');
  expect(markup).toContain('Taxine B HCD53');
  expect(markup).toContain('high resolution (R ≈ 16,000)');
  expect(markup).toContain('10 peaks');
  // The panels that open by default, and not the one that does not.
  expect(markup).toContain('aria-label="Close the spectra panel"');
  expect(markup).toContain('aria-label="Close the peaks panel"');
  expect(markup).not.toContain('aria-label="Close the acquisition panel"');
  // The row under the name says what kind of spectrum it is.
  expect(markup).toContain('profile · 10 peaks · high resolution');
});

test('every tool is offered, and each carries its key', async () => {
  const markup = renderToStaticMarkup(
    <MassEditor data={await massFixture('aflatoxin-peaks.jdx')} />,
  );

  expect(markup).toContain('Open spectra… (o)');
  expect(markup).toContain('Read (r)');
  expect(markup).toContain('Square zoom (b)');
  expect(markup).toContain('Zoom in (+)');
  expect(markup).toContain('Zoom to fit (f)');
  expect(markup).toContain('Label the peaks (l)');
  expect(markup).toContain('Write the charges (z)');
  expect(markup).toContain('About the mass spectrum viewer');
  expect(markup).toContain('Documentation (h)');
});

test('a nominal-mass table is written in whole numbers', async () => {
  const markup = renderToStaticMarkup(
    <MassEditor data={await massFixture('aflatoxin-peaks.jdx')} />,
  );

  expect(markup).toContain('nominal mass');
  expect(markup).toContain('m/z 0 – 331');
});

test('the chart alone labels the peaks of the first spectrum it draws', async () => {
  const spectra = await massFixture('taxine-b-ms2.jdx');
  const markup = renderToStaticMarkup(
    <MassChart spectra={spectra} width={760} height={400} />,
  );

  expect(markup).toContain('>194.1175</tspan>');
  expect(markup).toContain('>107.0493</tspan>');
  expect(
    renderToStaticMarkup(
      <MassChart
        spectra={spectra}
        width={760}
        height={400}
        showLabels={false}
      />,
    ),
  ).not.toContain('194.1175');
});

test('a host names a peak, and the name is written over its label', async () => {
  const spectra = await massFixture('taxine-b-ms2.jdx');
  const taxine = spectra[0];
  const markup = renderToStaticMarkup(
    <MassChart
      spectra={spectra}
      width={760}
      height={400}
      annotationLabels={new Map([[`${taxine?.id}:7`, 'C10H14N+']])}
    />,
  );

  expect(markup).toContain('>C10H14N+</tspan>');
});

test('the selected spectrum is written to its own decimals beside a resolved one', async () => {
  const aflatoxin = await massFixture('aflatoxin-peaks.jdx');
  const caffeine = await massFixture(
    'caffeine-peaks.txt',
    aflatoxin.map((spectrum) => spectrum.color),
  );
  const markup = renderToStaticMarkup(
    <MassEditor data={[...aflatoxin, ...caffeine]} />,
  );

  expect(markup).toContain('2 spectra drawn of 2');
  expect(markup).toContain('m/z 0 – 331');
  expect(markup).not.toContain('m/z 0.0000 – 331.0000');
});
