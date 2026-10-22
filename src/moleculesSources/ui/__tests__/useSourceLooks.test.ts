import { afterEach, expect, test, vi } from 'vitest';

import { sourceLooksStore } from '../useSourceLooks.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('molecules is read once however many badges follow it', async () => {
  const fetch = vi.fn(async () =>
    Response.json({
      sources: [{ name: 'PubChem', color: '#0071bc', logo: null }],
    }),
  );
  vi.stubGlobal('fetch', fetch);
  const store = sourceLooksStore('https://once.test');
  const heard = vi.fn();

  expect(store.read()).toBeNull();

  const leave = store.subscribe(heard);
  store.subscribe(() => undefined);
  await vi.waitFor(() => expect(heard).toHaveBeenCalledOnce());

  expect(fetch).toHaveBeenCalledOnce();
  expect(store.read()?.get('pubchem')?.color).toBe('#0071bc');
  expect(sourceLooksStore('https://once.test')).toBe(store);

  leave();
});

test('a molecules that does not answer leaves the badges neutral, not waiting', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('down', { status: 502 })),
  );
  const store = sourceLooksStore('https://down.test');
  const heard = vi.fn();

  store.subscribe(heard);
  await vi.waitFor(() => expect(heard).toHaveBeenCalledOnce());

  expect(store.read()?.size).toBe(0);
});
