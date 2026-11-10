// @vitest-environment jsdom
/**
 * What a press on each tool of the viewer's toolbars asks for: the spin and
 * the surface flipped, the view reset, a measuring tool picked or put down,
 * and the measurements cleared.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { MeasurementKind } from '../../core/measurement.ts';
import { Molecule3DToolbar } from '../Molecule3DToolbar.tsx';

let host: HTMLDivElement;
let root: Root;
let asked: string[];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  // The toolbar measures itself to wrap; the test's DOM has no layout to watch.
  vi.stubGlobal('ResizeObserver', StillObserver);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  asked = [];
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

test('the spin, the surface and the view are flipped from the view toolbar', () => {
  render({ spinning: true, showSurface: false });
  press('Spin');
  press('Surface');
  press('Reset view');

  expect(asked).toStrictEqual(['spinning false', 'surface true', 'reset view']);
});

test('a measuring tool is picked, and pressed again it is put down', () => {
  render({ measureKind: 'angle' });
  press('Distance');
  press('Angle');

  expect(asked).toStrictEqual(['measure distance', 'measure none']);
});

test('the measurements are cleared once there are some', () => {
  render({ measurementCount: 0 });
  press('Remove all measurements');

  expect(asked).toStrictEqual([]);

  render({ measurementCount: 2 });
  press('Remove all measurements');

  expect(asked).toStrictEqual(['clear measurements']);
});

class StillObserver {
  observe(): void {
    // Nothing is ever laid out, so nothing changes size.
  }

  unobserve(): void {
    // Nothing was observed.
  }

  disconnect(): void {
    // Nothing was observed.
  }
}

interface ToolbarState {
  spinning?: boolean;
  showSurface?: boolean;
  measureKind?: MeasurementKind | null;
  measurementCount?: number;
}

function render(state: ToolbarState): void {
  const {
    spinning = false,
    showSurface = false,
    measureKind = null,
    measurementCount = 0,
  } = state;
  act(() => {
    root.render(
      <Molecule3DToolbar
        measureKind={measureKind}
        onMeasureKindChange={(kind) => asked.push(`measure ${kind ?? 'none'}`)}
        measurementCount={measurementCount}
        onClearMeasurements={() => asked.push('clear measurements')}
        spinning={spinning}
        onSpinningChange={(next) => asked.push(`spinning ${next}`)}
        showSurface={showSurface}
        onShowSurfaceChange={(next) => asked.push(`surface ${next}`)}
        onResetView={() => asked.push('reset view')}
      />,
    );
  });
}

function press(label: string): void {
  // A disabled tool is drawn as an anchor, so any element carrying the label.
  const button = host.querySelector<HTMLElement>(
    `[aria-label="${CSS.escape(label)}"]`,
  );
  if (button === null) throw new Error(`no tool labelled ${label}`);
  act(() => {
    button.click();
  });
}
