// @vitest-environment jsdom

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { useSaveShortcut } from '../useSaveShortcut.ts';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function Saving(props: { save: (() => void) | null }): ReactElement {
  useSaveShortcut(props.save);
  return <p />;
}

function press(init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { cancelable: true, ...init });
  globalThis.dispatchEvent(event);
  return event;
}

test('Ctrl+S and ⌘S save what the site saves, and the browser does not save the page', () => {
  let saves = 0;
  act(() => {
    root.render(<Saving save={() => saves++} />);
  });

  const control = press({ key: 's', ctrlKey: true });
  const command = press({ key: 'S', metaKey: true });

  expect(saves).toBe(2);
  expect(control.defaultPrevented).toBe(true);
  expect(command.defaultPrevented).toBe(true);
});

test('another key, Shift or Alt with S, or nothing to save leaves the key to the browser', () => {
  let saves = 0;
  act(() => {
    root.render(<Saving save={() => saves++} />);
  });

  press({ key: 's' });
  press({ key: 'p', ctrlKey: true });
  press({ key: 's', ctrlKey: true, shiftKey: true });
  press({ key: 's', ctrlKey: true, altKey: true });

  expect(saves).toBe(0);

  act(() => {
    root.render(<Saving save={null} />);
  });

  expect(press({ key: 's', ctrlKey: true }).defaultPrevented).toBe(false);
});
