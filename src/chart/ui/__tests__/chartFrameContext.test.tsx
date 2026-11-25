import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ChartFrame } from '../ChartFrame.tsx';
import { useChartFrame } from '../chartFrameContext.ts';

/**
 * Chrome that writes down the plot it is told it floats over.
 * @returns A mark carrying the plot's left, top, width and height.
 */
function PlotReport(): ReactElement {
  const frame = useChartFrame();
  if (frame === null) return <span data-plot="none" />;
  const { left, top, width, height } = frame.plot;
  return <span data-plot={`${left} ${top} ${width} ${height}`} />;
}

test('the overlay reads the plot its frame laid out, wide labels and all', () => {
  const html = renderToStaticMarkup(
    <ChartFrame
      width={300}
      height={200}
      x={{ domain: [0, 1], label: 'Time' }}
      y={{ domain: [0, 60_000], label: 'Intensity' }}
      overlay={<PlotReport />}
    >
      {() => null}
    </ChartFrame>,
  );

  // `60,000` takes more than the usual 34 pixels, so the plot starts past
  // 10 + 34 + 17: the chrome is told where it really starts.
  expect(html).toContain('data-plot="80 10 208 139"');
});

test('chrome drawn over no frame is told so', () => {
  expect(renderToStaticMarkup(<PlotReport />)).toBe(
    '<span data-plot="none"></span>',
  );
});
