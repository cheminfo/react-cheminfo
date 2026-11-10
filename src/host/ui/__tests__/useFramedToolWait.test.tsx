// @vitest-environment jsdom
/**
 * A framed tool that never answers counts as unavailable once its wait is
 * over, and one that is not open says so rather than pretending to answer.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { FramedTool } from '../useFramedTool.ts';
import { HELLO_TIMEOUT, useFramedTool } from '../useFramedTool.ts';

const TOOL_URL = 'https://3d.cheminfo.org/?embed=1';

let host: HTMLDivElement;
let root: Root;
const seen: FramedTool[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('IntersectionObserver', undefined);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  seen.length = 0;
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function Framed(props: {
  url?: string;
  helloTimeout?: number;
  withFrame?: boolean;
}): ReactElement | null {
  const { url = TOOL_URL, helloTimeout, withFrame = true } = props;
  const tool = useFramedTool({
    url,
    host: 'draw.cheminfo.org',
    document: null,
    ...(helloTimeout === undefined ? {} : { helloTimeout }),
  });
  seen.push(tool);
  const { attachFrame } = tool;
  return withFrame ? <iframe ref={attachFrame} title="tool" /> : null;
}

function current(): FramedTool {
  const tool = seen.at(-1);
  if (tool === undefined) throw new Error('nothing rendered');
  return tool;
}

function frame(): HTMLIFrameElement {
  const element = host.querySelector('iframe');
  if (element === null) throw new Error('no frame');
  return element;
}

test('a tool silent past the wait for its hello is unavailable', () => {
  vi.useFakeTimers();
  act(() => root.render(<Framed />));

  expect(current().status).toBe('connecting');

  act(() => {
    vi.advanceTimersByTime(HELLO_TIMEOUT - 1);
  });

  expect(current().status).toBe('connecting');

  act(() => {
    vi.advanceTimersByTime(1);
  });

  expect(current().status).toBe('unavailable');
  expect(current().tool).toBeNull();
  expect(current().settings).toBeNull();
  expect(current().settingFields).toStrictEqual([]);
});

test('the wait for a hello is the one the host asked for', () => {
  vi.useFakeTimers();
  act(() => root.render(<Framed helloTimeout={500} />));
  act(() => {
    vi.advanceTimersByTime(500);
  });

  expect(current().status).toBe('unavailable');
});

test('a tool moved to another address is waited for again', () => {
  vi.useFakeTimers();
  act(() => root.render(<Framed />));
  act(() => {
    vi.advanceTimersByTime(HELLO_TIMEOUT);
  });

  expect(current().status).toBe('unavailable');

  const moved = 'https://3d.cheminfo.org/?embed=1&surface=1';
  act(() => root.render(<Framed url={moved} />));

  expect(current().status).toBe('connecting');
  expect(frame().getAttribute('src')).toBe(moved);
});

test('a tool with no frame is not open: nothing to give, no full screen', async () => {
  act(() => root.render(<Framed withFrame={false} />));

  await expect(current().get(['figure'])).rejects.toThrow(
    'The tool is not open, so it has nothing to give.',
  );
  await expect(current().fullscreen()).rejects.toThrow('The tool is not open.');

  // Settings asked of a tool that is not open go nowhere, and nothing throws.
  current().setSettings({ surface: '1' });

  expect(current().status).toBe('connecting');
});

test('a tool framed but not greeted yet has nothing to give', async () => {
  act(() => root.render(<Framed />));

  await expect(current().get(['figure'])).rejects.toThrow(
    'The tool has not connected yet, so it has nothing to give.',
  );
});

test('the full screen is asked of the frame itself', async () => {
  act(() => root.render(<Framed />));
  const requestFullscreen = vi.fn(() => Promise.resolve());
  frame().requestFullscreen = requestFullscreen;

  await current().fullscreen();

  expect(requestFullscreen).toHaveBeenCalledOnce();
});
