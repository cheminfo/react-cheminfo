import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { plotRect } from '../../../chart/core/chartGeometry.ts';
import { chartPixel, chartScale } from '../../../chart/core/chartScale.ts';
import {
  peakFixture,
  spectrumFixture,
} from '../../core/__tests__/spectrumFixture.ts';
import { XPS_PEAK_LABEL } from '../../core/xpsChartTheme.ts';
import { PeakLabels } from '../PeakLabels.tsx';

const plot = plotRect({ width: 600, height: 400 });
// Binding energy decreasing left to right, as an XPS chart is read.
const xScale = chartScale(300, 280, plot.left, plot.right);
const yScale = chartScale(0, 1000, plot.bottom, plot.top);

/**
 * The labels of one spectrum's peaks, as markup.
 * @param energies - Where the peaks sit, in eV of binding energy.
 * @returns The SVG markup.
 */
function labelsOf(energies: number[]): string {
  const spectrum = spectrumFixture('a', {
    energy: [280, 290, 300],
    counts: [100, 100, 100],
    peaks: energies.map((energy, index) =>
      peakFixture(`p${index}`, energy, 500),
    ),
  });
  return renderToStaticMarkup(
    <svg>
      <PeakLabels
        spectrum={spectrum}
        axis="binding"
        plot={plot}
        xScale={xScale}
        yScale={yScale}
        limit={10}
      />
    </svg>,
  );
}

test('a label clear of the edges is written over its peak', () => {
  const markup = labelsOf([290]);
  const x = chartPixel(xScale, 290);

  expect(markup).toContain(`<line x1="${x}"`);
  expect(markup).toContain(`<tspan x="${x}"`);
});

test('a label at the edge is slid inside the plot, its mark left on the peak', () => {
  const markup = labelsOf([299.8]);
  const x = chartPixel(xScale, 299.8);

  expect(x).toBeLessThan(plot.left + XPS_PEAK_LABEL.width / 2);
  expect(markup).toContain(`<line x1="${x}"`);
  expect(markup).toContain(
    `<tspan x="${plot.left + XPS_PEAK_LABEL.width / 2}"`,
  );
  expect(markup).toContain('299.80');
});
