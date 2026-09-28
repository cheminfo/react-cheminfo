import { expect, test } from 'vitest';

import {
  IR_MODES,
  bandsPointDown,
  boxZoomOnly,
  otherIrMode,
  yAxisRules,
  yAxisTitle,
  zoomGestures,
} from '../irMode.ts';
import type { IrSpectrum } from '../irSpectrum.ts';
import { traceOf } from '../irSpectrum.ts';

const spectrum: IrSpectrum = {
  id: 'film',
  name: 'film',
  color: '#1f77b4',
  wavenumber: Float64Array.from([400, 800, 1200]),
  absorbance: Float64Array.from([0.1, 0.5, 0.2]),
  transmittance: Float64Array.from([79.4, 31.6, 63.1]),
  meta: null,
  origin: { format: 'jcamp' },
  visible: true,
};

test('transmittance is offered first, being what instruments export', () => {
  expect(IR_MODES).toStrictEqual(['transmittance', 'absorbance']);
});

test('percent transmittance hangs from a baseline of 100, absorbance from zero', () => {
  // `pointsDown` is which side of the baseline the data is on, and it is what
  // tells the zoom which way "released past the baseline" points. Getting it
  // wrong made every ordinary drag on a transmittance chart take the value axis
  // with it, the baseline being near the top of the plot rather than the foot.
  expect(yAxisRules('transmittance')).toStrictEqual({
    baseline: 100,
    keepBaseline: false,
    pointsDown: true,
  });
  expect(yAxisRules('absorbance')).toStrictEqual({
    baseline: 0,
    keepBaseline: false,
    pointsDown: false,
  });
});

test('percent transmittance is zoomed by rectangle alone, and not by the wheel', () => {
  // The axis is bounded and the trace fills it, so the only question worth a
  // gesture is "look closer at that corner".
  expect(zoomGestures('transmittance')).toStrictEqual({
    drag: 'box',
    wheel: false,
  });
  // The mode has the last word, not the tool: a reading drag chosen in
  // absorbance must not follow the chemist across the switch and answer with a
  // gesture that leaves the crowded axis exactly as it was.
  expect(zoomGestures('transmittance', 'xAxis')).toStrictEqual({
    drag: 'box',
    wheel: false,
  });
});

test('absorbance answers both drags and the wheel', () => {
  expect(zoomGestures('absorbance')).toStrictEqual({
    drag: 'xAxis',
    wheel: true,
  });
  expect(zoomGestures('absorbance', 'box')).toStrictEqual({
    drag: 'box',
    wheel: true,
  });
});

test('only transmittance settles the drag for the toolbar', () => {
  expect(boxZoomOnly('transmittance')).toBe(true);
  expect(boxZoomOnly('absorbance')).toBe(false);
});

test('a band points down in transmittance and up in absorbance', () => {
  expect(bandsPointDown('transmittance')).toBe(true);
  expect(bandsPointDown('absorbance')).toBe(false);
});

test('each mode names its own axis', () => {
  expect(yAxisTitle('transmittance')).toBe('transmittance (%)');
  expect(yAxisTitle('absorbance')).toBe('absorbance');
});

test('the toggle goes both ways', () => {
  expect(otherIrMode('transmittance')).toBe('absorbance');
  expect(otherIrMode('absorbance')).toBe('transmittance');
});

test('the trace shares the spectrum arrays rather than copying them', () => {
  const absorbance = traceOf(spectrum, 'absorbance');
  const transmittance = traceOf(spectrum, 'transmittance');

  expect(absorbance.x).toBe(spectrum.wavenumber);
  expect(absorbance.y).toBe(spectrum.absorbance);
  expect(transmittance.y).toBe(spectrum.transmittance);
});

test('both modes still answer exactly the gestures they always did', () => {
  // Splitting the drag union is a change to what the compiler will accept, not
  // to what either mode asks for: %T is a rectangle and no wheel, absorbance is
  // whichever drag the tool is on and the wheel throughout.
  expect(zoomGestures('transmittance')).toStrictEqual({
    drag: 'box',
    wheel: false,
  });
  expect(zoomGestures('transmittance', 'box')).toStrictEqual({
    drag: 'box',
    wheel: false,
  });
  expect(zoomGestures('absorbance')).toStrictEqual({
    drag: 'xAxis',
    wheel: true,
  });
  expect(zoomGestures('absorbance', 'box')).toStrictEqual({
    drag: 'box',
    wheel: true,
  });
});

test('a select drag cannot be handed to an infrared chart', () => {
  // A range swept out for integration is not a zoom, and this package draws no
  // handler for one — so a chart handed it would answer a drag by doing nothing
  // at all. The compiler is what keeps it out, and this line stops building the
  // day `zoomGestures` widens its tool back to the whole of `DragMode`.
  // @ts-expect-error -- 'select' is not a ZoomDragMode.
  const gestures = zoomGestures('absorbance', 'select');

  expect(gestures.wheel).toBe(true);
});
