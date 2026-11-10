// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { XpsCommandProvider } from '../XpsCommandProvider.tsx';
import type { XpsCommandHandlers } from '../xpsCommandContext.tsx';

/** What the mounted viewer was asked for, in order. */
const asked: string[] = [];

const roots: Array<ReturnType<typeof createRoot>> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  asked.length = 0;
  for (const root of roots) act(() => root.unmount());
  roots.length = 0;
  vi.unstubAllGlobals();
});

test('a key pressed inside the viewer runs its command and is claimed', () => {
  const viewer = mount();
  const heardOutside: string[] = [];
  document.addEventListener('keydown', (event) => {
    heardOutside.push(event.key);
  });

  const event = press(viewer, 'f');

  expect(asked).toStrictEqual(['resetZoom']);
  expect(event.defaultPrevented).toBe(true);
  // Stopped before the document, so a viewer mounted beside this one — a survey
  // scan above the narrow scan it was picked from — leaves alone the press this
  // one has just answered.
  expect(heardOutside).toStrictEqual([]);
});

test('either key the sign is typed with asks for the same zoom', () => {
  const viewer = mount();

  press(viewer, '+');
  press(viewer, '=');
  press(viewer, '-');
  press(viewer, '_');

  expect(asked).toStrictEqual(['zoomIn', 'zoomIn', 'zoomOut', 'zoomOut']);
});

test('the layers are switched by the initial of what they draw', () => {
  const viewer = mount();

  press(viewer, 'r');
  press(viewer, 'c');
  press(viewer, 'l');

  expect(asked).toStrictEqual(['showRegions', 'showComponents', 'showLabels']);
});

test('a key typed into a field is a key being typed', () => {
  const viewer = mount();

  const event = press(viewer.querySelector('input'), 'c');

  expect(asked).toStrictEqual([]);
  expect(event.defaultPrevented).toBe(false);
});

test('a key nothing offers is left to whatever else wants it', () => {
  const viewer = mount({ zoomIn: () => asked.push('zoomIn') });

  expect(press(viewer, 'q').defaultPrevented).toBe(false);
  // Offered by the table, but by no handler here.
  expect(press(viewer, 'f').defaultPrevented).toBe(false);
  expect(asked).toStrictEqual([]);
});

/**
 * A viewer holding the commands, with a field inside it to type into.
 * @param handlers - What it answers, the recording ones by default.
 * @returns Its root element.
 */
function mount(handlers?: XpsCommandHandlers): HTMLElement {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);

  act(() => {
    root.render(<Viewer handlers={handlers ?? recording()} />);
  });

  const mounted = container.querySelector('[data-testid="viewer"]');
  if (!(mounted instanceof HTMLElement)) {
    throw new TypeError('the viewer did not mount');
  }
  return mounted;
}

/**
 * Press a key on an element, the way a browser delivers one.
 * @param target - What the press is delivered to.
 * @param key - The `event.key` of the press.
 * @returns The event, to be asked whether anything claimed it.
 */
function press(target: Element | null, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    target?.dispatchEvent(event);
  });
  return event;
}

/**
 * Handlers that only record having been asked.
 * @returns Every command a key reaches.
 */
function recording(): XpsCommandHandlers {
  return {
    zoomIn: () => asked.push('zoomIn'),
    zoomOut: () => asked.push('zoomOut'),
    resetZoom: () => asked.push('resetZoom'),
    showRegions: () => asked.push('showRegions'),
    showComponents: () => asked.push('showComponents'),
    showLabels: () => asked.push('showLabels'),
    clear: () => asked.push('clear'),
  };
}

interface ViewerProps {
  /** What the viewer answers. */
  handlers: XpsCommandHandlers;
}

/**
 * A viewer shaped the way the shell is: a provider around its own root.
 * @param props - Component props.
 * @returns The viewer.
 */
function Viewer(props: ViewerProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  return (
    <XpsCommandProvider handlers={props.handlers} root={root}>
      <div ref={setRoot} tabIndex={-1} data-testid="viewer">
        <input />
      </div>
    </XpsCommandProvider>
  );
}
