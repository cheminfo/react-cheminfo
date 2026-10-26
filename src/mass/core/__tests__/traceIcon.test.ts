import { expect, test } from 'vitest';

import { nextTraceIconClick, traceIconState } from '../traceIcon.ts';

test('a trace that is not drawn reads as hidden, selected or not', () => {
  expect(traceIconState(false, false)).toBe('hidden');
  expect(traceIconState(false, true)).toBe('hidden');
});

test('a drawn trace reads as selected only while its spectrum is', () => {
  expect(traceIconState(true, false)).toBe('drawn');
  expect(traceIconState(true, true)).toBe('selected');
});

test('clicking a hidden profile draws it and takes the selection', () => {
  expect(nextTraceIconClick('profile', 'hidden')).toStrictEqual({
    visibility: { showProfile: true, showCentroid: false },
    select: true,
  });
});

test('clicking a drawn profile takes the selection and leaves it drawn', () => {
  expect(nextTraceIconClick('profile', 'drawn')).toStrictEqual({
    visibility: { showProfile: true, showCentroid: false },
    select: true,
  });
});

test('clicking a selected profile takes the spectrum off the chart', () => {
  expect(nextTraceIconClick('profile', 'selected')).toStrictEqual({
    visibility: { showProfile: false, showCentroid: false },
    select: false,
  });
});

test('clicking hidden centroid sticks draws them and takes the selection', () => {
  expect(nextTraceIconClick('centroid', 'hidden')).toStrictEqual({
    visibility: { showProfile: false, showCentroid: true },
    select: true,
  });
});

test('clicking drawn centroid sticks takes the selection over', () => {
  expect(nextTraceIconClick('centroid', 'drawn')).toStrictEqual({
    visibility: { showProfile: false, showCentroid: true },
    select: true,
  });
});

test('clicking selected centroid sticks takes the spectrum off the chart', () => {
  expect(nextTraceIconClick('centroid', 'selected')).toStrictEqual({
    visibility: { showProfile: false, showCentroid: false },
    select: false,
  });
});

test('a click never leaves both traces drawn at once', () => {
  for (const kind of ['profile', 'centroid'] as const) {
    for (const state of ['hidden', 'drawn', 'selected'] as const) {
      const { visibility } = nextTraceIconClick(kind, state);

      expect(visibility.showProfile && visibility.showCentroid).toBe(false);
    }
  }
});

test('picking one trace is also what puts the other away', () => {
  expect(nextTraceIconClick('profile', 'hidden').visibility.showCentroid).toBe(
    false,
  );
  expect(nextTraceIconClick('centroid', 'hidden').visibility.showProfile).toBe(
    false,
  );
});

test('the whole cycle comes back to where it started', () => {
  // hidden → drawn and selected → hidden, which is the three-click round trip
  // the row promises.
  const first = nextTraceIconClick('centroid', 'hidden');

  expect(traceIconState(first.visibility.showCentroid, true)).toBe('selected');

  const second = nextTraceIconClick('centroid', 'selected');

  expect(traceIconState(second.visibility.showCentroid, true)).toBe('hidden');
});
