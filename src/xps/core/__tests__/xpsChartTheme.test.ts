import { expect, test } from 'vitest';

import { PEAK_LABEL } from '../../../chart/core/chartTheme.ts';
import {
  COMPONENT_STYLE,
  TRACE_WIDTH,
  XPS_CHART_COLORS,
  XPS_CHART_FONT,
  XPS_PEAK_LABEL,
} from '../xpsChartTheme.ts';

test('every colour is a custom property with a literal fallback', () => {
  // Without the fallback a host that sets none of these tokens gets a chart
  // drawn in nothing at all.
  for (const value of Object.values(XPS_CHART_COLORS)) {
    expect(value).toMatch(/^var\(--xps-[a-z-]+, .+\)$/);
  }
});

test('the tokens are named after the keys they are reached by', () => {
  expect(XPS_CHART_COLORS.regionBorder).toBe(
    'var(--xps-region-border, #cbd5e1)',
  );
  expect(XPS_CHART_COLORS.envelope).toBe('var(--xps-envelope, #334155)');
});

test('the type is small and fixed, so a host font cannot crowd the axes', () => {
  expect(XPS_CHART_FONT).toStrictEqual({ region: 10, overlay: 13 });
});

test('a stacked label is spaced by one constant both halves agree on', () => {
  expect(PEAK_LABEL.lineHeight).toBe(11);
  expect(PEAK_LABEL.topPad).toBe(10);
  expect(XPS_PEAK_LABEL).toStrictEqual({ topMark: 8, width: 42 });
});

test('a highlighted trace is thick enough to be seen without looking', () => {
  expect(TRACE_WIDTH.normal).toBe(1);
  expect(TRACE_WIDTH.selected).toBeGreaterThan(TRACE_WIDTH.normal);
  expect(TRACE_WIDTH.highlighted).toBeGreaterThan(TRACE_WIDTH.selected);
});

test('a hovered component is filled more solidly than a resting one', () => {
  expect(COMPONENT_STYLE.fillOpacity).toBe(0.18);
  expect(COMPONENT_STYLE.highlightOpacity).toBeGreaterThan(
    COMPONENT_STYLE.fillOpacity,
  );
  expect(COMPONENT_STYLE.envelopeDash).toBe('5 3');
});
