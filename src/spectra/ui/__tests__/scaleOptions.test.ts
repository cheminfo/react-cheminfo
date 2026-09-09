import { expect, test } from 'vitest';

import type { ScaleSettings } from '../../core/settings.ts';
import type { ScaleRange } from '../scaleOptions.ts';
import {
  SCALE_METHOD_OPTIONS,
  scaleMethodOptions,
  withScaleMethod,
  withScaleRange,
  withScaleTarget,
} from '../scaleOptions.ts';

test('the method menu offers doing nothing and then exactly the four scalings the processor matches', () => {
  expect(SCALE_METHOD_OPTIONS).toStrictEqual([
    { value: '', label: 'None — every spectrum is left as it is' },
    { value: 'min', label: 'Smallest value' },
    { value: 'max', label: 'Largest value' },
    { value: 'minmax', label: 'Both ends' },
    { value: 'integration', label: 'Integral' },
  ]);
});

test('settings holding no method get the plain menu, because None is already the first option', () => {
  expect(scaleMethodOptions(undefined)).toBe(SCALE_METHOD_OPTIONS);
  expect(scaleMethodOptions('')).toBe(SCALE_METHOD_OPTIONS);
});

test('a method the menu already spells gets the plain menu, with nothing appended', () => {
  const options = scaleMethodOptions('minmax');

  expect(options).toBe(SCALE_METHOD_OPTIONS);
  expect(options).toHaveLength(5);
});

test('a method in another case is added as its own option, because the select would otherwise draw None over a scaling that runs', () => {
  const options = scaleMethodOptions('MAX');

  expect(options).toHaveLength(6);
  expect(options[5]).toStrictEqual({
    value: 'MAX',
    label: 'MAX — Largest value',
  });
  expect(options.slice(0, 5)).toStrictEqual([...SCALE_METHOD_OPTIONS]);
});

test('a method the processor throws on is added too, and says so, rather than being drawn as None', () => {
  const options = scaleMethodOptions('gaussian');

  expect(options).toHaveLength(6);
  expect(options[5]).toStrictEqual({
    value: 'gaussian',
    label: 'gaussian — not a scaling the processor knows',
  });
});

test('the held method is added rather than corrected, so the panel keeps reporting what the settings say', () => {
  expect(scaleMethodOptions('MinMax')[5]).toStrictEqual({
    value: 'MinMax',
    label: 'MinMax — Both ends',
  });
  expect(SCALE_METHOD_OPTIONS).toHaveLength(5);
});

test('picking a method writes it and leaves every other scaling setting alone', () => {
  const value: ScaleSettings = { targetID: 'second', relative: true };
  const next = withScaleMethod(value, 'integration');

  expect(next).toStrictEqual({
    targetID: 'second',
    relative: true,
    method: 'integration',
  });
  expect(value).toStrictEqual({ targetID: 'second', relative: true });
});

test('picking None drops the method key, so the settings go back to what the processor does by default', () => {
  const next = withScaleMethod({ method: 'max', targetID: 'first' }, '');

  expect(next).toStrictEqual({ targetID: 'first' });
  expect(Object.hasOwn(next, 'method')).toBe(false);
});

test('typing a reference spectrum writes it and keeps the method', () => {
  const value: ScaleSettings = { method: 'max' };
  const next = withScaleTarget(value, 'second');

  expect(next).toStrictEqual({ method: 'max', targetID: 'second' });
  expect(value).toStrictEqual({ method: 'max' });
});

test('emptying the reference box drops the key rather than writing an empty string the processor would read as a real id', () => {
  const next = withScaleTarget({ method: 'max', targetID: 'second' }, '');

  expect(next).toStrictEqual({ method: 'max' });
  expect(Object.hasOwn(next, 'targetID')).toBe(false);
});

test('writing one bound creates the window with only that bound in it', () => {
  const value: ScaleSettings = { method: 'minmax' };
  const next = withScaleRange(value, { from: 6.5 });

  expect(next).toStrictEqual({ method: 'minmax', range: { from: 6.5 } });
  expect(value).toStrictEqual({ method: 'minmax' });
});

test('writing one bound keeps the bounds already set beside it', () => {
  const next = withScaleRange(
    { range: { to: 8.5, fromIndex: 3 } },
    { from: 6.5 },
  );

  expect(next).toStrictEqual({ range: { from: 6.5, to: 8.5, fromIndex: 3 } });
});

test('a bound is rebuilt in the from, to, fromIndex, toIndex order the fields are drawn in', () => {
  const next = withScaleRange(
    { range: { toIndex: 12, from: 6.5 } },
    { to: 8.5 },
  );

  expect(Object.keys(next.range ?? {})).toStrictEqual([
    'from',
    'to',
    'toIndex',
  ]);
});

test('a zero bound is kept, because zero is a point number and an x value the reader meant', () => {
  const next = withScaleRange({}, { fromIndex: 0 });

  expect(next).toStrictEqual({ range: { fromIndex: 0 } });
});

test('clearing one bound drops that bound and keeps the window for the others', () => {
  const patch: ScaleRange = { from: undefined };
  const next = withScaleRange({ range: { from: 6.5, toIndex: 12 } }, patch);

  expect(next).toStrictEqual({ range: { toIndex: 12 } });
  expect(Object.hasOwn(next.range ?? {}, 'from')).toBe(false);
});

test('clearing the last bound drops the window entirely, so the scaling is measured over the whole spectrum again', () => {
  const next = withScaleRange(
    { method: 'max', range: { from: 6.5 } },
    { from: undefined },
  );

  expect(next).toStrictEqual({ method: 'max' });
  expect(Object.hasOwn(next, 'range')).toBe(false);
});

test('an empty patch against settings that never had a window leaves no window key behind', () => {
  const next = withScaleRange({ method: 'min' }, {});

  expect(next).toStrictEqual({ method: 'min' });
  expect(Object.hasOwn(next, 'range')).toBe(false);
});
