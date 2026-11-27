// @vitest-environment jsdom
/**
 * What the account's menu holds once it is open.
 *
 * A static render only draws the trigger, so the part a signed-in visitor
 * actually uses — their address under their name, and the way out — is only
 * seen by opening it.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { AccountButton } from '../AccountButton.tsx';

const signedOut = vi.fn();

beforeEach(() => {
  signedOut.mockClear();
  mountRoot();
});

afterEach(() => {
  unmountRoot();
});

function openTheMenu(): void {
  act(() =>
    root.render(
      <AccountButton
        identity={{ name: 'Ada Lovelace', detail: 'ada@example.org' }}
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
  expect(document.body.textContent).toContain('ada@example.org');
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
