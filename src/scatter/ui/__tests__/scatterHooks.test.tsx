import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ScreenPoints } from '../../core/index.ts';
import { dropFrame, modifierMode, scheduleFrame } from '../lassoGesture.ts';
import { useLassoGesture } from '../useLassoGesture.ts';
import { usePointHover } from '../usePointHover.ts';
import { useScatterInteraction } from '../useScatterInteraction.ts';
import { useScatterKeyboard } from '../useScatterKeyboard.ts';
import type { SelectionChange } from '../useScatterSelection.ts';
import { useScatterSelection } from '../useScatterSelection.ts';

test('a selection starts on the rows it was handed, and a controlled one wins', () => {
  const started = probe(
    () => useScatterSelection({ count: 5, defaultSelected: [0, 3] }),
    (it) => `${it.indices.join(',')}|${it.mask.join('')}|${it.selectedCount}`,
  );
  const owned = probe(
    () =>
      useScatterSelection({ count: 4, selected: [1], defaultSelected: [0, 3] }),
    (it) => it.mask.join(''),
  );

  expect(started.html).toBe('0,3|10010|2');
  expect(owned.html).toBe('0100');
});

test('adding merges the new rows into the ones already picked', () => {
  const changes: SelectionChange[] = [];
  const { value } = probe(() =>
    useScatterSelection({
      count: 5,
      defaultSelected: [0, 3],
      onSelectionChange: (change) => changes.push(change),
    }),
  );
  value.select([1, 2], 'add');

  expect(changes).toStrictEqual([
    { indices: [0, 1, 2, 3], mode: 'add', source: 'point' },
  ]);
});

test('clearing reports an empty selection rather than saying nothing', () => {
  const changes: SelectionChange[] = [];
  const { value } = probe(() =>
    useScatterSelection({
      count: 4,
      defaultSelected: [2],
      onSelectionChange: (change) => changes.push(change),
    }),
  );
  value.clear();
  value.selectAll();

  expect(changes).toStrictEqual([
    { indices: [], mode: 'replace', source: 'clear' },
    { indices: [0, 1, 2, 3], mode: 'replace', source: 'all' },
  ]);
});

test('a preview is drawn and never reported', () => {
  const changes: SelectionChange[] = [];
  const { value, html } = probe(
    () =>
      useScatterSelection({
        count: 3,
        onSelectionChange: (change) => changes.push(change),
      }),
    (it) => (it.previewing ? 'drawing' : 'settled'),
  );
  value.preview(Uint8Array.from([0, 1, 1]), 'add');

  expect(html).toBe('settled');
  expect(changes).toHaveLength(0);
});

test('the card names nothing until the pointer arrives, then the nearest point', () => {
  const hovers: number[] = [];
  const pins: number[] = [];
  const { value, html } = probe(
    () =>
      usePointHover({
        points: POINTS,
        onHoverChange: (index) => hovers.push(index),
        onPinChange: (index) => pins.push(index),
      }),
    (it) => `${it.index}|${it.anchor === null ? 'nowhere' : 'somewhere'}`,
  );
  value.moveTo(11, 4);
  value.moveTo(200, 200);
  value.leave();
  value.pin(2);
  value.pin(99);

  expect(html).toBe('-1|nowhere');
  expect(hovers).toStrictEqual([1, -1]);
  expect(pins).toStrictEqual([2]);
});

test('a lasso rests undrawn, and only a touch lasso stops the page scrolling', () => {
  const { value, html } = probe(
    () => ({
      mouse: useLassoGesture({ mode: 'add' }),
      finger: useLassoGesture({ touch: true }),
    }),
    ({ mouse, finger }) => (
      <svg>
        <rect {...mouse.surface} />
        <rect {...finger.surface} />
      </svg>
    ),
  );

  expect(html).toBe(
    '<svg><rect style="cursor:crosshair;touch-action:auto"></rect>' +
      '<rect style="cursor:crosshair;touch-action:none"></rect></svg>',
  );
  expect(value.mouse.drawing).toBe(false);
  expect(value.mouse.pathData).toBe('');
  expect(value.mouse.mode).toBe('add');
});

test('Alt removes whatever else the hand is holding', () => {
  expect(modifierMode({ altKey: true, shiftKey: true }, 'replace')).toBe(
    'remove',
  );
  expect(modifierMode({ altKey: false, shiftKey: true }, 'replace')).toBe(
    'add',
  );
  expect(modifierMode({ altKey: false, shiftKey: false }, 'add')).toBe('add');
});

test('a page with no frame clock does the work at once instead of losing it', () => {
  const slot = { current: null as number | null };
  let done = 0;
  scheduleFrame(slot, () => {
    done += 1;
  });

  expect(done).toBe(1);
  expect(slot.current).toBeNull();

  slot.current = 7;
  dropFrame(slot);

  expect(slot.current).toBeNull();
});

test('the roving cursor walks the cloud, settles on Enter and gives up on Escape', () => {
  const cursors: number[] = [];
  const commits: Array<[number, string]> = [];
  let cancelled = 0;
  let prevented = 0;
  const { value } = probe(() =>
    useScatterKeyboard({
      count: 5,
      onCursorChange: (index) => cursors.push(index),
      onCommit: (index, mode) => commits.push([index, mode]),
      onCancel: () => {
        cancelled += 1;
      },
    }),
  );
  const press = value.onKeyDown as unknown as (event: FakeKey) => void;
  const seen = () => {
    prevented += 1;
  };
  press({ key: 'Enter', preventDefault: seen });
  press({ key: 'ArrowDown', preventDefault: seen });
  press({ key: 'End', preventDefault: seen });
  press({ key: 'ArrowUp', preventDefault: seen });
  press({ key: 'Enter', shiftKey: true, preventDefault: seen });
  press({ key: 'Escape', preventDefault: seen });

  expect(cursors).toStrictEqual([0, 4, 3]);
  expect(commits).toStrictEqual([[3, 'add']]);
  expect(cancelled).toBe(1);
  expect(prevented).toBe(5);
});

test('the interaction hands a plot four pieces a key press reaches through', () => {
  const changes: SelectionChange[] = [];
  const { value, html } = probe(
    () =>
      useScatterInteraction({
        points: POINTS,
        defaultSelected: [1],
        onSelectionChange: (change) => changes.push(change),
      }),
    (it) =>
      `${it.selection.indices.join(',')}|${it.hover.index}|${it.keyboard.cursor}|${it.lasso.mode}`,
  );
  const press = value.keyboard.onKeyDown as unknown as (e: FakeKey) => void;
  press({ key: 'ArrowDown', preventDefault: NOTHING });
  press({ key: 'Enter', shiftKey: true, preventDefault: NOTHING });

  expect(html).toBe('1|-1|-1|replace');
  expect(value.surface).toBe(value.lasso.surface);
  expect(changes).toStrictEqual([
    { indices: [0, 1], mode: 'add', source: 'keyboard' },
  ]);
});

/** Four points on a line, ten pixels apart, for the hit tests to find. */
const POINTS: ScreenPoints = {
  x: Float64Array.from([0, 10, 20, 30]),
  y: Float64Array.from([0, 0, 0, 0]),
};

/** A `preventDefault` for presses whose suppression is not under test. */
function NOTHING(): void {
  // The press is counted somewhere else, or not at all.
}

/**
 * Run a hook once and keep both what it returned and what it drew.
 *
 * Nothing re-renders: there is no DOM, so a setter called afterwards is a
 * no-op, and a change is asserted through the callback the hook reports it on.
 * @param useHook - The hook to run, with its options.
 * @param view - What the probe draws, for the tests that read markup.
 * @returns What the hook returned, and the markup.
 */
function probe<T>(
  useHook: () => T,
  view?: (value: T) => ReactNode,
): { value: T; html: string } {
  const held: T[] = [];
  function Probe() {
    const value = useHook();
    held.push(value);
    return view === undefined ? null : <>{view(value)}</>;
  }
  const html = renderToStaticMarkup(<Probe />);
  return { value: held[0] as T, html };
}

/** As much of a key event as the keyboard hook looks at. */
interface FakeKey {
  /** The key pressed. */
  key: string;
  /** Whether Shift was down. */
  shiftKey?: boolean;
  /** Whether Alt was down. */
  altKey?: boolean;
  /** Counted, where the suppression itself is under test. */
  preventDefault: () => void;
}
