import { afterEach, expect, test } from 'vitest';

import { messageSession, setMessageSession } from '../session.ts';
import { startTranslateMode } from '../translateSetup.ts';

afterEach(() => {
  setMessageSession(null);
});

test('an ordinary address leaves the page as it is', async () => {
  await expect(
    startTranslateMode({ search: '?p=melting', catalogs: [] }),
  ).resolves.toBeUndefined();
  expect(messageSession()).toBeNull();
});

test('an address naming no language is not translate mode', async () => {
  await expect(
    startTranslateMode({ search: '?translate=en', catalogs: [] }),
  ).resolves.toBeUndefined();
  expect(messageSession()).toBeNull();
});

test('an address naming a language formats through a session', async () => {
  await expect(
    startTranslateMode({ search: '?translate=fr', catalogs: [] }),
  ).resolves.toBe('fr');
  expect(messageSession()).not.toBeNull();
});
