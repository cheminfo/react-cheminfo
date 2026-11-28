// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { OUTSIDE_SITE } from '../../../ecosystem/core/__tests__/outsideSite.ts';
import { mountSite } from '../mountSite.tsx';

let mounted: Root | undefined;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  if (mounted !== undefined) {
    const root = mounted;
    act(() => {
      root.unmount();
    });
    mounted = undefined;
  }
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

test('the app is drawn into the page’s root', () => {
  const container = document.createElement('div');
  container.id = 'root';
  document.body.append(container);

  act(() => {
    mounted = mountSite(<p>The electrons page</p>, 'atoms');
  });

  expect(container.innerHTML).toBe('<p>The electrons page</p>');
});

test('a page with no root says which site could not start', () => {
  expect(() => mountSite(<p>Lost</p>, 'glassware')).toThrow(
    'glassware.cheminfo.org cannot start: index.html has no <div id="root"></div> to mount into.',
  );
});

test('a site outside the family is named by its own record', () => {
  expect(() => mountSite(<p>Lost</p>, OUTSIDE_SITE)).toThrow(
    'spectra.cheminfo.org cannot start: index.html has no <div id="root"></div> to mount into.',
  );
});
