#!/usr/bin/env node
/*
 * Run the published check-tokens CLI on this checkout's sources instead of its
 * build: the library's own scan then applies the rules in src/tokens/core, and
 * works on a fresh clone that has no lib yet. The bin itself keeps importing
 * ../lib/core.js, which is what a consuming site runs.
 *
 * Usage: the same as bin/check-tokens.mjs.
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

await import('../bin/check-tokens.mjs');
