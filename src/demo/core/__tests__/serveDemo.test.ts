// @vitest-environment jsdom
/**
 * A demo played on the steps the framing slide asks for: the next step plays
 * on from where the last left the tool, any other resets it and replays the
 * steps before at once, and every step is reported done or failed to the
 * slide alone.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Demo } from '../serveDemo.ts';
import { serveDemo } from '../serveDemo.ts';

let host: { postMessage: ReturnType<typeof vi.fn> };
let log: string[];
let stop: (() => void) | undefined;

function step(number: number, pause = 0, failure?: string): Demo['steps'][0] {
  return async (actions) => {
    log.push(`${number}:${actions.fast ? 'fast' : 'slow'}`);
    if (pause > 0) await actions.wait(pause);
    if (failure !== undefined) throw new Error(failure);
  };
}

function demo(steps: Demo['steps']): Demo {
  return {
    reset: () => {
      log.push('reset');
    },
    steps,
  };
}

const threeSteps = (): Demo => demo([step(1), step(2), step(3)]);

/**
 * Have a frame post a message to the tool's page.
 * @param data - The message.
 * @param source - The frame it comes from: the slide, unless said otherwise.
 */
function send(data: unknown, source: unknown = host): void {
  const event = new Event('message');
  Object.assign(event, { data, source });
  globalThis.dispatchEvent(event);
}

function goTo(index: number): void {
  send({ type: 'cheminfo:demo-step', step: index });
}

/**
 * What the tool told the slide, past the first message saying it is ready.
 * @returns The messages, in order.
 */
function told(): unknown[] {
  return host.postMessage.mock.calls.slice(1).map(([message]) => message);
}

function label(): string | null | undefined {
  return document.querySelector('.demo-cursor-step')?.textContent;
}

beforeEach(() => {
  vi.useFakeTimers();
  log = [];
  host = { postMessage: vi.fn() };
  vi.stubGlobal('parent', host);
});

afterEach(() => {
  stop?.();
  stop = undefined;
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test('the tool tells the slide it is ready, and how many steps it has', () => {
  stop = serveDemo('reflux', threeSteps());

  expect(host.postMessage.mock.calls).toStrictEqual([
    [{ type: 'cheminfo:demo-ready', demo: 'reflux', steps: 3 }, '*'],
  ]);
  expect(document.querySelectorAll('.demo-cursor')).toHaveLength(1);
});

test('the first step resets the tool, plays at a hand’s pace and is reported done', async () => {
  stop = serveDemo('reflux', threeSteps());

  goTo(0);
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual(['reset', '1:slow']);
  expect(told()).toStrictEqual([{ type: 'cheminfo:demo-done', step: 0 }]);
  expect(label()).toBe('1');
});

test('the next step plays on from where the last one left the tool', async () => {
  stop = serveDemo('reflux', threeSteps());

  goTo(0);
  await vi.runAllTimersAsync();
  goTo(1);
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual(['reset', '1:slow', '2:slow']);
  expect(told()).toStrictEqual([
    { type: 'cheminfo:demo-done', step: 0 },
    { type: 'cheminfo:demo-done', step: 1 },
  ]);
  expect(label()).toBe('2');
});

test('a jump resets the tool and replays the steps before it at once', async () => {
  stop = serveDemo('reflux', threeSteps());

  goTo(2);
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual(['reset', '1:fast', '2:fast', '3:slow']);
  expect(told()).toStrictEqual([{ type: 'cheminfo:demo-done', step: 2 }]);
  expect(label()).toBe('3');
});

test('the same step again, or a step back, starts over from the reset', async () => {
  stop = serveDemo('reflux', threeSteps());

  goTo(1);
  await vi.runAllTimersAsync();
  goTo(1);
  await vi.runAllTimersAsync();
  goTo(0);
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual([
    'reset',
    '1:fast',
    '2:slow',
    'reset',
    '1:fast',
    '2:slow',
    'reset',
    '1:slow',
  ]);
});

test('a step the demo does not have is reported failed, counted from one', async () => {
  stop = serveDemo('reflux', threeSteps());

  goTo(5);
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual([]);
  expect(told()).toStrictEqual([
    {
      type: 'cheminfo:demo-failed',
      step: 5,
      reason: 'The demo "reflux" has no step 6.',
    },
  ]);
});

test('a step that fails is reported with its reason, as is a step replayed past it', async () => {
  stop = serveDemo('reflux', demo([step(1), step(2, 0, 'no flask'), step(3)]));

  goTo(1);
  await vi.runAllTimersAsync();
  goTo(2);
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual([
    'reset',
    '1:fast',
    '2:slow',
    'reset',
    '1:fast',
    '2:fast',
  ]);
  expect(told()).toStrictEqual([
    { type: 'cheminfo:demo-failed', step: 1, reason: 'no flask' },
    {
      type: 'cheminfo:demo-failed',
      step: 2,
      reason: 'no flask',
    },
  ]);
});

test('a step still playing when the slide moves on is stopped, unreported', async () => {
  stop = serveDemo('reflux', demo([step(1, 2000), step(2)]));

  goTo(0);
  await vi.advanceTimersByTimeAsync(500);
  goTo(1);
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual(['reset', '1:slow', 'reset', '1:fast', '2:slow']);
  expect(told()).toStrictEqual([{ type: 'cheminfo:demo-done', step: 1 }]);
});

test('a step asked for and overtaken before it starts is never played', async () => {
  stop = serveDemo('reflux', threeSteps());

  goTo(0);
  goTo(1);
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual(['reset', '1:fast', '2:slow']);
  expect(told()).toStrictEqual([{ type: 'cheminfo:demo-done', step: 1 }]);
});

test('only the framing slide is heard, and only in the demo protocol', async () => {
  stop = serveDemo('reflux', threeSteps());

  send({ type: 'cheminfo:demo-step', step: 0 }, { postMessage: vi.fn() });
  send({ type: 'cheminfo:demo-step', step: 0 }, null);
  send({ type: 'cheminfo:embed-height', height: 300 });
  send({ type: 'cheminfo:demo-done', step: 0 });
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual([]);
  expect(told()).toStrictEqual([]);
});

test('stopping the demo stops the step playing, stops listening and removes the cursor', async () => {
  stop = serveDemo('reflux', demo([step(1, 2000), step(2)]));

  goTo(0);
  await vi.advanceTimersByTimeAsync(500);
  stop();
  goTo(1);
  await vi.runAllTimersAsync();

  expect(log).toStrictEqual(['reset', '1:slow']);
  expect(told()).toStrictEqual([]);
  expect(document.querySelector('.demo-cursor')).toBeNull();
});
