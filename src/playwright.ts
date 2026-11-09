// The Playwright configuration the sites' browser suites share. Types only
// from `@playwright/test`, so importing this entry loads no Playwright.
export type { CheminfoPlaywrightOptions } from './playwright/config.ts';
export {
  MAX_DEFAULT_WORKERS,
  WORKERS_ENV,
  cheminfoPlaywrightConfig,
} from './playwright/config.ts';
