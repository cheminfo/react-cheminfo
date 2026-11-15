// @vitest-environment jsdom
/**
 * The measurement list of a canvas and the removal of the one under the
 * pointer: a stand-in viewer reports what is hovered, and the keyboard does
 * the rest.
 */

import { act, useEffect } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Measurement } from '../../core/measurement.ts';
import type { MeasurementList } from '../useMeasurements.ts';
import {
  useMeasurementList,
  useMeasurementRemoval,
} from '../useMeasurements.ts';
import type { Molecule3DViewer } from '../viewer.ts';

const C_O: Measurement = {
  kind: 'distance',
  atoms: [
    { unit: 0, element: 1 },
    { unit: 0, element: 2 },
  ],
};
const C_C_O: Measurement = {
  kind: 'angle',
  atoms: [
    { unit: 0, element: 0 },
    { unit: 0, element: 1 },
    { unit: 0, element: 2 },
  ],
};

let host: HTMLDivElement;
let root: Root;
let hover: ((measurement: Measurement | null) => void) | undefined;
let watching: number;
let removed: Measurement[];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  hover = undefined;
  watching = 0;
  removed = [];
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

test('the list keeps its own copy: added, removed in either direction, cleared', () => {
  const changes: Array<readonly Measurement[]> = [];
  const list = mountList(undefined, (next) => changes.push(next));

  act(() => {
    list.current.add(C_O);
  });
  act(() => {
    list.current.add(C_C_O);
  });
  act(() => {
    list.current.remove({ kind: 'distance', atoms: C_O.atoms.toReversed() });
  });
  act(() => {
    list.current.remove(C_O);
  });
  act(() => {
    list.current.clear();
  });

  expect(changes).toStrictEqual([[C_O], [C_O, C_C_O], [C_C_O], []]);
  expect(list.current.measurements).toStrictEqual([]);
});

test('a list the parent owns is only reported, built on the latest value', () => {
  const changes: Array<readonly Measurement[]> = [];
  const list = mountList([C_O, C_C_O], (next) => changes.push(next));

  act(() => {
    list.current.remove(C_C_O);
  });

  expect(changes).toStrictEqual([[C_O]]);
  expect(list.current.measurements).toStrictEqual([C_O, C_C_O]);
});

test('Backspace or Delete removes the measurement under the pointer, once', () => {
  mountRemoval(true);

  hover?.(C_O);
  const backspace = press('Backspace');
  press('Backspace');
  hover?.(C_C_O);
  press('Delete');

  expect(removed).toStrictEqual([C_O, C_C_O]);
  expect(backspace.defaultPrevented).toBe(true);
});

test('no measurement under the pointer, another key, a modifier or a field being typed in removes nothing', () => {
  mountRemoval(true);
  const field = document.createElement('input');
  document.body.append(field);

  press('Backspace');
  hover?.(C_O);
  hover?.(null);
  press('Delete');
  hover?.(C_O);
  press('x');
  press('Backspace', { metaKey: true });
  press('Backspace', {}, field);
  field.remove();

  expect(removed).toStrictEqual([]);
});

test('without a handler nothing is watched, and unmounting stops listening', () => {
  mountRemoval(false);

  expect(watching).toBe(0);

  mountRemoval(true);

  expect(watching).toBe(1);

  act(() => {
    root.unmount();
  });
  root = createRoot(host);

  expect(watching).toBe(0);
});

function mountList(
  value: readonly Measurement[] | undefined,
  onChange: (measurements: readonly Measurement[]) => void,
): { current: MeasurementList } {
  const latest = {} as { current: MeasurementList };
  function Probe() {
    const list = useMeasurementList(value, onChange);
    useEffect(() => {
      latest.current = list;
    });
    return null;
  }
  act(() => {
    root.render(<Probe />);
  });
  return latest;
}

function mountRemoval(enabled: boolean): void {
  const viewer = {
    watchHoverMeasurement: (
      listener: (measurement: Measurement | null) => void,
    ) => {
      hover = listener;
      watching++;
      return () => {
        hover = undefined;
        watching--;
      };
    },
  } as unknown as Molecule3DViewer;
  function Probe() {
    useMeasurementRemoval(
      host,
      { current: viewer },
      enabled ? onRemove : undefined,
    );
    return null;
  }
  act(() => {
    root.render(<Probe />);
  });
}

function onRemove(measurement: Measurement): void {
  removed.push(measurement);
}

function press(
  key: string,
  modifiers: KeyboardEventInit = {},
  target: EventTarget = document.body,
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...modifiers,
  });
  target.dispatchEvent(event);
  return event;
}
