/**
 * The translator `useT` hands a component is the same function from render to
 * render and from component to component, until the language or the text of
 * the page changes, so a memo keyed on it holds.
 */

import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test } from 'vitest';

import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { CHROME_CATALOG } from '../../core/chromeCatalog.ts';
import type { Translate } from '../../core/index.ts';
import { setMessageSession } from '../../core/index.ts';
import { useChromeT, useT } from '../useT.ts';

const seen: Array<Translate<string>> = [];

afterEach(() => {
  setMessageSession(null);
  seen.length = 0;
});

function Reader(): ReactElement {
  seen.push(useT(CHROME_CATALOG));
  return <span />;
}

function ChromeReader(): ReactElement {
  seen.push(useChromeT());
  return <span />;
}

function render(language: string | undefined): Array<Translate<string>> {
  const from = seen.length;
  renderToStaticMarkup(
    <SiteLanguage value={language}>
      <Reader />
      <ChromeReader />
    </SiteLanguage>,
  );
  return seen.slice(from);
}

test('two renders and two components read the one translator', () => {
  const [first, second] = render(undefined);
  const [third, fourth] = render(undefined);

  expect(typeof first).toBe('function');
  expect(second).toBe(first);
  expect(third).toBe(first);
  expect(fourth).toBe(first);
});

test('another language is another translator, kept as well', () => {
  const [english] = render(undefined);
  const [french, alsoFrench] = render('fr');
  const [again] = render('fr');

  expect(french).not.toBe(english);
  expect(alsoFrench).toBe(french);
  expect(again).toBe(french);
  expect(render(undefined)[0]).toBe(english);
});

test('an edit to the text of the page is a new translator', () => {
  const [before] = render(undefined);
  setMessageSession({ format: (catalog, key) => `${catalog}:${key}` });
  const [during, alsoDuring] = render(undefined);

  expect(during).not.toBe(before);
  expect(alsoDuring).toBe(during);
});
