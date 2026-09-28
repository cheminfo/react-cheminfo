import { defineConfig, globalIgnores } from 'eslint/config';
import react from 'eslint-config-cheminfo-react/base';
import typescript from 'eslint-config-cheminfo-typescript';

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
        { patterns: ['**/ir/**', '**/structure/**', '**/spectra/**'] },
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
