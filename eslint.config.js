import { defineConfig, globalIgnores } from 'eslint/config';
import react from 'eslint-config-cheminfo-react/base';
import typescript from 'eslint-config-cheminfo-typescript';

const NO_FIXED_WAIT =
  'Wait for a condition (a web-first assertion, expect.poll, toPass, waitForEvent), or move the clock with page.clock.';

export default defineConfig(
  globalIgnores([
    'coverage',
    'lib',
    'playwright-report',
    'storybook-static',
    'test-results',
  ]),
  typescript,
  react,
  {
    // The chart is what makes the viewers built on it siblings rather than a
    // stack, so it must never learn what any of them measures: an infrared
    // spectrum, a mass spectrum and a glycan are all drawn by the same axes.
    files: ['src/chart/**', 'src/panel/**', 'src/download/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '**/ir/**',
            '**/mass/**',
            '**/structure/**',
            '**/spectra/**',
          ],
        },
      ],
    },
  },
  {
    // A fixed wait is a guess about how fast the machine is: an e2e test waits
    // for a condition, or moves the page's clock with `page.clock`.
    files: ['e2e/**'],
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
  },
  {
    // The `./core` entry point must stay React-free.
    files: ['src/*/core/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['react', 'react-dom'],
          patterns: ['**/ui/**'],
        },
      ],
    },
  },
);
