// @vitest-environment jsdom
/**
 * A viewer mounted for as long as its element exists: created once there is
 * one, with the options of the latest render, kept to the element's size, and
 * disposed with it.
 *
 * The viewer itself needs WebGL, so `createMolecule3DViewer` hands back a
 * stand-in that writes down what it is asked.
 */

import { act, useEffect } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useMoleculeViewer } from '../useMoleculeViewer.ts';
import type { Molecule3DViewer } from '../viewer.ts';
import type { Molecule3DViewerOptions } from '../viewerTypes.ts';

const log = vi.hoisted(() => [] as string[]);

vi.mock('../createViewer.ts', () => ({
  createMolecule3DViewer: (
    container: HTMLElement,
    options: { background?: string },
  ) => {
    const name = `${container.id} on ${options.background}`;
    log.push(`create ${name}`);
    return {
      name,
      handleResize: () => log.push(`resize ${name}`),
      dispose: () => log.push(`dispose ${name}`),
    };
  },
}));

let host: HTMLDivElement;
let root: Root;
let resize: Array<() => void>;
let observed: string[];
let shown: Array<string | null>;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  log.length = 0;
  resize = [];
  observed = [];
  shown = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      readonly #callback: () => void;

      constructor(callback: () => void) {
        this.#callback = callback;
        resize.push(callback);
      }

      observe(element: HTMLElement) {
        observed.push(`observe ${element.id}`);
      }

      disconnect() {
        observed.push('disconnect');
        resize = resize.filter((callback) => callback !== this.#callback);
      }
    },
  );
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

test('no viewer is made before its element exists', () => {
  mount(null, { background: '#000000' });

  expect(log).toStrictEqual([]);
  expect(shown).toStrictEqual([null]);
});

test('the viewer is made with the options of the latest render, and follows its element’s size', () => {
  mount(null, { background: '#000000' });
  mount(element('left'), { background: '#ffffff' });

  expect(log).toStrictEqual(['create left on #ffffff']);
  expect(observed).toStrictEqual(['observe left']);
  expect(shown.at(-1)).toBe('left on #ffffff');

  for (const callback of resize) callback();

  expect(log.at(-1)).toBe('resize left on #ffffff');
});

test('a later change of options does not make another viewer', () => {
  const left = element('left');
  mount(left, { background: '#ffffff' });
  mount(left, { background: '#000000' });

  expect(log).toStrictEqual(['create left on #ffffff']);
});

test('another element disposes the old viewer before making the next', () => {
  mount(element('left'), { background: '#ffffff' });
  mount(element('right'), { background: '#ffffff' });

  expect(log).toStrictEqual([
    'create left on #ffffff',
    'dispose left on #ffffff',
    'create right on #ffffff',
  ]);
  expect(observed).toStrictEqual([
    'observe left',
    'disconnect',
    'observe right',
  ]);
});

test('unmounting stops watching the size and disposes the viewer', () => {
  mount(element('left'), {});
  act(() => {
    root.unmount();
  });

  expect(log).toStrictEqual([
    'create left on undefined',
    'dispose left on undefined',
  ]);
  expect(observed).toStrictEqual(['observe left', 'disconnect']);
  expect(resize).toStrictEqual([]);

  root = createRoot(host);
});

function Probe({
  container,
  options,
}: {
  container: HTMLElement | null;
  options: Molecule3DViewerOptions;
}) {
  const viewerRef = useMoleculeViewer(container, options);
  useEffect(() => {
    const viewer = viewerRef.current as
      (Molecule3DViewer & { name: string }) | null;
    shown.push(viewer === null ? null : viewer.name);
  });
  return null;
}

function mount(
  container: HTMLElement | null,
  options: Molecule3DViewerOptions,
): void {
  act(() => {
    root.render(<Probe container={container} options={options} />);
  });
}

function element(id: string): HTMLDivElement {
  const div = document.createElement('div');
  div.id = id;
  return div;
}
