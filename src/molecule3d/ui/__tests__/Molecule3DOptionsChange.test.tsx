// @vitest-environment jsdom
/**
 * What each control of the options panel hands back when it is used: the
 * representation, the three sliders, the surface switched on, its colouring,
 * and the reset — each a whole settings record with one field moved.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Molecule3DSettings } from '../../core/settings.ts';
import { DEFAULT_MOLECULE_3D_SETTINGS } from '../../core/settings.ts';
import { Molecule3DOptions } from '../Molecule3DOptions.tsx';

const SURFACE_ON: Molecule3DSettings = {
  ...DEFAULT_MOLECULE_3D_SETTINGS,
  showSurface: true,
};

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

test('picking a representation changes it alone', () => {
  render(SURFACE_ON);
  click(buttonNamed('Spacefill'));

  expect(changes).toStrictEqual([
    { ...SURFACE_ON, representation: 'spacefill' },
  ]);
});

test('each slider moves its own setting by one step', () => {
  render(SURFACE_ON);
  const [size, opacity, probe] = host.querySelectorAll('.bp6-slider-handle');
  press(size, 'ArrowRight');
  press(opacity, 'ArrowLeft');
  press(probe, 'ArrowRight');

  expect(
    changes.map(({ sizeFactor, surfaceAlpha, probeRadius }) => ({
      sizeFactor,
      surfaceAlpha,
      probeRadius,
    })),
  ).toStrictEqual([
    { sizeFactor: 1.1, surfaceAlpha: 0.5, probeRadius: 1.4 },
    { sizeFactor: 1, surfaceAlpha: 0.45, probeRadius: 1.4 },
    { sizeFactor: 1, surfaceAlpha: 0.5, probeRadius: 1.5 },
  ]);
});

test('a hidden surface is switched on from the panel', () => {
  render(DEFAULT_MOLECULE_3D_SETTINGS);
  click(buttonNamed('Show it'));

  expect(changes).toStrictEqual([SURFACE_ON]);
});

test('the surface colouring is picked beside the model’s settings', () => {
  render(SURFACE_ON);
  click(buttonNamed('Polarity'));

  expect(changes).toStrictEqual([
    { ...SURFACE_ON, surfaceColoring: 'polarity' },
  ]);
});

test('a polarity surface shows its legend and the polar surface area', () => {
  render({ ...SURFACE_ON, surfaceColoring: 'polarity' }, 17.07);

  expect(
    host.querySelector('[data-testid="molecule3d-polarity-legend"]')
      ?.textContent,
  ).toBe('δ+δ−neutral');
  expect(
    host.querySelector('[data-testid="molecule3d-tpsa-value"]')?.textContent,
  ).toBe('TPSA: 17.1 Å²');
});

test('reset returns every option to the defaults but leaves the surface on', () => {
  render({ ...SURFACE_ON, sizeFactor: 1.6, representation: 'stick' });
  click(buttonNamed('Reset to defaults'));

  expect(changes).toStrictEqual([SURFACE_ON]);
});

function render(
  settings: Molecule3DSettings,
  polarSurfaceArea: number | null = null,
) {
  act(() => {
    root.render(
      <Molecule3DOptions
        settings={settings}
        defaults={DEFAULT_MOLECULE_3D_SETTINGS}
        polarSurfaceArea={polarSurfaceArea}
        onChange={(next) => {
          changes.push(next);
        }}
      />,
    );
  });
}

function buttonNamed(name: string): HTMLButtonElement {
  for (const button of host.querySelectorAll('button')) {
    if (button.textContent === name) return button;
  }
  throw new Error(`no button named ${name}`);
}

function click(element: HTMLElement): void {
  act(() => {
    element.click();
  });
}

function press(element: Element | undefined, key: string): void {
  if (element === undefined) throw new Error('no slider handle');
  act(() => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
}
