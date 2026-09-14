import { expect, test } from 'vitest';

import type { EllipseSize } from '../../../scatter/core/confidenceEllipse.ts';
import { mergeProjectionCopy } from '../../core/mergeProjectionCopy.ts';
import { PROJECTION_COPY } from '../../core/projectionCopy.ts';
import {
  ellipseChoices,
  ellipseCoverageText,
  ellipseSizeLabel,
} from '../projectionEllipse.ts';

const TWO_SPREADS: EllipseSize = {
  kind: 'standardDeviations',
  standardDeviations: 2,
};

test('two standard deviations hold a different share on the map and in the cloud', () => {
  expect(ellipseCoverageText(TWO_SPREADS)).toBe('86%');
  expect(ellipseCoverageText(TWO_SPREADS, 'space')).toBe('74%');
  expect(ellipseCoverageText({ kind: 'coverage', probability: 0.95 })).toBe(
    '95%',
  );
  expect(ellipseCoverageText(null, 'space')).toBe('');
});

test('the cloud offers shells where the map offers outlines', () => {
  const { outline } = PROJECTION_COPY;

  expect(ellipseChoices(null, outline, 'space')).toStrictEqual([
    { value: 'none', label: 'No shells' },
    { value: 'share:0.5', label: '50% of samples' },
    { value: 'share:0.9', label: '90% of samples' },
    { value: 'share:0.95', label: '95% of samples' },
    { value: 'share:0.99', label: '99% of samples' },
  ]);
  expect(ellipseChoices(TWO_SPREADS, outline, 'space')[1]).toStrictEqual({
    value: 'sd:2',
    label: '2 SD (about 74%)',
  });
  expect(ellipseSizeLabel(null, outline)).toBe('No outlines');
});

test('the size is written in the words a site gave', () => {
  const { outline } = mergeProjectionCopy({
    outline: { standardDeviations: '{count} σ ≈ {share}' },
  });

  expect(ellipseSizeLabel(TWO_SPREADS, outline)).toBe('2 σ ≈ 86%');
  expect(
    ellipseSizeLabel({ kind: 'coverage', probability: 0.9 }, outline),
  ).toBe('90% of samples');
});
