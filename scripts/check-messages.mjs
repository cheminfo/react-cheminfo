#!/usr/bin/env node
/*
 * Run the published check-messages CLI on this checkout, so a fresh clone with
 * no lib yet can still check its catalogs. The bin itself keeps importing
 * ../lib/core.js, which is what a consuming site runs.
 *
 * Usage: the same as bin/check-messages.mjs.
 */
import { registerHooks } from 'node:module';

const BIN = new URL('../bin/', import.meta.url).href;
const LIBRARY_BUILD = '../lib/core.js';
const LIBRARY_SOURCE = '../src/core.ts';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === LIBRARY_BUILD && context.parentURL?.startsWith(BIN)) {
      return nextResolve(LIBRARY_SOURCE, context);
    }
    return nextResolve(specifier, context);
  },
});

await import('../bin/check-messages.mjs');
