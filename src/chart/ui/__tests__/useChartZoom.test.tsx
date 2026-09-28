// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test } from 'vitest';

import type { ChartDomain } from '../../core/chartDomain.ts';
import { chartPixel } from '../../core/chartScale.ts';
import type { ChartZoom } from '../useChartZoom.ts';

import {
  installProbeStubs,
  mount,
  plot,
  resetProbes,
  zoom,
} from './zoomProbe.tsx';

beforeEach(installProbeStubs);

afterEach(resetProbes);

test('a drag zooms to the region under it', () => {
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const { drag } = mount({ fitted });

  // The plot spans x 60..584+60; a drag across its middle.
  drag({ x: plot.left + 100, y: 100 }, { x: plot.left + 300, y: 120 });

  const shown = zoom?.domain as ChartDomain;

  expect(shown.x[0]).toBeGreaterThan(fitted.x[0]);
  expect(shown.x[1]).toBeLessThan(fitted.x[1]);
  // The value axis was not asked for, so it stayed where it was.
  expect(shown.y).toStrictEqual(fitted.y);
});

test('a reversed axis zooms to what was dragged over, not to its mirror', () => {
  // Wavenumbers: 4000 at the left edge, 400 at the right.
  const fitted: ChartDomain = { x: [400, 4000], y: [0, 100] };
  const { drag } = mount({ fitted, reverseX: true });

  // A drag over the left third of the plot, which on this axis is the HIGH
  // wavenumbers — the C–H and O–H end of an infrared spectrum.
  drag({ x: plot.left + 20, y: 100 }, { x: plot.left + 180, y: 120 });

  const shown = zoom?.domain as ChartDomain;

  // Still stated low end first, and it is the high-wavenumber end of the axis.
  expect(shown.x[0]).toBeLessThan(shown.x[1]);
  expect(shown.x[1]).toBeGreaterThan(3000);
  expect(shown.x[0]).toBeGreaterThan(2500);
});

test('the scales the gestures were measured against are handed back', () => {
  const fitted: ChartDomain = { x: [400, 4000], y: [0, 100] };
  mount({ fitted, reverseX: true });

  const { xScale } = zoom as ChartZoom;

  // The low end of the window is at the RIGHT edge of the plot, which is what
  // drawing with this scale is what makes the chart agree with its own drags.
  expect(chartPixel(xScale, 400)).toBeCloseTo(plot.right, 6);
  expect(chartPixel(xScale, 4000)).toBeCloseTo(plot.left, 6);
});

test('an ordinary drag on a transmittance axis leaves the value axis alone', () => {
  // Percent transmittance: the trace hangs from 100, near the top of the plot.
  const fitted: ChartDomain = { x: [400, 4000], y: [0, 104] };
  const { drag } = mount({
    fitted,
    reverseX: true,
    yAxis: { baseline: 100, keepBaseline: false, pointsDown: true },
  });

  // Released well inside the plot, over the bands.
  drag({ x: plot.left + 100, y: 200 }, { x: plot.left + 300, y: 240 });

  // The gesture asked for the wavenumber axis, and only that: a baseline at the
  // top of the plot must not make every drag take the height too.
  expect((zoom?.domain as ChartDomain).y).toStrictEqual(fitted.y);
});

test('a transmittance drag released above the baseline does take the value axis', () => {
  const fitted: ChartDomain = { x: [400, 4000], y: [0, 104] };
  const { drag } = mount({
    fitted,
    reverseX: true,
    yAxis: { baseline: 100, keepBaseline: false, pointsDown: true },
  });

  // Up in the strip above 100 %T, which is the deliberate gesture.
  drag({ x: plot.left + 100, y: 200 }, { x: plot.left + 300, y: plot.top + 1 });

  const shown = zoom?.domain as ChartDomain;

  expect(shown.y).not.toStrictEqual(fitted.y);
  expect(shown.y[0]).toBeLessThan(shown.y[1]);
});

test('the wheel scales the value axis about its baseline', () => {
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const { wheel } = mount({ fitted });

  const prevented = wheel(-100);

  const shown = zoom?.domain as ChartDomain;

  expect(prevented).toBe(true);
  expect(shown.y[0]).toBe(0);
  expect(shown.y[1]).toBeLessThan(100);
  // Only the value axis: the wheel says nothing about where along the x axis it
  // was turned.
  expect(shown.x).toStrictEqual(fitted.x);
});

test('a chart that does not answer the wheel leaves the page its scroll', () => {
  // Percent transmittance, where the axis is bounded and the gesture is off.
  const fitted: ChartDomain = { x: [400, 4000], y: [0, 104] };
  const { wheel } = mount({
    fitted,
    reverseX: true,
    wheel: false,
    yAxis: { baseline: 100, keepBaseline: false, pointsDown: true },
  });

  const prevented = wheel(-100);

  // Not merely unzoomed — unrefused, so the page under the pointer scrolls as it
  // does anywhere else. Swallowing the gesture and doing nothing is the one
  // outcome nobody asked for.
  expect(prevented).toBe(false);
  expect(zoom?.domain).toStrictEqual(fitted);
});

test('new data refits the window while a host is imposing one', () => {
  // A viewer that keeps the window in its own state is told every window the
  // chart arrives at and hands the same one back, so it imposes one at every
  // moment after the first — and reflecting the chart about zero is new data.
  const upward: ChartDomain = { x: [0, 600], y: [0, 100] };
  const mirrored: ChartDomain = { x: [0, 600], y: [-100, 100] };
  const { rerender } = mount({
    fitted: upward,
    fitKey: 'upward',
    domain: upward,
  });

  rerender({ fitted: mirrored, fitKey: 'mirror', domain: upward });

  // Not the window the host is still handing back: half of the chart is now
  // drawn below the axis, and that half has to be inside the window.
  expect(zoom?.domain).toStrictEqual(mirrored);
});

test('a window a host imposes as the data changes is the one shown', () => {
  const upward: ChartDomain = { x: [0, 600], y: [0, 100] };
  const mirrored: ChartDomain = { x: [0, 600], y: [-100, 100] };
  const asked: ChartDomain = { x: [120, 180], y: [-100, 100] };
  const { rerender } = mount({
    fitted: upward,
    fitKey: 'upward',
    domain: upward,
  });

  // Both at once: a peak framed from a table beside the chart, of a spectrum
  // that has only just been reflected.
  rerender({ fitted: mirrored, fitKey: 'mirror', domain: asked });

  expect(zoom?.domain).toStrictEqual(asked);
});

test('a change of what the value axis is fitted to keeps the reading window', () => {
  // A loading spectrum: the masses are the run's, the height is the component's.
  const first: ChartDomain = { x: [100, 900], y: [-0.2, 0.2] };
  const second: ChartDomain = { x: [100, 900], y: [-0.05, 0.05] };
  const { drag, rerender } = mount({ fitted: first, yFitKey: 'PC1' });

  drag({ x: plot.left + 100, y: 100 }, { x: plot.left + 300, y: 120 });
  const zoomed = (zoom?.domain as ChartDomain).x;

  rerender({ fitted: second, yFitKey: 'PC2' });

  const shown = zoom?.domain as ChartDomain;

  // The masses are where the reader left them; the loadings are the new
  // component's own.
  expect(shown.x).toStrictEqual(zoomed);
  expect(shown.y).toStrictEqual(second.y);
});

test('both keys changing at once is the whole fit, not the old window at a new height', () => {
  const first: ChartDomain = { x: [100, 900], y: [-0.2, 0.2] };
  const second: ChartDomain = { x: [50, 400], y: [-0.05, 0.05] };
  const { drag, rerender } = mount({
    fitted: first,
    fitKey: 'run-one',
    yFitKey: 'PC1',
  });

  drag({ x: plot.left + 100, y: 100 }, { x: plot.left + 300, y: 120 });

  // Another run decomposed, read from its first component: nothing of the
  // window that was zoomed to the columns of the last one may survive.
  rerender({ fitted: second, fitKey: 'run-two', yFitKey: 'PC1' });

  expect(zoom?.domain).toStrictEqual(second);
});

test('the box tool takes both axes wherever it is released', () => {
  const fitted: ChartDomain = { x: [400, 4000], y: [0, 104] };
  const { drag } = mount({
    fitted,
    reverseX: true,
    drag: 'box',
    yAxis: { baseline: 100, keepBaseline: false, pointsDown: true },
  });

  drag({ x: plot.left + 100, y: 150 }, { x: plot.left + 300, y: 250 });

  const shown = zoom?.domain as ChartDomain;

  // Both axes narrowed, and the x window is the high-wavenumber side dragged.
  expect(shown.x[1] - shown.x[0]).toBeLessThan(fitted.x[1] - fitted.x[0]);
  expect(shown.y[1] - shown.y[0]).toBeLessThan(fitted.y[1] - fitted.y[0]);
  expect(shown.y[0]).toBeGreaterThan(0);
  expect(shown.y[1]).toBeLessThan(104);
});

test('new data leaves the horizontal half of an imposed window alone', () => {
  // The gesture the rule exists for: a reader zooms onto one ion and then adds
  // another measurement to compare it against — another pixel of a section,
  // another scan of a run. The host keeps its window because the new data
  // belongs in it, and refitting the masses would throw away the comparison.
  const whole: ChartDomain = { x: [100, 900], y: [0, 100] };
  const onOneIon: ChartDomain = { x: [724.8, 726.2], y: [0, 100] };
  const withBoth: ChartDomain = { x: [100, 900], y: [0, 240] };
  const { rerender } = mount({
    fitted: whole,
    fitKey: 'one',
    domain: onOneIon,
  });

  rerender({ fitted: withBoth, fitKey: 'one two', domain: onOneIon });

  // The masses stayed where the reader put them; the height took in the
  // brighter of the two, which is a fact about the data rather than about
  // where anyone is looking.
  expect(zoom?.domain).toStrictEqual({ x: [724.8, 726.2], y: [0, 240] });
});

test('new data with no window imposed refits both axes', () => {
  const whole: ChartDomain = { x: [100, 900], y: [0, 100] };
  const withBoth: ChartDomain = { x: [50, 950], y: [0, 240] };
  const { rerender } = mount({ fitted: whole, fitKey: 'one' });

  rerender({ fitted: withBoth, fitKey: 'one two' });

  // Nothing is being kept, so a file dropped in is shown whole — which is what
  // a host asks for by giving its window up.
  expect(zoom?.domain).toStrictEqual(withBoth);
});
