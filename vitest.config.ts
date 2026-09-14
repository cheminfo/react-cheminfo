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
    // The numeric integrations over the harmonics and the wasm-backed structure
    // suites run several seconds each, and v8 coverage profiles every call, so
    // the 5s default trips on them while they are doing nothing wrong.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
