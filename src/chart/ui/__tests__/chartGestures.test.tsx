// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test } from 'vitest';

import type { ChartDomain } from '../../core/chartDomain.ts';

import {
  installProbeStubs,
  mount,
  plot,
  resetProbes,
  zoom,
} from './zoomProbe.tsx';

beforeEach(installProbeStubs);

afterEach(resetProbes);

test('a press that went nowhere is a click, reported in data units', () => {
  // The plot is 524 user units wide from x 60 and 356 tall from y 10, so the
  // middle of it is x 322, y 188 — which on this window is m/z 300 at half the
  // base peak.
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const clicks: Array<{ x: number; y: number }> = [];
  const { drag } = mount({
    fitted,
    onClick: (point) => clicks.push(point),
  });

  drag({ x: 322, y: 188 }, { x: 322, y: 188 });

  expect(clicks).toStrictEqual([{ x: 300, y: 50 }]);
  // The very window it started with, not an equal one worked out again: a click
  // is not a zoom, and nothing about the chart moved.
  expect(zoom?.domain).toBe(fitted);
});

test('a click let go over the axis labels is not reported', () => {
  // Below the plot, out in the margin the tick labels are written in — a value
  // the chart is not drawing at all.
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const clicks: Array<{ x: number; y: number }> = [];
  const { drag } = mount({
    fitted,
    onClick: (point) => clicks.push(point),
  });

  drag({ x: 322, y: plot.bottom + 20 }, { x: 322, y: plot.bottom + 20 });

  expect(clicks).toStrictEqual([]);
});

test('a press the host refuses is never captured, and moves nothing', () => {
  const captured: number[] = [];
  Element.prototype.setPointerCapture = (pointerId: number) => {
    captured.push(pointerId);
  };
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const { drag } = mount({ fitted, shouldStartDrag: () => false });

  drag({ x: 191, y: 100 }, { x: 453, y: 120 });

  // Uncaptured is the whole of the point: a handle drawn on the chart keeps the
  // move events that drag it, which it never would if the chart took the pointer
  // and then decided against the gesture.
  expect(captured).toStrictEqual([]);
  expect(zoom?.domain).toBe(fitted);
});

test('a select drag reports the range it swept out and leaves the window alone', () => {
  // x 191 and x 453 are a quarter and three quarters across a 524-unit plot, so
  // on a window of 0 to 600 they are exactly 150 and 450.
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const ranges: Array<[number, number]> = [];
  const { drag } = mount({
    fitted,
    drag: 'select',
    onSelectRange: (range) => ranges.push(range),
  });

  drag({ x: 191, y: 100 }, { x: 453, y: 120 });

  expect(ranges).toStrictEqual([[150, 450]]);
  // Identity, not equality: a window rebuilt from the same four numbers would
  // still be a chart that zoomed, and integrating a peak must not take its
  // neighbours off the screen.
  expect(zoom?.domain).toBe(fitted);
});

test('a select drag made right to left reports its range low end first', () => {
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const ranges: Array<[number, number]> = [];
  const { drag } = mount({
    fitted,
    drag: 'select',
    onSelectRange: (range) => ranges.push(range),
  });

  drag({ x: 453, y: 120 }, { x: 191, y: 100 });

  // A range of 450 to 150 integrates nothing at all.
  expect(ranges).toStrictEqual([[150, 450]]);
  expect(zoom?.domain).toBe(fitted);
});

test('a drag that travelled only downwards is not a press that went nowhere', () => {
  // One user unit across and three hundred down, both ends well inside the plot:
  // too narrow to be a window, and far too long to be a click.
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const clicks: Array<{ x: number; y: number }> = [];
  const { drag } = mount({
    fitted,
    onClick: (point) => clicks.push(point),
  });

  drag({ x: 322, y: 40 }, { x: 323, y: 340 });

  expect(clicks).toStrictEqual([]);
  expect(zoom?.domain).toBe(fitted);
});

test('a near-vertical select drag reports neither a range nor a click', () => {
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const clicks: Array<{ x: number; y: number }> = [];
  const ranges: Array<[number, number]> = [];
  const { drag } = mount({
    fitted,
    drag: 'select',
    onSelectRange: (range) => ranges.push(range),
    onClick: (point) => clicks.push(point),
  });

  drag({ x: 322, y: 40 }, { x: 323, y: 340 });

  // A select drag's answer is a range or it is nothing; moving the cursor to a
  // scan instead would be answering a question nobody asked.
  expect(ranges).toStrictEqual([]);
  expect(clicks).toStrictEqual([]);
  expect(zoom?.domain).toBe(fitted);
});

test('a press that wobbled a couple of pixels is still a click', () => {
  // Two user units each way, which is what a press on a trackpad comes to; the
  // release at x 322, y 188 is m/z 300 at half the base peak.
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const clicks: Array<{ x: number; y: number }> = [];
  const { drag } = mount({
    fitted,
    onClick: (point) => clicks.push(point),
  });

  drag({ x: 320, y: 186 }, { x: 322, y: 188 });

  expect(clicks).toStrictEqual([{ x: 300, y: 50 }]);
  expect(zoom?.domain).toBe(fitted);
});

test('a select drag let go past the baseline still answers with an x range', () => {
  const fitted: ChartDomain = { x: [0, 600], y: [0, 100] };
  const ranges: Array<[number, number]> = [];
  const { drag } = mount({
    fitted,
    drag: 'select',
    onSelectRange: (range) => ranges.push(range),
  });

  // Released twenty units below the foot of the plot, which on a zoom drag is
  // how the value axis is asked for.
  drag({ x: 191, y: 100 }, { x: 453, y: plot.bottom + 20 });

  expect(ranges).toStrictEqual([[150, 450]]);
  // Identity: the height was never taken, so nothing about the window moved.
  expect(zoom?.domain).toBe(fitted);
});
