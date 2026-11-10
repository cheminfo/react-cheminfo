// @vitest-environment jsdom
/**
 * A picture a framed tool hands back carries what the page holds, read from
 * the latest handlers when the host asks, so the host can open it again as it
 * was.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { readFigureStates } from '../../../download/core/figureState.ts';
import type { ToolInterface } from '../../core/protocol.ts';

import { connectAsHost, hostWindow, loadToolPage } from './hostPage.tsx';
import { until } from './until.ts';

const TOOL: ToolInterface = {
  name: 'tlc',
  inputs: [],
  outputs: [{ key: 'figure', kind: 'image.svg' }],
};

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.resetModules();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function plate(lanes: number) {
  return {
    load: vi.fn(),
    outputs: {
      read: () => [{ key: 'figure', kind: 'image.svg', value: { svg: SVG } }],
      subscribe: () => stopListening,
    },
    states: () => ({ data: { version: 1, value: { lanes } } }),
  };
}

/** What subscribing hands back: the plate never changes in these tests. */
function stopListening(): void {
  // Nothing is listened to.
}

test('a picture handed back carries the plate the page holds now', async () => {
  const { Tool } = await loadToolPage(TOOL);
  const parent = hostWindow();
  vi.stubGlobal('parent', parent.window);
  await act(async () => {
    root.render(<Tool handlers={plate(3)} />);
  });
  await until(() => parent.posted.length > 0);
  await act(async () => {
    root.render(<Tool handlers={plate(4)} />);
  });

  const port = connectAsHost(parent.window);
  port.send({ type: 'get', id: 'g1', keys: ['figure'] });
  await until(() => port.answers.length > 0);
  port.close();
  const [answer] = port.answers as Array<{
    ok: boolean;
    items: Array<{ key: string; value: { svg: string } }>;
  }>;

  expect(answer?.ok).toBe(true);
  expect(answer?.items.map(({ key }) => key)).toStrictEqual(['figure']);
  await expect(
    readFigureStates(answer?.items[0]?.value.svg ?? '', 'tlc'),
  ).resolves.toStrictEqual({
    site: 'tlc',
    href: `${globalThis.location.origin}/`,
    data: { version: 1, value: { lanes: 4 } },
    edited: false,
  });
});
