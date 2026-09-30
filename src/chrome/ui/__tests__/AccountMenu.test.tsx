// @vitest-environment jsdom
/**
 * What the account's menu holds once it is open.
 *
 * A static render only draws the trigger, so the part a signed-in visitor
 * actually uses — their address under their name, and the way out — is only
 * seen by opening it.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { AccountButton } from '../AccountButton.tsx';

let host: HTMLDivElement;
let root: Root;
const signedOut = vi.fn();

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  signedOut.mockClear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

function openTheMenu(): void {
  act(() =>
    root.render(
      <AccountButton
        identity={{ name: 'Ada Lovelace', detail: 'ada@epfl.ch' }}
        items={[{ id: 'settings', label: 'Settings', href: '/settings' }]}
        onSignOut={signedOut}
      />,
    ),
  );
  const trigger = host.querySelector('button');
  act(() => trigger?.click());
}

test('the menu names the account it belongs to', () => {
  openTheMenu();

  expect(document.body.textContent).toContain('Ada Lovelace');
  expect(document.body.textContent).toContain('ada@epfl.ch');
});

test("the account's own pages are listed above the way out", () => {
  openTheMenu();

  const texts = [...document.querySelectorAll('.bp6-menu-item')].map(
    (item) => item.textContent,
  );

  expect(texts).toStrictEqual(['Settings', 'Sign out']);
});

test('picking Sign out is what signs the visitor out', () => {
  openTheMenu();

  const signOut = [...document.querySelectorAll('.bp6-menu-item')].find(
    (item) => item.textContent === 'Sign out',
  );
  act(() => (signOut as HTMLElement | undefined)?.click());

  expect(signedOut).toHaveBeenCalledOnce();
});
