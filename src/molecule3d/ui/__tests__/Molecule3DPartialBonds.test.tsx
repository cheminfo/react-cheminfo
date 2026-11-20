// @vitest-environment jsdom
/**
 * The partial bond switches of the options panel: what they show for each
 * kind of file, and the mode each change stores.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Molecule3DFile } from '../../core/file.ts';
import type { Molecule3DSettings } from '../../core/settings.ts';
import { DEFAULT_MOLECULE_3D_SETTINGS } from '../../core/settings.ts';
import { Molecule3DPartialBonds } from '../Molecule3DPartialBonds.tsx';

let host: HTMLDivElement;
let root: Root;
let changes: Molecule3DSettings[];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  changes = [];
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

test('by default they are on for an XYZ file, and off for a molfile', () => {
  render(DEFAULT_MOLECULE_3D_SETTINGS, 'xyz');

  expect(partialBonds().checked).toBe(true);
  expect(lengths().disabled).toBe(false);

  render(DEFAULT_MOLECULE_3D_SETTINGS, 'mol');

  expect(partialBonds().checked).toBe(false);
  expect(lengths().disabled).toBe(true);
});

test('turning them off an XYZ file stores off, and back on stores auto', () => {
  render(DEFAULT_MOLECULE_3D_SETTINGS, 'xyz');
  click(partialBonds());
  render({ ...DEFAULT_MOLECULE_3D_SETTINGS, partialBonds: 'off' }, 'xyz');
  click(partialBonds());

  expect(changes.map(({ partialBonds: mode }) => mode)).toStrictEqual([
    'off',
    'auto',
  ]);
});

test('turning them on for a molfile stores on', () => {
  render(DEFAULT_MOLECULE_3D_SETTINGS, 'sdf');
  click(partialBonds());

  expect(changes).toStrictEqual([
    { ...DEFAULT_MOLECULE_3D_SETTINGS, partialBonds: 'on' },
  ]);
});

test('their lengths switch changes the lengths alone', () => {
  render(DEFAULT_MOLECULE_3D_SETTINGS, 'xyz');
  click(lengths());

  expect(changes).toStrictEqual([
    { ...DEFAULT_MOLECULE_3D_SETTINGS, partialBondLengths: false },
  ]);
});

test('spacefill greys both, and says why', () => {
  render(
    { ...DEFAULT_MOLECULE_3D_SETTINGS, representation: 'spacefill' },
    'xyz',
  );

  expect(partialBonds().disabled).toBe(true);
  expect(partialBonds().checked).toBe(false);
  expect(lengths().disabled).toBe(true);
  expect(host.firstElementChild?.getAttribute('title')).toBe(
    'Spacefill draws no bonds.',
  );
});

test('a record from before the partial bonds reads as their defaults', () => {
  const older: Partial<Molecule3DSettings> = {
    ...DEFAULT_MOLECULE_3D_SETTINGS,
  };
  delete older.partialBonds;
  delete older.partialBondLengths;
  render(older as Molecule3DSettings, 'xyz');

  expect(partialBonds().checked).toBe(true);
  expect(lengths().checked).toBe(true);
});

function render(
  settings: Molecule3DSettings,
  format: Molecule3DFile['format'],
) {
  act(() => {
    root.render(
      <Molecule3DPartialBonds
        settings={settings}
        format={format}
        onChange={(next) => {
          changes.push(next);
        }}
      />,
    );
  });
}

function partialBonds(): HTMLInputElement {
  return input('molecule3d-partial-bonds');
}

function lengths(): HTMLInputElement {
  return input('molecule3d-partial-bond-lengths');
}

function input(testId: string): HTMLInputElement {
  const found = host.querySelector(`[data-testid="${CSS.escape(testId)}"]`);
  if (!(found instanceof HTMLInputElement)) throw new Error(`no ${testId}`);
  return found;
}

function click(element: HTMLElement): void {
  act(() => {
    element.click();
  });
}
