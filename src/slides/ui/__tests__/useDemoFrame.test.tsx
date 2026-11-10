// @vitest-environment jsdom
/**
 * The steps sent to a tool framed on a slide, and when.
 *
 * The frame is a real iframe, whose window jsdom builds once it is on the
 * page; what the hook posts to it is read off a spy on that window, and the
 * tool's own messages are sent from it as a framed page sends them.
 */

import { act, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { DEMO_READY, DEMO_STEP } from '../../core/index.ts';
import { useDemoFrame } from '../useDemoFrame.ts';

const TOOL = 'https://glassware.cheminfo.org/?embed=1&demo=reflux';

let host: HTMLDivElement;
let root: Root;
let posted: Array<[unknown, string]>;

interface ProbeProps {
  src: string | null;
  step: number;
  replay?: number;
}

function Probe(props: ProbeProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  useDemoFrame(frameRef, props.src, props.step, props.replay ?? 0);
  return <iframe ref={frameRef} title="tool" />;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  posted = [];
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function render(props: ProbeProps): void {
  act(() => root.render(<Probe {...props} />));
}

function frameWindow(): Window {
  return (host.querySelector('iframe') as HTMLIFrameElement)
    .contentWindow as Window;
}

function mount(props: ProbeProps): void {
  render(props);
  vi.spyOn(frameWindow(), 'postMessage').mockImplementation(
    (message: unknown, origin: unknown) => {
      posted.push([message, origin as string]);
    },
  );
}

function receive(data: unknown, source: Window | null = frameWindow()): void {
  act(() => {
    globalThis.dispatchEvent(new MessageEvent('message', { data, source }));
  });
}

const READY = { type: DEMO_READY, demo: 'reflux', steps: 3 };

test('nothing is sent before the tool says its demo is listening', () => {
  mount({ src: TOOL, step: 0 });
  render({ src: TOOL, step: 1 });

  expect(posted).toStrictEqual([]);
});

test('once the tool is listening, it is sent the step on show, to its origin alone', () => {
  mount({ src: TOOL, step: 2 });
  receive(READY);

  expect(posted).toStrictEqual([
    [{ type: DEMO_STEP, step: 2 }, 'https://glassware.cheminfo.org'],
  ]);
});

test('every change of step, and every replay, is sent on', () => {
  mount({ src: TOOL, step: 0 });
  receive(READY);
  render({ src: TOOL, step: 1 });
  render({ src: TOOL, step: 1, replay: 1 });

  expect(posted.slice(1)).toStrictEqual([
    [{ type: DEMO_STEP, step: 1, replay: 0 }, 'https://glassware.cheminfo.org'],
    [{ type: DEMO_STEP, step: 1, replay: 1 }, 'https://glassware.cheminfo.org'],
  ]);
});

test('a frame that reloads says so again and is brought back to the same step', () => {
  mount({ src: TOOL, step: 1 });
  receive(READY);
  receive(READY);

  expect(posted.map(([message]) => message)).toStrictEqual([
    { type: DEMO_STEP, step: 1 },
    { type: DEMO_STEP, step: 1 },
  ]);
});

test('messages from elsewhere, or not of the protocol, are ignored', () => {
  mount({ src: TOOL, step: 0 });
  receive(READY, globalThis.window);
  receive(READY, null);
  receive({ type: 'cheminfo:embed-height', height: 300 });
  receive('ready');
  render({ src: TOOL, step: 1 });

  expect(posted).toStrictEqual([]);
});

test('a relative address is the page’s own origin', () => {
  mount({ src: '/draw?demo=ring', step: 0 });
  receive(READY);

  expect(posted).toStrictEqual([
    [{ type: DEMO_STEP, step: 0 }, globalThis.location.origin],
  ]);
});

test('a slide with no tool, or an address that is not one, listens to nothing', () => {
  mount({ src: null, step: 0 });
  receive(READY);
  mount({ src: 'http://[', step: 0 });
  receive(READY);

  expect(posted).toStrictEqual([]);
});
