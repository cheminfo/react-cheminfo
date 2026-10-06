import { expect, test } from 'vitest';

import type { ChartDomain } from '../chartDomain.ts';
import { sameChartDomain } from '../chartDomain.ts';
import type { PlotRect } from '../chartGeometry.ts';
import { chartScale } from '../chartScale.ts';
import {
  DUAL_ZOOM_TRAVEL,
  MINIMUM_DRAG,
  draggedBeyondLevel,
  releasedBeyondBaseline,
  scaledYAxis,
  zoomSelection,
  zoomedDomain,
} from '../zoomDomain.ts';

/** A plot at the corner of the SVG, one pixel to one data unit. */
const plot: PlotRect = {
  left: 0,
  top: 0,
  width: 400,
  height: 200,
  right: 400,
  bottom: 200,
};

const shown: ChartDomain = { x: [100, 500], y: [0, 100] };
const xScale = chartScale(shown.x[0], shown.x[1], plot.left, plot.right);
const yScale = chartScale(shown.y[0], shown.y[1], plot.bottom, plot.top);

/** The same chart with the second spectrum reflected below the axis. */
const mirrored: ChartDomain = { x: [100, 500], y: [-100, 100] };
const mirroredY = chartScale(
  mirrored.y[0],
  mirrored.y[1],
  plot.bottom,
  plot.top,
);

/** Percent transmittance, which runs down from a baseline of 100. */
const transmittance: ChartDomain = { x: [400, 4000], y: [0, 100] };
const transmittanceY = chartScale(
  transmittance.y[0],
  transmittance.y[1],
  plot.bottom,
  plot.top,
);

test('two windows holding the same four numbers are the same window', () => {
  expect(sameChartDomain(shown, { x: [100, 500], y: [0, 100] })).toBe(true);
  expect(sameChartDomain(shown, { x: [100, 500], y: [0, 120] })).toBe(false);
  expect(sameChartDomain(shown, { x: [100.0001, 500], y: [0, 100] })).toBe(
    false,
  );
});

test('the baseline is where zero is, not where the plot ends', () => {
  expect(releasedBeyondBaseline(199, yScale)).toBe(false);
  expect(releasedBeyondBaseline(200, yScale)).toBe(false);
  expect(releasedBeyondBaseline(201, yScale)).toBe(true);

  // Mirrored, zero runs across the middle of the plot instead.
  expect(releasedBeyondBaseline(80, mirroredY)).toBe(false);
  expect(releasedBeyondBaseline(120, mirroredY)).toBe(true);
});

test('a baseline of 100 puts the line at the top of a transmittance plot', () => {
  expect(releasedBeyondBaseline(1, transmittanceY, 100)).toBe(true);
  expect(releasedBeyondBaseline(0, transmittanceY, 100)).toBe(false);
});

test('a drag across the plot zooms the x axis alone', () => {
  const drag = { fromX: 100, fromY: 50, toX: 300, toY: 60 };

  expect(zoomedDomain(shown, drag, plot, xScale, yScale)).toStrictEqual({
    x: [200, 400],
    y: [0, 100],
  });
});

test('a drag made right to left asks for the same window', () => {
  const drag = { fromX: 300, fromY: 60, toX: 100, toY: 50 };

  expect(zoomedDomain(shown, drag, plot, xScale, yScale)).toStrictEqual({
    x: [200, 400],
    y: [0, 100],
  });
});

test('an axis drawn right to left still comes back low end first', () => {
  // Wavenumbers, 4000 at the left edge and 400 at the right.
  const reversed: ChartDomain = { x: [400, 4000], y: [0, 1] };
  const reversedX = chartScale(
    reversed.x[0],
    reversed.x[1],
    plot.right,
    plot.left,
  );
  const drag = { fromX: 100, fromY: 50, toX: 300, toY: 60 };

  const zoomed = zoomedDomain(reversed, drag, plot, reversedX, yScale);

  expect(zoomed?.x[0]).toBeLessThan(zoomed?.x[1] as number);
  // A window end is a pixel read back through a multiply-add, so it carries
  // the last digit of one rather than the round number the drag happens to
  // land on.
  expect(zoomed?.x[0]).toBeCloseTo(1300, 9);
  expect(zoomed?.x[1]).toBeCloseTo(3100, 9);
  expect(zoomed?.y).toStrictEqual([0, 1]);
});

test('a click that wobbled asks for nothing', () => {
  const wobble = { fromX: 100, fromY: 50, toX: 103, toY: 51 };

  expect(zoomedDomain(shown, wobble, plot, xScale, yScale)).toBeNull();
  expect(MINIMUM_DRAG).toBe(4);
});

test('a drag released below the baseline takes the y axis with it', () => {
  const drag = { fromX: 100, fromY: 100, toX: 300, toY: 250 };

  expect(zoomedDomain(shown, drag, plot, xScale, yScale)).toStrictEqual({
    x: [200, 400],
    y: [0, 50],
  });
});

test('a drag out over the axis labels zooms to the edge of the data', () => {
  const drag = { fromX: -40, fromY: -30, toX: 460, toY: 260 };

  expect(zoomedDomain(shown, drag, plot, xScale, yScale)).toStrictEqual({
    x: [100, 500],
    y: [0, 100],
  });
});

test('a mirrored chart keeps its reflected half through a y axis drag', () => {
  const drag = { fromX: 100, fromY: 60, toX: 300, toY: 140 };

  expect(zoomedDomain(mirrored, drag, plot, xScale, mirroredY)).toStrictEqual({
    x: [200, 400],
    y: [-40, 40],
  });
});

test('a y window that collapsed leaves the axis as it was', () => {
  const drag = { fromX: 100, fromY: 200, toX: 300, toY: 260 };

  expect(zoomedDomain(shown, drag, plot, xScale, yScale)).toStrictEqual({
    x: [200, 400],
    y: [0, 100],
  });
});

test('a continuous trace is asked about between the two values dragged', () => {
  // Released at the very bottom, so the y axis comes along; the box covers 25
  // to 50 on a plot mapping [0, 100] onto 200 pixels.
  const drag = { fromX: 100, fromY: 100, toX: 300, toY: 250 };

  expect(
    zoomedDomain(shown, drag, plot, xScale, yScale, { keepBaseline: false }),
  ).toStrictEqual({ x: [200, 400], y: [0, 50] });

  const inside = { fromX: 100, fromY: 100, toX: 300, toY: 150 };

  expect(
    zoomedDomain(shown, inside, plot, xScale, yScale, {
      keepBaseline: false,
      baseline: 100,
    }),
  ).toStrictEqual({ x: [200, 400], y: [25, 50] });
});

test('keeping the baseline holds it in the window at either end', () => {
  const inside = { fromX: 100, fromY: 100, toX: 300, toY: 150 };

  // A baseline the data runs down from is kept above the drag, not below it.
  expect(
    zoomedDomain(shown, inside, plot, xScale, yScale, { baseline: 100 }),
  ).toStrictEqual({ x: [200, 400], y: [25, 100] });
});

test('the wheel scales the y axis about zero, so a stick keeps its foot', () => {
  expect(scaledYAxis(shown, 2)).toStrictEqual({
    x: [100, 500],
    y: [0, 200],
  });
  expect(scaledYAxis(mirrored, 0.5)).toStrictEqual({
    x: [100, 500],
    y: [-50, 50],
  });
});

test('the wheel scales percent transmittance about 100, not about zero', () => {
  expect(scaledYAxis(transmittance, 0.5, 100)).toStrictEqual({
    x: [400, 4000],
    y: [50, 100],
  });
});

test('a factor no window survives leaves the window alone', () => {
  expect(scaledYAxis(shown, 0)).toBe(shown);
  expect(scaledYAxis(shown, -1)).toBe(shown);
  expect(scaledYAxis(shown, Number.NaN)).toBe(shown);
  expect(scaledYAxis(shown, Number.POSITIVE_INFINITY)).toBe(shown);
});

test('the preview says whether letting go would take the height too', () => {
  expect(zoomSelection(null, yScale)).toBeNull();
  expect(
    zoomSelection({ fromX: 100, fromY: 50, toX: 300, toY: 60 }, yScale),
  ).toStrictEqual({
    fromX: 100,
    fromY: 50,
    toX: 300,
    toY: 60,
    zoomsYAxis: false,
  });
  expect(
    zoomSelection({ fromX: 100, fromY: 50, toX: 300, toY: 240 }, yScale)
      ?.zoomsYAxis,
  ).toBe(true);
});

test('the box tool takes the rectangle it was given, wherever it was let go', () => {
  // Released well inside the plot, which the reading gesture would ignore.
  const drag = { fromX: 100, fromY: 60, toX: 300, toY: 140 };

  expect(
    zoomedDomain(shown, drag, plot, xScale, yScale, { drag: 'box' }),
  ).toStrictEqual({ x: [200, 400], y: [30, 70] });
});

test('the box tool holds no baseline, whatever the axis rules say', () => {
  const drag = { fromX: 100, fromY: 60, toX: 300, toY: 140 };

  // `keepBaseline` is a stick spectrum's rule; the tool overrides it.
  expect(
    zoomedDomain(shown, drag, plot, xScale, yScale, {
      drag: 'box',
      keepBaseline: true,
    }),
  ).toStrictEqual({ x: [200, 400], y: [30, 70] });
});

test('the box preview is a rectangle from the first pixel of the gesture', () => {
  const drag = { fromX: 100, fromY: 50, toX: 300, toY: 60 };

  expect(zoomSelection(drag, yScale)?.zoomsYAxis).toBe(false);
  expect(zoomSelection(drag, yScale, { drag: 'box' })?.zoomsYAxis).toBe(true);
});

test('a select preview is a band however far past the baseline it strays', () => {
  const drag = { fromX: 100, fromY: 50, toX: 300, toY: 240 };

  // The reading gesture would take the height here, and does; the select drag
  // hands back two numbers on one axis, so its preview must promise no more.
  expect(zoomSelection(drag, yScale)?.zoomsYAxis).toBe(true);
  expect(zoomSelection(drag, yScale, { drag: 'select' })?.zoomsYAxis).toBe(
    false,
  );
});

test('a dual drag kept level narrows the horizontal axis alone', () => {
  // Ten pixels down, well inside the plot: the reading gesture would ignore it
  // and so does this, but the x window is asked for all the same.
  const drag = { fromX: 100, fromY: 50, toX: 300, toY: 60 };

  expect(
    zoomedDomain(shown, drag, plot, xScale, yScale, { drag: 'dual' }),
  ).toStrictEqual({ x: [200, 400], y: shown.y });
});

test('a dual drag that left its level takes the rectangle it drew', () => {
  // Eighty pixels down, nowhere near the baseline at the foot of the plot.
  const drag = { fromX: 100, fromY: 60, toX: 300, toY: 140 };

  expect(
    zoomedDomain(shown, drag, plot, xScale, yScale, { drag: 'dual' }),
  ).toStrictEqual({ x: [200, 400], y: [30, 70] });
});

test('a dual drag switches at DUAL_ZOOM_TRAVEL, upwards as readily as down', () => {
  const short = { fromX: 100, fromY: 100, toX: 300, toY: 100 + 23 };
  const long = { fromX: 100, fromY: 100, toX: 300, toY: 100 + 24 };
  const up = { fromX: 100, fromY: 100, toX: 300, toY: 100 - 24 };

  expect(DUAL_ZOOM_TRAVEL).toBe(24);
  expect(draggedBeyondLevel(short)).toBe(false);
  expect(draggedBeyondLevel(long)).toBe(true);
  expect(draggedBeyondLevel(up)).toBe(true);
  // And the threshold is clear of the wobble that makes a press a click.
  expect(DUAL_ZOOM_TRAVEL).toBeGreaterThan(MINIMUM_DRAG);
});

test('a dual drag holds no baseline, whatever the axis rules say', () => {
  const drag = { fromX: 100, fromY: 60, toX: 300, toY: 140 };

  // `keepBaseline` is a stick spectrum's rule; a rectangle drawn on purpose is
  // a promise about itself, exactly as the box tool's is.
  expect(
    zoomedDomain(shown, drag, plot, xScale, yScale, {
      drag: 'dual',
      keepBaseline: true,
    }),
  ).toStrictEqual({ x: [200, 400], y: [30, 70] });
});

test('the dual preview is a band until the drag leaves its level', () => {
  const level = { fromX: 100, fromY: 100, toX: 300, toY: 110 };
  const left = { fromX: 100, fromY: 100, toX: 300, toY: 140 };

  expect(zoomSelection(level, yScale, { drag: 'dual' })?.zoomsYAxis).toBe(
    false,
  );
  expect(zoomSelection(left, yScale, { drag: 'dual' })?.zoomsYAxis).toBe(true);
  // Coming back up promises a band again: the answer is the two corners and
  // nothing a previous frame remembered.
  expect(zoomSelection(level, yScale, { drag: 'dual' })?.zoomsYAxis).toBe(
    false,
  );
});

test('a dual drag ignores the baseline the reading gesture reads', () => {
  // Released below the foot of the plot, which is how `xAxis` is asked for the
  // height — but level with where it began, so this asks for none.
  const drag = { fromX: 100, fromY: 250, toX: 300, toY: 250 };

  expect(releasedBeyondBaseline(drag.toY, yScale)).toBe(true);
  expect(
    zoomedDomain(shown, drag, plot, xScale, yScale, { drag: 'dual' }),
  ).toStrictEqual({ x: [200, 400], y: shown.y });
});
