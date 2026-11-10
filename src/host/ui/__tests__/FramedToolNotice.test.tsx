// @vitest-environment jsdom
/**
 * A framed tool of no use to its host says why: the site is down, or the
 * version deployed there is too old to answer or to give anything back.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { FramedToolNoticeProps } from '../FramedToolNotice.tsx';
import { FramedToolNotice } from '../FramedToolNotice.tsx';

const URL_FRAMED = 'https://pdb.cheminfo.org/scripting?embed=1';
const RECORD = {
  version: '1.1.1',
  builtAt: '2026-11-09T21:37:02Z',
  commit: '53cfc02cdcdea00911c7f5a85e9d0651675ce99a',
};
const NEXT = 'Cancel goes back to the document, which is as it was.';

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

async function show(tool: FramedToolNoticeProps['tool']): Promise<string> {
  await act(async () => {
    root.render(
      <FramedToolNotice
        tool={tool}
        url={URL_FRAMED}
        output="figure"
        next={NEXT}
      />,
    );
  });
  // The probe settles, then the notice says what it found.
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
  return host.textContent;
}

const SILENT = { status: 'unavailable', tool: null, outcome: null } as const;

test('a site whose page never answered names the version deployed there', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(RECORD)),
  );

  await expect(show(SILENT)).resolves.toBe(
    'pdb.cheminfo.org is up, but its page never answered: the version deployed there (1.1.1, built 2026-11-09 21:37 UTC) is most likely too old to work with this page. Cancel goes back to the document, which is as it was.',
  );
});

test('a site nothing answers at is said to be unreachable', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }),
  );

  await expect(show(SILENT)).resolves.toBe(
    `pdb.cheminfo.org could not be reached: the site is down, or this network blocks it. ${NEXT}`,
  );
});

test('a tool that answers without the output is too old to give it', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(RECORD)),
  );

  await expect(
    show({
      status: 'connected',
      tool: {
        name: 'pdb',
        origin: 'https://pdb.cheminfo.org',
        build: undefined,
        inputs: [],
        outputs: [],
      },
      outcome: null,
    }),
  ).resolves.toBe(
    `pdb.cheminfo.org answered, but the version deployed there (1.1.1, built 2026-11-09 21:37 UTC) gives nothing back to this page yet. ${NEXT}`,
  );
});

test('a tool that can be used says nothing, and its server is not asked', async () => {
  const fetch = vi.fn(async () => Response.json(RECORD));
  vi.stubGlobal('fetch', fetch);

  await expect(
    show({
      status: 'connected',
      tool: {
        name: 'pdb',
        origin: 'https://pdb.cheminfo.org',
        build: undefined,
        inputs: [],
        outputs: [{ key: 'figure', kind: 'image.svg' }],
      },
      outcome: null,
    }),
  ).resolves.toBe('');
  expect(fetch).not.toHaveBeenCalled();
});

test('a document the tool refused is said with its reason', async () => {
  vi.stubGlobal('fetch', vi.fn());

  await expect(
    show({
      status: 'connected',
      tool: null,
      outcome: {
        status: 'refused',
        error: { code: 'invalid', message: 'This figure holds no protein.' },
      },
    }),
  ).resolves.toBe(`pdb.cheminfo.org: This figure holds no protein. ${NEXT}`);
});
