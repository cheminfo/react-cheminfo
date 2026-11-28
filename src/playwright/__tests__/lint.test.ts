import { expect, test } from 'vitest';

import { NO_FIXED_WAIT, noFixedWaitRules } from '../lint.ts';

test('the block refuses the three spellings of a pause and the timers modules', () => {
  // As drugs.cheminfo.org and vibrations.cheminfo.org wrote it by hand.
  expect(noFixedWaitRules(['frontend/e2e/**'])).toStrictEqual({
    files: ['frontend/e2e/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='waitForTimeout']",
          message: NO_FIXED_WAIT,
        },
        {
          selector: 'CallExpression[callee.name=/^set(Timeout|Interval)$/]',
          message: NO_FIXED_WAIT,
        },
        {
          selector:
            'CallExpression[callee.object.name=/^(globalThis|window|self)$/][callee.property.name=/^set(Timeout|Interval)$/]',
          message: NO_FIXED_WAIT,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'node:timers', message: NO_FIXED_WAIT },
            { name: 'node:timers/promises', message: NO_FIXED_WAIT },
          ],
        },
      ],
    },
  });
  expect(NO_FIXED_WAIT).toBe(
    'Wait for a condition (a web-first assertion, expect.poll, toPass, waitForEvent), or move the clock with page.clock.',
  );
});
