// @vitest-environment jsdom
/**
 * The polar surface area of the molecule on screen, computed by openchemlib
 * only once asked for: never for a file without bonds, and never shown for a
 * molecule other than the one on screen.
 */

import { Molecule } from 'openchemlib';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { Molecule3DFile } from '../../core/file.ts';
import { usePolarSurfaceArea } from '../usePolarSurfaceArea.ts';

const ACETONE: Molecule3DFile = {
  format: 'mol',
  data: Molecule.fromSmiles('CC(C)=O').toMolfile(),
};
const ETHANOL: Molecule3DFile = {
  format: 'mol',
  data: Molecule.fromSmiles('CCO').toMolfile(),
};

let host: HTMLDivElement;
let root: Root;

beforeAll(async () => {
  // Loaded once here, so the hook's own import resolves within a few ticks.
  await import('openchemlib');
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
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

test('the area of acetone is that of its carbonyl oxygen', async () => {
  await mount(ACETONE, true);

  expect(host.textContent).toBe('17.07');
});

test('another molecule shows no area until its own is known', async () => {
  await mount(ACETONE, true);
  act(() => {
    root.render(<Probe molfile={ETHANOL} enabled />);
  });

  expect(host.textContent).toBe('unknown');

  await settle();

  expect(host.textContent).toBe('20.23');
});

test('nothing is computed when it is not asked for, nor for an XYZ file, nor without a molecule', async () => {
  await mount(ACETONE, false);

  expect(host.textContent).toBe('unknown');

  await mount({ format: 'xyz', data: '1\n\nO 0 0 0\n' }, true);

  expect(host.textContent).toBe('unknown');

  await mount(null, true);

  expect(host.textContent).toBe('unknown');
});

function Probe({
  molfile,
  enabled,
}: {
  molfile: Molecule3DFile | null;
  enabled: boolean;
}) {
  const area = usePolarSurfaceArea(molfile, enabled);
  return <span>{area === null ? 'unknown' : area.toFixed(2)}</span>;
}

async function mount(
  molfile: Molecule3DFile | null,
  enabled: boolean,
): Promise<void> {
  act(() => {
    root.render(<Probe molfile={molfile} enabled={enabled} />);
  });
  await settle();
}

async function settle(): Promise<void> {
  // The import and the state update each get a task of their own.
  await act(async () => {
    await nextTask();
    await nextTask();
    await nextTask();
  });
}

function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
