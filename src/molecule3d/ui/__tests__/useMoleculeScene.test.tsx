// @vitest-environment jsdom
/**
 * The scene a canvas is asked for, drawn on the next animation frame: the last
 * request of a burst is the one drawn, a failure is reported and a success
 * clears it, nothing is drawn before the canvas exists, and the reset button
 * frames the molecule again.
 *
 * The viewer is a stand-in writing down what it is asked.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Molecule3DFile } from '../../core/file.ts';
import { DEFAULT_MOLECULE_3D_SETTINGS } from '../../core/settings.ts';
import type { MoleculeSceneOptions } from '../useMoleculeScene.ts';
import { useMoleculeScene } from '../useMoleculeScene.ts';
import type { Molecule3DViewer } from '../viewer.ts';

const NO_MEASUREMENTS = [] as const;

let host: HTMLDivElement;
let root: Root;
let container: HTMLDivElement;
let viewerRef: { current: Molecule3DViewer | null };
let asked: string[];
let failures: Array<string | null>;
let failing: boolean;
const resets: Array<() => void> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
  host = document.createElement('div');
  container = document.createElement('div');
  document.body.append(host, container);
  root = createRoot(host);
  asked = [];
  failures = [];
  failing = false;
  resets.length = 0;
  viewerRef = { current: standInViewer() };
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

test('the molecule is drawn on the next frame, framed from the front, and a success clears any failure', async () => {
  render(file('water'));

  expect(asked).toStrictEqual([]);

  await nextFrame();

  expect(asked).toStrictEqual([
    'model water',
    'measurements 0',
    'frame from the front',
  ]);
  expect(failures).toStrictEqual([null]);
});

test('only the last of several requests made before a frame is drawn', async () => {
  render(file('water'));
  render(file('ethanol'));
  await nextFrame();

  expect(asked).toStrictEqual([
    'model ethanol',
    'measurements 0',
    'frame from the front',
  ]);
});

test('a molecule that cannot be drawn is reported', async () => {
  failing = true;
  render(file('nothing'));
  await nextFrame();

  expect(failures).toStrictEqual(['The file holds no atoms.']);
});

test('nothing is drawn before the canvas exists', async () => {
  render(file('water'), null);
  await nextFrame();

  expect(asked).toStrictEqual([]);
  expect(failures).toStrictEqual([]);
});

test('the reset button frames the molecule again', async () => {
  render(file('water'));
  await nextFrame();
  asked.length = 0;
  act(() => {
    resets.at(-1)?.();
  });

  expect(asked).toStrictEqual(['frame']);
});

function Probe({ options }: { options: MoleculeSceneOptions }) {
  resets.push(useMoleculeScene(options).resetView);
  return null;
}

function render(
  molfile: Molecule3DFile | null,
  target: HTMLElement | null = container,
): void {
  act(() => {
    root.render(
      <Probe
        options={{
          container: target,
          viewerRef,
          molfile,
          frameNewMolecule: 'front',
          settings: DEFAULT_MOLECULE_3D_SETTINGS,
          measurements: NO_MEASUREMENTS,
          spinning: false,
          onFailureChange: (message) => failures.push(message),
          camera: {},
        }}
      />,
    );
  });
}

function file(name: string): Molecule3DFile {
  return { format: 'mol', data: name };
}

async function nextFrame(): Promise<void> {
  await act(async () => {
    vi.advanceTimersToNextFrame();
    await vi.runAllTimersAsync();
  });
}

function standInViewer(): Molecule3DViewer {
  return {
    showMolecule: async (molfile: Molecule3DFile) => {
      asked.push(`model ${molfile.data}`);
      if (failing) throw new Error('The file holds no atoms.');
    },
    hideMolecule: async () => {
      asked.push('empty');
    },
    showSurface: async () => {
      asked.push('surface');
    },
    showMeasurements: async (measurements: readonly unknown[]) => {
      asked.push(`measurements ${measurements.length}`);
    },
    resetCamera: async (_duration?: number, fromFront?: boolean) => {
      asked.push(fromFront ? 'frame from the front' : 'frame');
    },
    setCamera: async () => {
      asked.push('linked camera');
    },
    watchCamera: () => stopWatching,
  } as unknown as Molecule3DViewer;
}

function stopWatching(): void {
  // The stand-in camera never moves, so nothing was watched.
}
