import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { plotRect } from '../../../chart/core/chartGeometry.ts';
import { chartScale } from '../../../chart/core/chartScale.ts';
import {
  peakFixture,
  spectrumFixture,
} from '../../core/__tests__/spectrumFixture.ts';
import { NO_HIGHLIGHT } from '../../core/xpsHighlight.ts';
import { DEFAULT_SETTINGS } from '../../core/xpsState.ts';
import { ChartData } from '../ChartData.tsx';

const plot = plotRect({ width: 600, height: 400 });

test('a normalised spectrum on the kinetic axis keeps its peak labels', () => {
  const spectrum = spectrumFixture('a', {
    energy: [280, 285, 290],
    counts: [100, 500, 200],
    sourceEnergy: 1000,
    peaks: [peakFixture('p0', 285, 500)],
  });
  const markup = renderToStaticMarkup(
    <svg>
      <ChartData
        spectra={[spectrum]}
        settings={{
          ...DEFAULT_SETTINGS,
          energyAxis: 'kinetic',
          normalise: true,
          showLabels: true,
        }}
        axis="kinetic"
        plot={plot}
        xScale={chartScale(705, 725, plot.left, plot.right)}
        yScale={chartScale(0, 110, plot.bottom, plot.top)}
        selectedId={null}
        highlight={NO_HIGHLIGHT}
      />
    </svg>,
  );

  expect(markup).toContain('285.00');
});
