import { expect, test } from 'vitest';

import { mergeProjectionCopy } from '../../core/mergeProjectionCopy.ts';
import { PROJECTION_COPY } from '../../core/projectionCopy.ts';
import {
  projectionCloudGestureChoices,
  projectionSelectModeChoices,
  projectionVariableOrderChoices,
} from '../projectionWordChoices.ts';

test('the default choices read the words the viewer has always written', () => {
  expect(projectionSelectModeChoices(PROJECTION_COPY)).toStrictEqual([
    { value: 'replace', label: 'Replace' },
    { value: 'add', label: 'Add' },
    { value: 'remove', label: 'Remove' },
  ]);
  expect(projectionCloudGestureChoices(PROJECTION_COPY)).toStrictEqual([
    { value: 'turn', label: 'Turn' },
    { value: 'select', label: 'Select' },
  ]);
  expect(projectionVariableOrderChoices(PROJECTION_COPY)).toStrictEqual([
    { value: 'original', label: 'Your order' },
    { value: 'strongest', label: 'Strongest first' },
  ]);
});

test('a site overriding one word sees it and keeps the others', () => {
  const copy = mergeProjectionCopy({
    choice: { cloudGesture: { turn: 'Tourner' } },
  });

  expect(projectionCloudGestureChoices(copy)).toStrictEqual([
    { value: 'turn', label: 'Tourner' },
    { value: 'select', label: 'Select' },
  ]);
  expect(projectionSelectModeChoices(copy)[0]?.label).toBe('Replace');
});
