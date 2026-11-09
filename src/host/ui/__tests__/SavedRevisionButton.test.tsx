// @vitest-environment jsdom
/**
 * The fallback for a figure the latest build no longer shows as it was: a
 * button opening it in the deployment that saved it, drawn only when there is
 * one to go back to.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { setFigureRevision } from '../../../download/core/figureRevision.ts';
import { withFigureSource } from '../../../download/core/figureSource.ts';
import { SavedRevisionButton } from '../SavedRevisionButton.tsx';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';
const SAVED = 'https://1a2b3c4d.draw-cheminfo.pages.dev';
const RUNNING = 'https://9f8e7d6c.draw-cheminfo.pages.dev';

let host: HTMLDivElement;
let root: Root;
const forgets: Array<() => void> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  forgets.push(setFigureRevision('draw', { deployment: RUNNING }));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  while (forgets.length > 0) forgets.pop()?.();
  vi.unstubAllGlobals();
});

function savedBy(revision: string): Promise<string> {
  return withFigureSource(FIGURE, {
    site: 'draw',
    href: 'https://draw.cheminfo.org/?embed=1&panel=atoms',
    revision,
  });
}

test('a figure saved by another deployment opens there, on its page', async () => {
  const svg = await savedBy(SAVED);
  const open = vi.fn<typeof globalThis.open>(() => null);
  vi.stubGlobal('open', open);

  // Blueprint loads the icon's paths after the first render.
  await act(async () => {
    root.render(<SavedRevisionButton svg={svg} site="draw" />);
    await Promise.resolve();
  });
  const button = host.querySelector('button');

  expect(button?.textContent).toBe('Original version');

  act(() => button?.click());

  expect(open).toHaveBeenCalledExactlyOnceWith(
    `${SAVED}/?panel=atoms`,
    '_blank',
  );
});

test('no figure, or one saved by the running deployment, draws nothing', async () => {
  const svg = await savedBy(RUNNING);

  act(() => root.render(<SavedRevisionButton svg={null} site="draw" />));

  expect(host.innerHTML).toBe('');

  act(() => root.render(<SavedRevisionButton svg={svg} site="draw" />));

  expect(host.innerHTML).toBe('');
});
