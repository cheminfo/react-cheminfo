import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { plotRect } from '../../core/chartGeometry.ts';
import { chartScale } from '../../core/chartScale.ts';
import type { AxesProps } from '../Axes.tsx';
import { Axes } from '../Axes.tsx';

// Rendered to a string rather than into a document: the axes hold no state of
// their own, so what they draw is the whole of what there is to check.

const plot = plotRect({ width: 600, height: 400 });

/**
 * The axes of a 600×400 chart, drawn with whatever one case says differently.
 *
 * The two windows are deliberately unequal — 0 to 100 across, 0 to 50 up — so
 * that `60`, `80` and `100` are labels only the horizontal axis can have
 * written, and a case can tell one axis's numbers from the other's by reading
 * them rather than by counting elements.
 * @param overrides - What this case wants said differently.
 * @returns The markup the axes drew.
 */
function drawAxes(overrides: Partial<AxesProps> = {}): string {
  return renderToStaticMarkup(
    <svg>
      <Axes
        plot={plot}
        xDomain={[0, 100]}
        yDomain={[0, 50]}
        xScale={chartScale(0, 100, plot.left, plot.right)}
        yScale={chartScale(0, 50, plot.bottom, plot.top)}
        xTitle="retention time (min)"
        yTitle="total ion current"
        {...overrides}
      />
    </svg>,
  );
}

/** The L of the two axis lines, at the margins `plotRect` keeps. */
const AXIS_LINE = '<path d="M60 10V366H584"';

test('a chart on its own writes both rows of numbers and both titles', () => {
  const markup = drawAxes();

  // Six ticks across (0 20 40 60 80 100), six up (0 10 20 30 40 50).
  expect(markup.match(/<line /g)).toHaveLength(12);
  expect(markup.match(/<text /g)).toHaveLength(14);
  expect(markup).toContain(AXIS_LINE);
  expect(markup).toContain('retention time (min)');
  expect(markup).toContain('>100</text>');
});

test('the value title stands beside its numbers rather than at the edge', () => {
  // `0` to `50` is two characters at most, so the title comes in from the far
  // side of the gutter to sit against them; a chromatogram writing `1.5e+8` in
  // the same 60 pixels pushes it back out to the floor.
  expect(drawAxes()).toContain('<text x="33" y="188" transform="rotate(-90');
  expect(
    drawAxes({ yDomain: [0, 2e8], yScale: chartScale(0, 2e8, 366, 10) }),
  ).toContain('<text x="9" y="188" transform="rotate(-90');
});

test('a pane above the foot of a stack writes no numbers along the bottom', () => {
  const markup = drawAxes({ showXTicks: false });

  // The six labels of the horizontal axis go; the six up the side and the two
  // titles stay.
  expect(markup.match(/<text /g)).toHaveLength(8);
  expect(markup).not.toContain('>60</text>');
  expect(markup).not.toContain('>80</text>');
  expect(markup).not.toContain('>100</text>');
  // The value axis is untouched: 10 and 30 are only ever its labels.
  expect(markup).toContain('>10</text>');
  expect(markup).toContain('>30</text>');
});

test('the grid and the axis line stay when the numbers under them go', () => {
  // They are what a peak's height is read against, so a pane that loses them
  // has stopped being a chart.
  const markup = drawAxes({ showXTicks: false, showXTitle: false });

  expect(markup.match(/<line /g)).toHaveLength(12);
  expect(markup).toContain(AXIS_LINE);
});

test('a pane that hands its axis down writes no name for it', () => {
  const markup = drawAxes({ showXTitle: false });

  expect(markup).not.toContain('retention time (min)');
  expect(markup).toContain('total ion current');
  // Only the one title goes; the numbers along the bottom are still written.
  expect(markup.match(/<text /g)).toHaveLength(13);
  expect(markup).toContain('>100</text>');
});

test('a chart in a narrow column asks for its numbers closer together', () => {
  // The two windows are unequal, so `60` can only have been written across and
  // `30` and `45` can only have been written up the side.
  const wide = drawAxes();

  expect(wide).toContain('>60</text>');
  expect(wide).toContain('>30</text>');
  expect(wide).not.toContain('>45</text>');

  // Given twice the room per label, both axes are aimed at half as many: the
  // bottom falls to 0, 50, 100 and the side to 0, 20, 40.
  const sparse = drawAxes({ xTickSpacing: 180, yTickSpacing: 88 });

  expect(sparse).not.toContain('>60</text>');
  expect(sparse).not.toContain('>30</text>');
  expect(sparse.match(/<line /g)).toHaveLength(6);

  // And given half the room, at twice as many: the side gains 5, 15, 25, 45.
  const dense = drawAxes({ xTickSpacing: 45, yTickSpacing: 22 });

  expect(dense).toContain('>45</text>');
  expect(dense).toContain('>90</text>');
  expect(dense.match(/<line /g)).toHaveLength(22);
});

test('an axis given its own values is ruled at them, and writes them its way', () => {
  const markup = drawAxes({
    yTickValues: [1, 10],
    formatYTick: (value) => `10^${Math.log10(value)}`,
  });

  expect(markup).toContain('>10^0</text>');
  expect(markup).toContain('>10^1</text>');
  // The room-based ticks are gone. `30` and `50` are labels only the value
  // axis would have written, so their absence is that axis and not the other.
  expect(markup).not.toContain('>30</text>');
  expect(markup).not.toContain('>50</text>');
  // The horizontal axis keeps its own ticks and its own notation.
  expect(markup).toContain('>60</text>');
});

test('a value the window has left behind is not ruled onto the margin', () => {
  const markup = drawAxes({ yTickValues: [10, 50, 500] });

  expect(markup).toContain('>10</text>');
  expect(markup).toContain('>50</text>');
  expect(markup).not.toContain('>500</text>');
});
