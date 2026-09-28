import { expect, test } from 'vitest';

import {
  CHART_COLORS,
  CHART_FONT,
  LABEL_HALO,
  LABEL_QUIET,
  PEAK_LABEL,
} from '../chartTheme.ts';

test('the palette names every part of the chart that is not a spectrum', () => {
  expect(Object.keys(CHART_COLORS)).toStrictEqual([
    'axis',
    'tick',
    'title',
    'grid',
    'zeroRule',
    'annotation',
    'annotationUnmatched',
    'precursor',
    'leader',
    'labelBackground',
    'labelBorder',
    'labelText',
    'labelHalo',
    'highlight',
    'selection',
    'selectionBorder',
    'tracker',
    'trackerText',
  ]);
});

test('every colour is a token a host can override, over a colour literal', () => {
  for (const [key, value] of Object.entries(CHART_COLORS)) {
    const match =
      /^var\((?<name>--spectrum-[a-z-]+), (?<fallback>#[\da-f]{6}|rgba\([\d ,.]+\))\)$/.exec(
        value,
      );

    expect(
      match,
      `${key} is ${value}, which is not a token over a colour literal`,
    ).not.toBeNull();
    expect(match?.groups?.name).toBe(
      `--spectrum-${key.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
    );
  }

  expect(CHART_COLORS.axis).toBe('var(--spectrum-axis, #64748b)');
  expect(CHART_COLORS.annotationUnmatched).toBe(
    'var(--spectrum-annotation-unmatched, #cbd5e1)',
  );
  expect(CHART_COLORS.selection).toBe(
    'var(--spectrum-selection, rgba(37, 99, 235, 0.12))',
  );
});

test('the type sizes are fixed rather than inherited', () => {
  expect(CHART_FONT).toStrictEqual({
    tick: 10,
    title: 12,
    label: 11,
    readout: 11,
  });
});

test('the label geometry the drawing and the declutter sweep share', () => {
  expect(PEAK_LABEL).toStrictEqual({
    lineHeight: 11,
    topPad: 10,
    topMark: 10,
    hoverHalfWidth: 26,
  });
});

test('the halo is painted under the glyphs it clears the chart from', () => {
  // Without `paint-order` the stroke goes over the fill, which writes every
  // label in the colour of the paper.
  expect(LABEL_HALO).toStrictEqual({
    paintOrder: 'stroke',
    stroke: CHART_COLORS.labelHalo,
    strokeWidth: 3,
    strokeLinejoin: 'round',
  });
  // Faint enough to be read second, never so faint as to read as disabled.
  expect(LABEL_QUIET).toBe(0.6);
});
