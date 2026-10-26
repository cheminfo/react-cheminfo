import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { plotRect } from '../../../chart/core/chartGeometry.ts';
import { chartPixel, chartScale } from '../../../chart/core/chartScale.ts';
import { PEAK_LABEL } from '../../../chart/core/chartTheme.ts';
import type { MassSpectrum } from '../../core/massSpectrum.ts';
import { PeakLabels } from '../PeakLabels.tsx';

const plot = plotRect({ width: 600, height: 400 });
const xScale = chartScale(100, 400, plot.left, plot.right);
const yScale = chartScale(0, 100, plot.bottom, plot.top);

const FIRST = 200.1234;

test('a named peak carries a mark on the top of its stick', () => {
  const markup = renderToStaticMarkup(
    <svg>
      <PeakLabels
        spectrum={centroided('a', [FIRST], [100])}
        plot={plot}
        xScale={xScale}
        yScale={yScale}
      />
    </svg>,
  );

  const x = chartPixel(xScale, FIRST);
  const tip = chartPixel(yScale, 100);

  // Down from the tip and not up: the numbers are written in the clear space
  // above it.
  expect(markup).toContain(
    `x1="${x}" y1="${tip}" x2="${x}" y2="${tip + PEAK_LABEL.topMark}"`,
  );
  expect(markup).toContain('200.1234');
});

test('the numbers are haloed, and the halo is painted under them', () => {
  const markup = renderToStaticMarkup(
    <svg>
      <PeakLabels
        spectrum={centroided('a', [FIRST], [100])}
        plot={plot}
        xScale={xScale}
        yScale={yScale}
      />
    </svg>,
  );

  // Without `paint-order` the halo goes over the glyphs it is there to clear a
  // space for, which writes the whole stack in the colour of the paper.
  expect(markup).toContain('paint-order:stroke');
  expect(markup).toContain('stroke:var(--spectrum-label-halo, #ffffff)');
});

test('the peak crowded out of its numbers keeps the mark on its tip', () => {
  const markup = renderToStaticMarkup(
    <svg>
      <PeakLabels
        // Clear of the selection's own slots, and still closer than a label is
        // wide on a plot this size.
        spectrum={centroided('a', [200, 231], [40, 100])}
        plot={plot}
        xScale={xScale}
        yScale={yScale}
      />
    </svg>,
  );

  expect(markup).toContain('231.0000');
  expect(markup).not.toContain('200.0000');
  // The mark is what says the peak was picked, and it is drawn either way.
  expect(markup.match(/<line/g)).toHaveLength(2);
});

test('a stack answers the pointer only where somebody asked it to', () => {
  const labels = (
    <PeakLabels
      spectrum={centroided('a', [FIRST], [100])}
      plot={plot}
      xScale={xScale}
      yScale={yScale}
    />
  );

  // The numbers themselves never take a pointer event; the room they occupy
  // does, and only for a chart that has somewhere to report it.
  const asked = renderToStaticMarkup(<svg>{labels}</svg>);

  expect(asked).not.toContain('<rect');

  const hoverable = renderToStaticMarkup(
    <svg>
      <PeakLabels
        spectrum={centroided('a', [FIRST], [100])}
        plot={plot}
        xScale={xScale}
        yScale={yScale}
        onHover={() => undefined}
      />
    </svg>,
  );

  expect(hoverable).toContain(
    `<rect x="${chartPixel(xScale, FIRST) - PEAK_LABEL.hoverHalfWidth}"`,
  );
  expect(hoverable).toContain(`width="${PEAK_LABEL.hoverHalfWidth * 2}"`);
});

test('the mark hangs under the tip on the mirrored half', () => {
  // The reflection `MirrorLayer` hands the lower half, over a window holding
  // both signs of the axis it is reflected in.
  const mirrored = chartScale(-100, 100, plot.bottom, plot.top);
  const invertedScale = {
    offset: mirrored.offset,
    factor: -mirrored.factor,
  };

  const markup = renderToStaticMarkup(
    <svg>
      <PeakLabels
        below
        spectrum={centroided('a', [FIRST], [100])}
        plot={plot}
        xScale={xScale}
        yScale={invertedScale}
      />
    </svg>,
  );

  const tip = chartPixel(invertedScale, 100);

  expect(markup).toContain(`y2="${tip - PEAK_LABEL.topMark}"`);
});

/**
 * A centroided spectrum with the peaks the test asks for.
 * @param id - Its identity.
 * @param mz - The m/z of each peak, ascending.
 * @param intensity - The intensity of each.
 * @returns The spectrum, drawn as its sticks.
 */
function centroided(
  id: string,
  mz: number[],
  intensity: number[],
): MassSpectrum {
  return {
    id,
    name: id,
    color: '#000000',
    profile: null,
    centroid: {
      x: Float64Array.from(mz),
      y: Float64Array.from(intensity),
      charge: new Int16Array(mz.length),
    },
    meta: null,
    origin: { format: 'text' },
    showProfile: false,
    showCentroid: true,
  };
}
