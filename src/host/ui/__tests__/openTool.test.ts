// @vitest-environment jsdom
/**
 * A framed tool opened on its own site, in a new tab: the page as it is, or
 * handed the structure the frame shows once the tab greets its opener.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { HostMessageEvent } from '../../core/connectHost.ts';
import { connectHost } from '../../core/connectHost.ts';
import { REQUEST_TIMEOUT } from '../../core/connectTool.ts';
import { openTool } from '../openTool.ts';
import { HELLO_TIMEOUT } from '../useFramedTool.ts';

import { TOOL, TOOL_ORIGIN } from './framedToolPage.ts';
import { until } from './until.ts';

const FRAMED = `${TOOL_ORIGIN}/viewer?embed=1&hide=menu&smiles=CCO`;
const PAGE = `${TOOL_ORIGIN}/viewer?smiles=CCO`;

const ETHANOL = {
  document: 'draw:ethanol',
  items: [{ kind: 'chem.smiles', value: { smiles: 'CCO' } }],
  accept: ['figure'],
};

beforeEach(() => {
  // The waits turn the event loop inside `act`, which needs no tree to render.
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/**
 * A tab the browser opened: what this page posts to it reaches the tool's
 * side, and what the tool posts to its opener arrives here from the tab.
 * @returns The tab, and the means to start the tool in it.
 */
function tab() {
  const listeners = new Set<(event: HostMessageEvent) => void>();
  const received: unknown[] = [];
  const opened = {
    postMessage(message: unknown, targetOrigin: string, transfer: unknown[]) {
      received.push(message);
      if (targetOrigin !== TOOL_ORIGIN) return;
      for (const listener of listeners) {
        listener({
          data: message,
          source: opener,
          ports: transfer as MessagePort[],
        });
      }
    },
  };
  const opener = {
    postMessage(message: unknown) {
      const event = new Event('message');
      Object.defineProperties(event, {
        data: { value: message },
        source: { value: opened },
        origin: { value: TOOL_ORIGIN },
      });
      globalThis.dispatchEvent(event);
    },
  };
  return {
    opened,
    received,
    startTool: (load: (smiles: unknown) => void) =>
      connectHost({
        host: opener,
        listen(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        tool: TOOL,
        origin: TOOL_ORIGIN,
        build: null,
        load: (inputs) => {
          load(inputs[0]?.item.value);
        },
      }),
  };
}

test('a frame showing nothing opens the page as it is, without the framing', () => {
  const open = vi.fn<typeof globalThis.open>(() => null);
  vi.stubGlobal('open', open);

  expect(openTool({ url: FRAMED, host: 'draw', document: null })).toBe(true);
  expect(open.mock.calls).toStrictEqual([[PAGE, '_blank', 'noopener']]);
});

test('a tab the browser would not open is said to be blocked', () => {
  const open = vi.fn<typeof globalThis.open>(() => null);
  vi.stubGlobal('open', open);

  expect(openTool({ url: FRAMED, host: 'draw', document: ETHANOL })).toBe(
    false,
  );
  expect(open.mock.calls).toStrictEqual([[PAGE, '_blank']]);
});

test('the tab is handed the structure once it greets, and then let go', async () => {
  const { opened, received, startTool } = tab();
  vi.stubGlobal(
    'open',
    vi.fn(() => opened),
  );
  const removed = vi.spyOn(globalThis, 'removeEventListener');
  const loaded: unknown[] = [];

  expect(openTool({ url: FRAMED, host: 'draw', document: ETHANOL })).toBe(true);

  const stop = startTool((value) => {
    loaded.push(value);
  });
  await until(() => removed.mock.calls.some(([type]) => type === 'message'));
  stop();
  // Let go, the tab reloading greets nobody.
  startTool(() => undefined)();

  expect(loaded).toStrictEqual([{ smiles: 'CCO' }]);
  expect(received).toStrictEqual([
    { type: 'cheminfo:connect', version: 1, host: { name: 'draw' } },
  ]);
});

test('a tab that never greets is let go once the tool has had its time', () => {
  vi.useFakeTimers();
  const { opened, received, startTool } = tab();
  vi.stubGlobal(
    'open',
    vi.fn(() => opened),
  );
  openTool({ url: FRAMED, host: 'draw', document: ETHANOL });

  vi.advanceTimersByTime(HELLO_TIMEOUT + REQUEST_TIMEOUT);
  const stop = startTool(() => undefined);
  stop();

  expect(received).toStrictEqual([]);
});
