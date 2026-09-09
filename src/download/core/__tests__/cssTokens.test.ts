// tokens-ok: file — resolving a token means writing its value, so the values
// a site declares are exactly what this has to assert on.
import { expect, test } from 'vitest';

import { cssTokenNames, resolveCssTokens } from '../cssTokens.ts';

const MARKUP =
  '<g stroke="var(--border)" fill="var(--text-muted)"><text style="fill:var(--border)">a</text></g>';

test('every token the markup asks for is named once, in the order written', () => {
  expect(cssTokenNames(MARKUP)).toStrictEqual(['--border', '--text-muted']);
});

test('markup with no token at all names none', () => {
  expect(cssTokenNames('<rect fill="#0072b2"/>')).toStrictEqual([]);
});

test('a resolved figure carries values rather than the names of values', () => {
  const resolved = resolveCssTokens(MARKUP, {
    '--border': '#dfe3e8',
    '--text-muted': '#5b6875',
  });

  expect(resolved).toBe(
    '<g stroke="#dfe3e8" fill="#5b6875"><text style="fill:#dfe3e8">a</text></g>',
  );
});

test('a token pointing at another token is followed to the value', () => {
  const resolved = resolveCssTokens('<circle fill="var(--accent)"/>', {
    '--accent': 'var(--brand)',
    '--brand': '#4338ca',
  });

  expect(resolved).toBe('<circle fill="#4338ca"/>');
});

test('a token nobody declared falls back to what the call carries', () => {
  const resolved = resolveCssTokens('<rect fill="var(--slide-bg, #f5f7fa)"/>', {
    '--slide-bg': '',
  });

  expect(resolved).toBe('<rect fill="#f5f7fa"/>');
});

test('a token with neither a value nor a fallback is left exactly as written', () => {
  expect(resolveCssTokens('<rect fill="var(--nothing)"/>', {})).toBe(
    '<rect fill="var(--nothing)"/>',
  );
});

test('a fallback that is itself a token is resolved on the next pass', () => {
  const resolved = resolveCssTokens('<rect fill="var(--a, var(--b))"/>', {
    '--b': '#16202c',
  });

  expect(resolved).toBe('<rect fill="#16202c"/>');
});

test('a chain deeper than the passes allowed stops rather than looping', () => {
  const resolved = resolveCssTokens('<rect fill="var(--a)"/>', {
    '--a': 'var(--a)',
  });

  expect(resolved).toBe('<rect fill="var(--a)"/>');
});
