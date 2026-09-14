// tokens-ok: file — the mirrored values are compared with chrome.css.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import {
  FAMILY_TOKEN_VALUES,
  TOKEN,
  isFamilyToken,
  tokenReference,
} from '../familyTokens.ts';

function rootDeclarations(css: string): Record<string, string> {
  const withoutComments = css.replaceAll(/\/\*[\s\S]*?\*\//g, '');
  const start = withoutComments.indexOf(':root {');
  const end = withoutComments.indexOf('}', start);
  const block = withoutComments.slice(start + ':root {'.length, end);
  const declarations: Record<string, string> = {};
  for (const declaration of block.split(';')) {
    const colon = declaration.indexOf(':');
    if (colon === -1) continue;
    const name = declaration.slice(0, colon).trim();
    declarations[name] = declaration
      .slice(colon + 1)
      .trim()
      .replaceAll(/\s+/g, ' ');
  }
  return declarations;
}

test('the mirrored values are the ones chrome.css declares on :root', () => {
  const css = readFileSync(
    join(import.meta.dirname, '../../../../styles/chrome.css'),
    'utf8',
  );

  expect(rootDeclarations(css)).toStrictEqual(FAMILY_TOKEN_VALUES);
});

test('a reference carries the token value as its fallback', () => {
  expect(tokenReference('--border')).toBe('var(--border, #dfe3e8)');
  expect(TOKEN.textMuted).toBe('var(--text-muted, #5b6875)');
  expect(TOKEN.radiusLarge).toBe('var(--radius-lg, 16px)');
  expect(TOKEN.shadowSmall).toBe(
    'var(--shadow-sm, 0 1px 2px rgb(16 32 48 / 8%))',
  );
});

test('only the properties chrome.css declares are family tokens', () => {
  expect(isFamilyToken('--text-faint')).toBe(true);
  expect(isFamilyToken('--brand')).toBe(false);
  expect(isFamilyToken('--font-mono')).toBe(false);
  expect(isFamilyToken('toString')).toBe(false);
});
