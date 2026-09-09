import { expect, test } from 'vitest';

import { overlayMetrics } from '../overlayMetrics.ts';

const COARSE = {
  controlHeight: 40,
  gap: 10,
  paddingX: 10,
  paddingY: 8,
  fontSize: 13,
  labelSize: 12,
  controlRadius: 8,
  inset: 10,
  buttonSize: 40,
  blueprintSize: 'large',
};

test('the compact set is the embedded one, down to the Blueprint size', () => {
  expect(overlayMetrics('compact')).toStrictEqual({
    controlHeight: 24,
    gap: 4,
    paddingX: 6,
    paddingY: 3,
    fontSize: 11,
    labelSize: 10,
    controlRadius: 5,
    inset: 6,
    buttonSize: 24,
    blueprintSize: 'small',
  });
});

test('a compact bar stands one line of host text tall', () => {
  const compact = overlayMetrics('compact');

  expect(compact.controlHeight + compact.paddingY * 2).toBe(30);
});

test('the comfortable set gives the controls more room without new type sizes', () => {
  expect(overlayMetrics('comfortable')).toStrictEqual({
    controlHeight: 30,
    gap: 8,
    paddingX: 8,
    paddingY: 6,
    fontSize: 12,
    labelSize: 11,
    controlRadius: 6,
    inset: 8,
    buttonSize: 30,
    blueprintSize: 'medium',
  });
});

test('nothing a mouse has to hit is drawn under twenty-four pixels', () => {
  for (const density of ['compact', 'comfortable'] as const) {
    const metrics = overlayMetrics(density);

    expect(metrics.controlHeight).toBeGreaterThanOrEqual(24);
    expect(metrics.buttonSize).toBeGreaterThanOrEqual(24);
  }
});

test('a coarse pointer overrides whichever density was asked for', () => {
  expect(overlayMetrics('compact', 'coarse')).toStrictEqual(COARSE);
  expect(overlayMetrics('comfortable', 'coarse')).toStrictEqual(COARSE);
});

test('naming the fine pointer changes nothing, since it is the default', () => {
  expect(overlayMetrics('compact', 'fine')).toStrictEqual(
    overlayMetrics('compact'),
  );
  expect(overlayMetrics('comfortable', 'fine')).toStrictEqual(
    overlayMetrics('comfortable'),
  );
});
