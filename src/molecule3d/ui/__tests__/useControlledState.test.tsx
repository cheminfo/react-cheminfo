// @vitest-environment jsdom
/**
 * A value the parent may own or leave to the component: owned, the parent's
 * value is shown and a change only reported; left, the component keeps its
 * own copy — and either way the latest `onChange` hears every change.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useControlledState } from '../useControlledState.ts';

let host: HTMLDivElement;
let root: Root;
/** The setter of every render of the probe, the latest last. */
const setters: Array<(next: string) => void> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  setters.length = 0;
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

test('left to itself, the component starts from its initial value and keeps every change', () => {
  const heard: string[] = [];
  mount(undefined, (next) => heard.push(next));

  expect(host.textContent).toBe('ball-and-stick');

  change('spacefill');

  expect(host.textContent).toBe('spacefill');
  expect(heard).toStrictEqual(['spacefill']);
});

test('an initial value may be computed, once', () => {
  let computed = 0;
  mount(undefined, undefined, () => {
    computed++;
    return 'cartoon';
  });
  mount(undefined, undefined, () => {
    computed++;
    return 'line';
  });

  expect(host.textContent).toBe('cartoon');
  expect(computed).toBe(1);
});

test('owned by the parent, the value shown is the parent’s, and a change is only reported', () => {
  const heard: string[] = [];
  mount('line', (next) => heard.push(next));
  change('spacefill');

  expect(host.textContent).toBe('line');
  expect(heard).toStrictEqual(['spacefill']);

  mount('spacefill', (next) => heard.push(next));

  expect(host.textContent).toBe('spacefill');
});

test('a change reaches the onChange of the latest render', () => {
  const first: string[] = [];
  const second: string[] = [];
  mount(undefined, (next) => first.push(next));
  mount(undefined, (next) => second.push(next));
  change('line');

  expect(first).toStrictEqual([]);
  expect(second).toStrictEqual(['line']);
});

function Probe({
  value,
  initial,
  onChange,
}: {
  value: string | undefined;
  initial: string | (() => string);
  onChange?: (next: string) => void;
}) {
  const [shown, setShown] = useControlledState(value, initial, onChange);
  setters.push(setShown);
  return <span>{shown}</span>;
}

function mount(
  value: string | undefined,
  onChange?: (next: string) => void,
  initial: string | (() => string) = 'ball-and-stick',
): void {
  act(() => {
    root.render(<Probe value={value} initial={initial} onChange={onChange} />);
  });
}

function change(next: string): void {
  act(() => {
    setters.at(-1)?.(next);
  });
}
