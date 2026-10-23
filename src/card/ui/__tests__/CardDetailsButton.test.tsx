// @vitest-environment jsdom
/**
 * Details opens the site's page the card stands for: the card's own address
 * without what only a card reads, or the address a sealed link holds.
 */

import type * as Embed from 'cheminfo-mcp-server/embed';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  holdPageAddress,
  releasePageAddress,
} from '../../../router/core/pageAddress.ts';
import { CardDetailsButton } from '../CardDetailsButton.tsx';

const opened = vi.hoisted(() => [] as string[]);

vi.mock('cheminfo-mcp-server/embed', async (importOriginal) => ({
  ...(await importOriginal<typeof Embed>()),
  openSitePage: (url: string) => {
    opened.push(url);
    return 'window';
  },
}));

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  opened.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  releasePageAddress();
  globalThis.history.replaceState(null, '', '/');
  vi.unstubAllGlobals();
});

function press(): void {
  const button = host.querySelector<HTMLButtonElement>(
    '[data-testid="card-details"]',
  );
  if (button === null) throw new Error('no Details button');
  act(() => button.click());
}

test('the button says Details, is named for a screen reader and never prints', () => {
  const html = renderToStaticMarkup(<CardDetailsButton />);

  expect(html).toContain('>Details<');
  expect(html).toContain('aria-label="Details: open in a new tab"');
  expect(html).toContain('bp6-icon-share');
  expect(html).toContain('class="no-print"');
  expect(html).not.toContain('title=');
});

test('a press opens the card address without the card, the frame and the hidden parts', () => {
  globalThis.history.replaceState(
    null,
    '',
    '/titration?ind=thymol&embed=1&hide=help&card=1&scale=methyl%20red',
  );
  act(() =>
    root.render(<CardDetailsButton address={{ cardParams: ['scale'] }} />),
  );
  press();

  expect(opened).toStrictEqual([
    `${globalThis.location.origin}/titration?ind=thymol`,
  ]);
});

test('a sealed link opens the page it holds, on the card origin', () => {
  globalThis.history.replaceState(null, '', '/s/sealed-token');
  holdPageAddress('/generator?mf=C6H6&embed=1&card=1');
  act(() => root.render(<CardDetailsButton />));
  press();

  expect(opened).toStrictEqual([
    `${globalThis.location.origin}/generator?mf=C6H6`,
  ]);
});

test('a page of its own is written when the button is pressed', () => {
  let writes = 0;
  act(() =>
    root.render(
      <CardDetailsButton
        page={() => {
          writes++;
          return 'https://inchi.cheminfo.org/tutorial/anatomy';
        }}
        testId="inchi-details"
      />,
    ),
  );

  expect(writes).toBe(0);

  const button = host.querySelector<HTMLButtonElement>(
    '[data-testid="inchi-details"]',
  );
  act(() => button?.click());

  expect(writes).toBe(1);
  expect(opened).toStrictEqual(['https://inchi.cheminfo.org/tutorial/anatomy']);
});
