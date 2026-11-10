// @vitest-environment jsdom
/**
 * While the server of a silent tool has not said what it serves, the notice
 * says only that the tool did not answer; a record it cannot read leaves the
 * version out.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { FramedToolNotice } from '../FramedToolNotice.tsx';

const URL_FRAMED = 'https://pdb.cheminfo.org/scripting?embed=1';
const SILENT = { status: 'unavailable', tool: null, outcome: null } as const;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

/** A server that never answers. */
function neverSettle(): void {
  // The request stays pending.
}

test('a server not yet heard from leaves the notice at a tool that did not answer', async () => {
  const fetch = vi.fn(() => new Promise<Response>(neverSettle));
  vi.stubGlobal('fetch', fetch);

  await act(async () => {
    root.render(
      <FramedToolNotice tool={SILENT} url={URL_FRAMED} className="notice" />,
    );
  });

  expect(host.textContent).toBe('pdb.cheminfo.org did not answer.');
  expect(host.querySelector('.notice')?.textContent).toBe(
    'pdb.cheminfo.org did not answer.',
  );
  expect(fetch).toHaveBeenCalledOnce();
});

test('a server up with no record to read is said to run a version too old, unnamed', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('<!doctype html>', { status: 404 })),
  );

  await act(async () => {
    root.render(<FramedToolNotice tool={SILENT} url={URL_FRAMED} />);
  });
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });

  expect(host.textContent).toBe(
    'pdb.cheminfo.org is up, but its page never answered: the version deployed there is most likely too old to work with this page.',
  );
});
