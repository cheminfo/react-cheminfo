// @vitest-environment jsdom
/**
 * The controls of a floating bar, pressed rather than read: a stepper nudged
 * by its buttons and its arrows, a strip of pills walked with the keys, a
 * glyph button lit by the pointer and the focus, and the coarse pointer a
 * phone reports.
 */

import { act, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { OverlayIconButton } from '../OverlayIconButton.tsx';
import { OverlayLayer } from '../OverlayLayer.tsx';
import { OverlayNumber } from '../OverlayNumber.tsx';
import { OverlayPills } from '../OverlayPills.tsx';
import { useCoarsePointer, useOverlaySurface } from '../overlaySurface.ts';

let host: HTMLDivElement;
let root: Root;
const changes: unknown[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  changes.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function Stepper(props: { start: number; disabled?: boolean }) {
  const [value, setValue] = useState(props.start);
  return (
    <OverlayNumber
      label="Radius"
      value={value}
      min={0}
      max={0.5}
      step={0.1}
      digits={1}
      disabled={props.disabled}
      onChange={(next) => {
        changes.push(next);
        setValue(next);
      }}
    />
  );
}

function Strip() {
  const [value, setValue] = useState('map');
  return (
    <OverlayPills
      label="Views"
      value={value}
      options={[
        { value: 'map', label: 'Map' },
        { value: 'pairs', label: 'Pairs' },
        { value: 'shares', label: 'Shares', disabled: true },
      ]}
      onChange={(next) => {
        changes.push(next);
        setValue(next);
      }}
    />
  );
}

function button(label: string): HTMLButtonElement {
  return host.querySelector(
    `button[aria-label="${CSS.escape(label)}"]`,
  ) as HTMLButtonElement;
}

function click(target: HTMLElement): void {
  act(() => {
    target.click();
  });
}

function press(target: Element, key: string): boolean {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event.defaultPrevented;
}

test('the stepper lands on the grid however many tenths it adds', () => {
  act(() => root.render(<Stepper start={0.2} />));
  click(button('Increase Radius'));
  click(button('Increase Radius'));
  click(button('Decrease Radius'));

  expect(changes).toStrictEqual([0.3, 0.4, 0.3]);
  expect(host.querySelector('[aria-live="polite"]')?.textContent).toBe('0.3');
});

test('the arrows step it, and the end of the range goes dead', () => {
  act(() => root.render(<Stepper start={0.3} />));
  const plus = button('Increase Radius');

  expect(press(plus, 'ArrowUp')).toBe(true);
  expect(press(plus, 'ArrowRight')).toBe(true);
  expect(press(plus, 'ArrowRight')).toBe(true);
  expect(press(plus, 'Enter')).toBe(false);
  expect(changes).toStrictEqual([0.4, 0.5]);
  expect(plus.disabled).toBe(true);

  press(button('Decrease Radius'), 'ArrowDown');
  press(button('Decrease Radius'), 'ArrowLeft');

  expect(changes).toStrictEqual([0.4, 0.5, 0.4, 0.3]);
});

test('a stepper that is off hears no key', () => {
  act(() => root.render(<Stepper start={0.3} disabled />));

  expect(press(button('Increase Radius'), 'ArrowUp')).toBe(false);
  expect(changes).toStrictEqual([]);
});

test('a pill pressed is the one in force', () => {
  act(() => root.render(<Strip />));
  click(host.querySelectorAll('button')[1] as HTMLElement);

  expect(changes).toStrictEqual(['pairs']);
  expect(host.querySelector('[aria-selected="true"]')?.textContent).toBe(
    'Pairs',
  );
});

test('the arrows walk the strip, carrying the focus, and skip a dead pill', () => {
  act(() => root.render(<Strip />));
  const strip = host.querySelector('[role="tablist"]') as HTMLElement;
  const [map, pairs] = host.querySelectorAll('button');

  expect(press(map as Element, 'ArrowRight')).toBe(true);
  expect(document.activeElement).toBe(pairs);

  press(pairs as Element, 'ArrowRight');
  press(strip, 'ArrowLeft');

  expect(changes).toStrictEqual(['pairs', 'map']);
  expect(document.activeElement).toBe(map);
});

test('a glyph button is lit while pointed at and ringed while it holds the focus', () => {
  act(() =>
    root.render(
      <OverlayIconButton icon="cog" label="Settings" onClick={() => null} />,
    ),
  );
  const glyph = button('Settings');
  const resting = glyph.style.background;
  act(() => {
    glyph.dispatchEvent(
      new MouseEvent('pointerover', { bubbles: true, relatedTarget: null }),
    );
  });
  const lit = glyph.style.background;
  act(() => {
    glyph.dispatchEvent(
      new MouseEvent('pointerout', { bubbles: true, relatedTarget: null }),
    );
    glyph.focus();
  });
  const ringed = glyph.style.outline;
  act(() => {
    glyph.blur();
  });

  expect([resting, lit, ringed, glyph.style.outline]).toStrictEqual([
    'transparent',
    'var(--surface-sunken)',
    '2px solid var(--accent, var(--text))',
    '',
  ]);
});

function Awake() {
  const { awake } = useOverlaySurface();
  return (
    <button type="button" data-awake={String(awake)}>
      Save
    </button>
  );
}

test('the cards over a figure wake while the focus is among them', () => {
  act(() =>
    root.render(
      <div>
        <OverlayLayer>
          <Awake />
        </OverlayLayer>
      </div>,
    ),
  );
  const card = host.querySelector('button') as HTMLButtonElement;
  const states = [card.dataset.awake];
  act(() => card.focus());
  states.push(card.dataset.awake);
  act(() => card.blur());
  states.push(card.dataset.awake);

  expect(states).toStrictEqual(['false', 'true', 'false']);
});

test('a page whose pointer is a finger is told so, and told again when it changes', () => {
  const listeners: Array<() => void> = [];
  let coarse = true;
  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return coarse;
    },
    addEventListener: (_type: string, listener: () => void) => {
      listeners.push(listener);
    },
    removeEventListener: () => undefined,
  }));
  function Pointer() {
    return <span>{useCoarsePointer() ? 'coarse' : 'fine'}</span>;
  }
  act(() => root.render(<Pointer />));

  expect(host.textContent).toBe('coarse');

  coarse = false;
  act(() => {
    for (const listener of listeners) listener();
  });

  expect(host.textContent).toBe('fine');
});
