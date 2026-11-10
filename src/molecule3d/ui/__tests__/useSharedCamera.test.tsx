// @vitest-environment jsdom
/**
 * The camera handed between a canvas and its site: a link's camera spent on
 * the first molecule, and a reader's move reported once it has come to rest —
 * never a move nobody made, never while the model spins, never twice.
 *
 * The viewer is a stand-in whose camera moves when the test says so.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Molecule3DCamera } from '../../core/camera.ts';
import type { SharedCamera, SharedCameraOptions } from '../useSharedCamera.ts';
import { useSharedCamera } from '../useSharedCamera.ts';
import type { Molecule3DViewer } from '../viewer.ts';

const LINKED: Molecule3DCamera = {
  rotation: [0, 0, 0, 1],
  zoom: 2,
  offset: [0, 0, 0],
};
const TURNED: Molecule3DCamera = {
  rotation: [0, 1, 0, 0],
  zoom: 1,
  offset: [0, 0, 0],
};
const CLOSER: Molecule3DCamera = { ...TURNED, zoom: 3 };

let host: HTMLDivElement;
let root: Root;
let container: HTMLDivElement;
let listeners: Set<(camera: Molecule3DCamera | null) => void>;
let viewerRef: { current: Molecule3DViewer | null };
let shared: SharedCamera[];
let reported: Molecule3DCamera[];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
  host = document.createElement('div');
  container = document.createElement('div');
  document.body.append(host, container);
  root = createRoot(host);
  listeners = new Set();
  const viewer = {
    watchCamera(listener: (camera: Molecule3DCamera | null) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  } as unknown as Molecule3DViewer;
  viewerRef = { current: viewer };
  shared = [];
  reported = [];
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test('a link’s camera is handed out once, for the first molecule framed', () => {
  mount({ initialCamera: LINKED });
  const [first] = shared;

  expect(first?.takeLinkedCamera()).toStrictEqual(LINKED);
  expect(first?.takeLinkedCamera()).toBeNull();
});

test('a reader’s move is reported once the camera has been still for the settle delay', () => {
  mount();
  gesture('pointerdown');
  move(TURNED);
  advance(399);

  expect(reported).toStrictEqual([]);

  move(CLOSER);
  advance(399);

  expect(reported).toStrictEqual([]);

  advance(1);

  expect(reported).toStrictEqual([CLOSER]);
});

test('the camera drifting on its own is never reported, until the reader touches it', () => {
  mount();
  move(TURNED);
  advance(400);

  expect(reported).toStrictEqual([]);

  gesture('wheel');
  move(CLOSER);
  advance(400);

  expect(reported).toStrictEqual([CLOSER]);
});

test('nothing is reported while the model spins', () => {
  mount({ spinning: true });
  gesture('pointerdown');
  move(TURNED);
  advance(400);

  expect(reported).toStrictEqual([]);

  mount({ spinning: false });
  move(TURNED);
  advance(400);

  expect(reported).toStrictEqual([TURNED]);
});

test('the camera a link put in place, and a camera already reported, are not handed back', () => {
  mount({ initialCamera: LINKED });
  shared[0]?.takeLinkedCamera();
  gesture('pointerdown');
  move(LINKED);
  advance(400);
  move(TURNED);
  advance(400);
  move(TURNED);
  advance(400);

  expect(reported).toStrictEqual([TURNED]);
});

test('an empty scene’s camera is not a move', () => {
  mount();
  shared[0]?.noteMove();
  move(null);
  advance(400);

  expect(reported).toStrictEqual([]);
});

test('unmounting stops watching the camera and drops a move still settling', () => {
  mount();
  gesture('pointerdown');
  move(TURNED);
  act(() => {
    root.unmount();
  });
  advance(400);

  expect(reported).toStrictEqual([]);
  expect(listeners.size).toBe(0);

  root = createRoot(host);
});

test('before the canvas exists nothing is watched, and the answer stays the same object across renders', () => {
  mount({ container: null });

  expect(listeners.size).toBe(0);

  mount({ container: null, spinning: true });

  expect(shared).toHaveLength(2);
  expect(shared[1]).toBe(shared[0]);
});

function Probe({ options }: { options: SharedCameraOptions }) {
  shared.push(useSharedCamera(options));
  return null;
}

function mount(options: Partial<SharedCameraOptions> = {}): void {
  act(() => {
    root.render(
      <Probe
        options={{
          container,
          viewerRef,
          initialCamera: null,
          spinning: false,
          settleDelay: 400,
          onCameraChange: (camera) => {
            reported.push(camera);
          },
          ...options,
        }}
      />,
    );
  });
}

function gesture(type: 'pointerdown' | 'wheel'): void {
  container.dispatchEvent(new Event(type));
}

function move(camera: Molecule3DCamera | null): void {
  for (const listener of listeners) listener(camera);
}

function advance(milliseconds: number): void {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}
