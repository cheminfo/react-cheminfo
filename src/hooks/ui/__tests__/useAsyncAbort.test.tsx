// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { AsyncResult } from '../useAsync.ts';
import { useAsync } from '../useAsync.ts';

interface Question {
  signal: AbortSignal;
  resolve: (answer: string) => void;
  reject: (error: unknown) => void;
}

const questions: Question[] = [];
const seen: Array<AsyncResult<string>> = [];
const mounted: { unmount?: () => void } = {};

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  questions.length = 0;
  seen.length = 0;
});

afterEach(() => {
  act(() => {
    mounted.unmount?.();
  });
  mounted.unmount = undefined;
  vi.unstubAllGlobals();
});

function ask(signal: AbortSignal): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    questions.push({ signal, resolve, reject });
  });
}

function askAgain(signal: AbortSignal): Promise<string> {
  return ask(signal);
}

function Probe(props: {
  task: (signal: AbortSignal) => Promise<string>;
  refreshKey: number;
}) {
  seen.push(useAsync(props.task, props.refreshKey));
  return null;
}

function mount(task: (signal: AbortSignal) => Promise<string>) {
  const root = createRoot(document.createElement('div'));
  mounted.unmount = () => root.unmount();
  const render = (nextTask: typeof task, refreshKey: number) => {
    act(() => {
      root.render(<Probe task={nextTask} refreshKey={refreshKey} />);
    });
  };
  render(task, 0);
  return render;
}

function last(): AsyncResult<string> {
  const result = seen.at(-1);
  if (result === undefined) throw new Error('the probe never rendered');
  return result;
}

test('the first run is loading and pending, its answer neither', async () => {
  mount(ask);

  expect(last()).toStrictEqual({
    status: 'loading',
    data: undefined,
    error: undefined,
    pending: true,
  });

  await act(async () => {
    questions[0]?.resolve('C6H6');
  });

  expect(last()).toStrictEqual({
    status: 'success',
    data: 'C6H6',
    error: undefined,
    pending: false,
  });
});

test('a changed question keeps the old answer, pending, and aborts the old run', async () => {
  const render = mount(ask);
  await act(async () => {
    questions[0]?.resolve('C6H6');
  });

  render(ask, 1);

  expect(questions).toHaveLength(2);
  expect(questions[0]?.signal.aborted).toBe(true);
  expect(last()).toStrictEqual({
    status: 'success',
    data: 'C6H6',
    error: undefined,
    pending: true,
  });

  render(askAgain, 1);

  expect(questions[1]?.signal.aborted).toBe(true);

  await act(async () => {
    questions[1]?.resolve('stale');
    questions[2]?.resolve('C6H12');
  });

  expect(last()).toStrictEqual({
    status: 'success',
    data: 'C6H12',
    error: undefined,
    pending: false,
  });
});

test('a failed refresh keeps the data and stops being pending', async () => {
  const render = mount(ask);
  await act(async () => {
    questions[0]?.resolve('H2O');
  });
  render(ask, 1);
  await act(async () => {
    questions[1]?.reject(new Error('network down'));
  });

  expect(last()).toStrictEqual({
    status: 'success',
    data: 'H2O',
    error: undefined,
    pending: false,
  });
});

test('unmounting aborts the run, and its late answer is dropped', async () => {
  mount(ask);
  const rendered = seen.length;

  act(() => {
    mounted.unmount?.();
  });
  mounted.unmount = undefined;
  await act(async () => {
    questions[0]?.resolve('late');
  });

  expect(questions[0]?.signal.aborted).toBe(true);
  expect(seen).toHaveLength(rendered);
});
