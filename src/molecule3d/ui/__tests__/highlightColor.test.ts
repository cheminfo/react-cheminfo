// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest';

import { FAMILY_TOKEN_VALUES } from '../../../tokens/core/familyTokens.ts';
import { highlightColorOf } from '../highlightColor.ts';

afterEach(() => {
  document.body.replaceChildren();
});

test('the highlight is the accent the page gives the view', () => {
  const view = viewUnder({ '--accent': '#0d9488' });

  expect(highlightColorOf(view)).toBe('#0d9488');
});

test('an accent written as rgb() is handed to molstar as hex', () => {
  const view = viewUnder({ '--accent': 'rgb(180, 83, 9)' });

  expect(highlightColorOf(view)).toBe('#b45309');
});

test('a page without an accent emphasises in its text colour', () => {
  const view = viewUnder({ '--text': '#334155' });

  expect(highlightColorOf(view)).toBe('#334155');
});

test('an accent molstar could not take falls back to the text colour', () => {
  const view = viewUnder({
    '--accent': 'oklch(0.6 0.12 180)',
    '--text': '#334155',
  });

  expect(highlightColorOf(view)).toBe('#334155');
});

test('a page declaring neither, or no page yet, uses the family text colour', () => {
  expect(highlightColorOf(viewUnder({}))).toBe(FAMILY_TOKEN_VALUES['--text']);
  expect(highlightColorOf(null)).toBe(FAMILY_TOKEN_VALUES['--text']);
});

/**
 * A view inside a page section that declares some tokens, as a site's theme
 * declares them on an ancestor of the viewer.
 * @param tokens - The custom properties the section declares.
 * @returns The view, on the page.
 */
function viewUnder(tokens: Record<string, string>): HTMLElement {
  const section = document.createElement('section');
  for (const [name, value] of Object.entries(tokens)) {
    section.style.setProperty(name, value);
  }
  const view = document.createElement('div');
  section.append(view);
  document.body.append(section);
  return view;
}
