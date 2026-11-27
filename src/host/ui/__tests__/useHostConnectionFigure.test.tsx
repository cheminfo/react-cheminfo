// @vitest-environment jsdom
/**
 * A picture a framed tool hands back carries what the page holds, read from
 * the latest handlers when the host asks, so the host can open it again as it
 * was.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { until } from '../../../__tests__/until.ts';
import { readFigureStates } from '../../../download/core/figureState.ts';
import type { ToolInterface } from '../../core/protocol.ts';

import { connectAsHost, hostWindow, loadToolPage } from './hostPage.tsx';

const TOOL: ToolInterface = {
  name: 'plate',
  inputs: [],
  outputs: [{ key: 'figure', kind: 'image.svg' }],
};

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

beforeEach(() => {
  vi.resetModules();
  mountRoot();
});

afterEach(() => {
  unmountRoot();
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
    readFigureStates(answer?.items[0]?.value.svg ?? '', 'plate'),
  ).resolves.toStrictEqual({
    site: 'plate',
    href: `${globalThis.location.origin}/`,
    data: { version: 1, value: { lanes: 4 } },
    edited: false,
  });
});
