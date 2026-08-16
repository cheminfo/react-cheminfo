import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The e2e specs are Playwright's, and vitest would otherwise collect them.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
