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
