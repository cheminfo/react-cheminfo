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

// The declarations of every `:root` rule after the first, in their order.
function laterRootRules(css: string): Array<Record<string, string>> {
  const withoutComments = css.replaceAll(/\/\*[\s\S]*?\*\//g, '');
  const rules: Array<Record<string, string>> = [];
  let start = withoutComments.indexOf(
    ':root {',
    withoutComments.indexOf(':root {') + 1,
  );
  while (start !== -1) {
    const end = withoutComments.indexOf('}', start);
    rules.push(rootDeclarations(withoutComments.slice(start, end + 1)));
    start = withoutComments.indexOf(':root {', end);
  }
  return rules;
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

test('a status colour is a token, read with its value as fallback', () => {
  expect(TOKEN.danger).toBe('var(--danger, #dc2626)');
  expect(TOKEN.success).toBe('var(--success, #16a34a)');
  expect(TOKEN.warning).toBe('var(--warning, #d97706)');
  expect(isFamilyToken('--danger')).toBe(true);
  expect(isFamilyToken('--bp-intent-primary-rest')).toBe(false);
});

test("Blueprint's primary intent and muted text are the family's, outside the tokens", () => {
  const css = readFileSync(
    join(import.meta.dirname, '../../../../styles/chrome.css'),
    'utf8',
  );

  expect(laterRootRules(css)[0]).toStrictEqual({
    '--bp-intent-primary-rest': 'var(--accent, var(--bp-palette-blue-3))',
    '--bp-intent-primary-hover':
      'color-mix( in oklab, var(--accent, var(--bp-palette-blue-3)) 85%, black )',
    '--bp-intent-primary-active':
      'color-mix( in oklab, var(--accent, var(--bp-palette-blue-3)) 70%, black )',
  });
  expect(css).toContain(
    '\n.bp6-text-muted {\n  color: var(--text-muted);\n}\n',
  );
});

test("Blueprint's own inks are the family's, from a :root rule of their own", () => {
  const css = chromeCss();

  expect(laterRootRules(css)[1]).toStrictEqual({
    '--bp-typography-color-muted': 'var(--text-muted)',
    '--bp-typography-color-default-rest': 'var(--text)',
    '--bp-typography-color-default-disabled': 'var(--text-faint)',
    '--bp-intent-default-disabled': 'var(--text-faint)',
    '--bp-intent-default-hover': 'var(--text)',
    '--bp-intent-default-active': 'var(--text)',
  });
});

test('the accent wash is a :root rule of its own, mixed from the accent', () => {
  const css = chromeCss();

  expect(laterRootRules(css)[4]).toStrictEqual({
    '--accent-wash': 'color-mix(in oklab, var(--accent) 12%, var(--surface))',
    '--accent-wash-clear':
      'color-mix(in oklab, var(--accent) 12%, transparent)',
  });
  expect(css).toContain(
    '\n.nav-link--active,\n.nav-link--active:hover {\n  background: var(--accent-wash);\n  color: var(--accent);\n}\n',
  );
});

test('the greys and the blue Blueprint compiles in are mapped to the family', () => {
  const css = chromeCss();

  for (const rule of [
    '.bp6-html-select .bp6-icon {\n  color: var(--text-muted);\n}',
    '.bp6-spinner .bp6-spinner-head {\n  stroke: var(--text-muted);\n}',
    '.bp6-spinner .bp6-spinner-track {\n  stroke: var(--border);\n}',
    '.bp6-spinner.bp6-intent-primary .bp6-spinner-head {\n  stroke: var(--accent);\n}',
    '.bp6-progress-bar {\n  background: var(--border);\n}',
    '.bp6-progress-bar .bp6-progress-meter {\n  background-color: var(--text-muted);\n}',
    '.bp6-progress-bar.bp6-intent-primary .bp6-progress-meter {\n  background-color: var(--accent);\n}',
    '.bp6-input:disabled,\n.bp6-input.bp6-disabled {\n  background: var(--surface-sunken);\n}',
    'table.bp6-html-table td,\ntable.bp6-html-table th {\n  color: var(--text);\n}',
  ]) {
    expect(css).toContain(`\n${rule}\n`);
  }
});

test("a menu, a dialog's, a drawer's and a callout's icons take the muted ink", () => {
  const css = chromeCss();

  for (const rule of [
    '.bp6-menu-item::before,\n.bp6-menu-item .bp6-menu-item-icon,\n.bp6-menu-item .bp6-menu-item-selected-icon,\n.bp6-menu-item .bp6-submenu-icon,\n.bp6-menu-item .bp6-menu-item-label {\n  color: var(--text-muted);\n}',
    ".bp6-dialog-header .bp6-icon:not([class*='bp6-intent']),\n.bp6-drawer-header .bp6-icon {\n  color: var(--text-muted);\n}",
    ".bp6-callout.bp6-callout-icon:where(:not([class*='bp6-intent-']))\n  > .bp6-icon:first-child {\n  color: var(--text-muted);\n}",
  ]) {
    expect(css).toContain(`\n${rule}\n`);
  }
});

test("an empty state's words take the muted ink and its glyph the faint one", () => {
  const css = chromeCss();

  for (const rule of [
    '.bp6-non-ideal-state,\n.bp6-non-ideal-state .bp6-heading {\n  color: var(--text-muted);\n}',
    '.bp6-non-ideal-state-visual {\n  color: var(--text-faint);\n}',
  ]) {
    expect(css).toContain(`\n${rule}\n`);
  }
});

test('a plain link is written in the accent, at rest and under the pointer', () => {
  expect(chromeCss()).toContain(
    '\na,\na:hover {\n  color: var(--accent);\n}\n',
  );
});

test('a link inside a sentence of a page is underlined, a link with a role is not', () => {
  const css = chromeCss();
  const prose =
    '.site-shell__main\n  :where(p, li, dd, td, figcaption)\n  a:not([role], .nav-link, nav a, :has(img))';

  expect(css).toContain(
    `\n${prose} {\n  text-decoration: underline;\n  text-decoration-color: var(--border-strong);\n  text-underline-offset: 2px;\n}\n`,
  );
  expect(css).toContain(
    `\n${prose}:hover {\n  text-decoration-color: currentcolor;\n}\n`,
  );
});

test("a single value's slider is drawn as a range slider is, with no wrapper", () => {
  const css = chromeCss();
  const slider = ':is(.range-slider, .measured-slider)';

  expect(css).not.toContain('\n.range-slider .bp6-');

  for (const rule of [
    `${slider} .bp6-slider {\n  min-width: 0;\n}`,
    `${slider} .bp6-slider-progress {\n  background: var(--border);\n}`,
    `${slider} .bp6-slider-progress.bp6-intent-primary {\n  background: var(--accent);\n}`,
    `${slider} .bp6-slider-handle {\n  background: var(--surface);\n  box-shadow:\n    0 0 0 1px var(--accent),\n    var(--shadow-sm);\n}`,
    `${slider} .bp6-slider-handle:hover {\n  background: var(--accent-wash);\n}`,
    `${slider} .bp6-slider-handle.bp6-active {\n  background: color-mix(in oklab, var(--accent) 28%, var(--surface));\n}`,
    `${slider} .bp6-slider-handle:focus-visible {\n  outline: 2px solid var(--accent);\n  outline-offset: 1px;\n}`,
    `${slider} .bp6-disabled .bp6-slider-handle {\n  background: var(--surface-sunken);\n  box-shadow: 0 0 0 1px var(--border-strong);\n}`,
  ]) {
    expect(css).toContain(`\n${rule}\n`);
  }
});

test("Blueprint's warning intent is the family's warning, its button in the family's ink", () => {
  const css = chromeCss();

  expect(laterRootRules(css)[2]).toStrictEqual({
    '--bp-intent-warning-rest': 'var(--warning)',
    '--bp-intent-warning-hover':
      'color-mix(in oklab, var(--warning) 85%, black)',
    '--bp-intent-warning-active':
      'color-mix(in oklab, var(--warning) 70%, black)',
    '--bp-intent-warning-foreground': 'var(--text)',
    '--bp6-button-warning-rest': 'var(--warning)',
  });
  expect(css).toContain(
    '\n.bp6-callout.bp6-intent-warning:not(.bp6-minimal) {\n  background-color: color-mix(in oklab, var(--warning) 10%, white);\n}\n',
  );
});

function chromeCss(): string {
  return readFileSync(
    join(import.meta.dirname, '../../../../styles/chrome.css'),
    'utf8',
  );
}
