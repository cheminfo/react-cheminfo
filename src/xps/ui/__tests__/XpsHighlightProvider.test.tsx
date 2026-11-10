// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { XpsHighlight } from '../../core/xpsHighlight.ts';
import { NO_HIGHLIGHT } from '../../core/xpsHighlight.ts';
import { XpsHighlightProvider } from '../XpsHighlightProvider.tsx';
import type { LookAtEnergy } from '../xpsHighlightContext.ts';
import { useLookAtEnergy, useXpsHighlight } from '../xpsHighlightContext.ts';

/** The adventitious carbon peak of a C 1s scan. */
const CARBON: XpsHighlight = {
  spectrumId: 'b',
  peakId: 'b-1',
  componentId: null,
  bindingEnergy: 284.8,
};

/** The carbonate component the same envelope was fitted with. */
const CARBONATE: XpsHighlight = {
  spectrumId: 'b',
  peakId: null,
  componentId: 'b-2',
  bindingEnergy: 288.5,
};

/** What the view saw lit, once per commit it was given. */
const lit: XpsHighlight[] = [];

/** What a listening parent was told, once per report it accepted or declined. */
const told: XpsHighlight[] = [];

/** The way to say what is looked at, as it stood at the last commit. */
let reportHover: LookAtEnergy | null = null;

const roots: Array<ReturnType<typeof createRoot>> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  lit.length = 0;
  told.length = 0;
  reportHover = null;
  for (const root of roots) act(() => root.unmount());
  roots.length = 0;
  vi.unstubAllGlobals();
});

test('a hover lights the peak for everything inside an uncontrolled provider', () => {
  mount({});

  expect(lit).toStrictEqual([NO_HIGHLIGHT]);

  hover(CARBON);

  expect(lit).toStrictEqual([NO_HIGHLIGHT, CARBON]);
  expect(told).toStrictEqual([]);
});

test('the pointer crossing one peak lights it once, not once per pixel', () => {
  mount({ onHighlight: (highlight) => told.push(highlight) });

  hover(CARBON);
  hover({ ...CARBON });
  // Three thousandths of an eV is a fifteenth of a point of a narrow scan, so
  // it is the same guide and not a reason to redraw every table below it.
  hover({ ...CARBON, bindingEnergy: 284.803 });

  expect(lit).toStrictEqual([NO_HIGHLIGHT, CARBON]);
  expect(told).toStrictEqual([CARBON]);
});

test('the pointer leaving the peak is a report of its own', () => {
  mount({ onHighlight: (highlight) => told.push(highlight) });

  hover(CARBON);
  hover(NO_HIGHLIGHT);
  hover(NO_HIGHLIGHT);

  expect(told).toStrictEqual([CARBON, NO_HIGHLIGHT]);
  expect(lit).toStrictEqual([NO_HIGHLIGHT, CARBON, NO_HIGHLIGHT]);
});

test('a controlled provider shows what it was given, never what was reported', () => {
  const listen = {
    onHighlight: (highlight: XpsHighlight) => told.push(highlight),
  };
  const render = mount({ highlight: NO_HIGHLIGHT, ...listen });

  hover(CARBON);

  expect(lit).toStrictEqual([NO_HIGHLIGHT]);
  expect(told).toStrictEqual([CARBON]);

  render({ highlight: CARBON, ...listen });

  expect(lit).toStrictEqual([NO_HIGHLIGHT, CARBON]);
});

test('a parent that declines a hover is not told the same thing again', () => {
  mount({
    highlight: NO_HIGHLIGHT,
    onHighlight: (highlight) => told.push(highlight),
  });

  hover(CARBON);
  hover({ ...CARBON });
  hover({ ...CARBON });

  expect(told).toStrictEqual([CARBON]);
});

test('a highlight taken by something else re-opens the peak the pointer is on', () => {
  const listen = {
    onHighlight: (highlight: XpsHighlight) => told.push(highlight),
  };
  const render = mount({ highlight: NO_HIGHLIGHT, ...listen });

  hover(CARBON);

  expect(told).toStrictEqual([CARBON]);

  render({ highlight: CARBONATE, ...listen });
  hover(CARBON);

  expect(told).toStrictEqual([CARBON, CARBON]);
});

test('the way to report a hover keeps its identity across every render', () => {
  const render = mount({});
  const first = reporter();

  hover(CARBON);
  render({ highlight: CARBONATE });

  expect(reporter()).toBe(first);
});

/** What a provider is mounted with. */
interface MountProps {
  /** What is looked at, when the test is the one deciding. */
  highlight?: XpsHighlight;
  /** Called on every report the provider accepts. */
  onHighlight?: (highlight: XpsHighlight) => void;
}

/**
 * Report a hover from inside the mounted provider, and let it settle.
 * @param highlight - What the pointer has come to rest on.
 */
function hover(highlight: XpsHighlight) {
  const report = reporter();
  act(() => report(highlight));
}

/**
 * The way to report a hover, as the last commit left it.
 * @returns What `useLookAtEnergy` handed the view inside the provider.
 */
function reporter(): LookAtEnergy {
  if (reportHover === null) {
    throw new Error('Nothing has been mounted to report a hover from');
  }
  return reportHover;
}

/**
 * Mount a provider into a throwaway document, watched from the inside.
 * @param props - What the provider is given at first.
 * @returns A function re-rendering it with other props.
 */
function mount(props: MountProps) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);

  function render(next: MountProps) {
    act(() => {
      root.render(
        <XpsHighlightProvider {...next}>
          <Watcher />
        </XpsHighlightProvider>,
      );
    });
  }

  render(props);
  return render;
}

/**
 * A view that records what it is shown and hands its way of reporting out.
 * @returns Nothing — it is what it saw that matters.
 */
function Watcher() {
  const highlight = useXpsHighlight();
  const report = useLookAtEnergy();

  useLayoutEffect(() => {
    lit.push(highlight);
    reportHover = report;
  });

  return null;
}
