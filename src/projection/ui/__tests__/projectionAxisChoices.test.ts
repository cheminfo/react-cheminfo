import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type { ProjectionResult } from '../../core/index.ts';
import { projectionAxisChoices } from '../projectionAxisChoices.ts';

const RESULT: ProjectionResult = {
  method: 'Principal components',
  axes: [
    { name: 'PC1', share: 0.73 },
    { name: 'PC2', share: 0.229 },
    { name: 'PC3', share: 0.037 },
  ],
  scores: rowMatrix([[1, 2, 3]]),
};

test('an axis another picker draws is kept, greyed, with the reason it gives', () => {
  expect(
    projectionAxisChoices(RESULT, [0, 2], 'Already drawn on another axis.'),
  ).toStrictEqual([
    {
      value: '0',
      label: 'PC1 — 73.0 %',
      disabled: true,
      title: 'Already drawn on another axis.',
    },
    { value: '1', label: 'PC2 — 22.9 %', disabled: false, title: undefined },
    {
      value: '2',
      label: 'PC3 — 3.7 %',
      disabled: true,
      title: 'Already drawn on another axis.',
    },
  ]);
});
