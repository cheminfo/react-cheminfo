/**
 * The lint rule a browser suite keeps against fixed waits: a pause is a guess
 * about how fast the machine is, so a test waits for a condition, or moves the
 * page's clock with `page.clock`.
 */

/** What the error says wherever a fixed wait is written. */
export const NO_FIXED_WAIT =
  'Wait for a condition (a web-first assertion, expect.poll, toPass, waitForEvent), or move the clock with page.clock.';

/** One block of an ESLint flat configuration, as {@link noFixedWaitRules} writes it. */
export interface NoFixedWaitConfig {
  /** The files it applies to. */
  files: string[];
  /** The two rules, and how each is set. */
  rules: Record<string, unknown>;
}

/**
 * The block of an `eslint.config.js` that refuses a fixed wait in the browser
 * suite: `waitForTimeout`, `setTimeout` and `setInterval`, and the
 * `node:timers` modules.
 *
 * ```js
 * export default defineConfig(ts, unicorn, noFixedWaitRules(['e2e/**']));
 * ```
 * @param files - The suite's files, e.g. `['e2e/**']`.
 * @returns The block, for `defineConfig`.
 */
export function noFixedWaitRules(files: string[]): NoFixedWaitConfig {
  return {
    files,
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
  };
}
