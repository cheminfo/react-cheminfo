// @vitest-environment jsdom
import { act, useEffect, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { CollapsedPanels } from '../useCollapsedPanels.ts';
import { useCollapsedPanels } from '../useCollapsedPanels.ts';

type Id = 'spectra' | 'peaks' | 'metadata';

let listeners: Set<() => void>;
let narrow: boolean;
let host: HTMLDivElement;
let root: Root;
let seen: CollapsedPanels<Id>;
let open: readonly Id[];

function Editor(props: {
  onRender: (panels: CollapsedPanels<Id>, openIds: readonly Id[]) => void;
}) {
  const { onRender } = props;
  const [openIds, setOpenIds] = useState<readonly Id[]>(['spectra', 'peaks']);
  const panels = useCollapsedPanels(openIds, (id) => {
    setOpenIds((current) =>
      current.includes(id)
        ? current.filter((other) => other !== id)
        : [...current, id],
    );
  });
  useEffect(() => {
    onRender(panels, openIds);
  });
  return null;
}

function resizeTo(next: boolean) {
  narrow = next;
  act(() => {
    for (const listener of listeners) listener();
  });
}

function mount() {
  act(() => {
    root.render(
      <Editor
        onRender={(panels, openIds) => {
          seen = panels;
          open = openIds;
        }}
      />,
    );
  });
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  narrow = true;
  listeners = new Set();
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query !== 'print' && narrow;
    },
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
  }));
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

test('with room the editor shows what it has open, and a press changes that', () => {
  narrow = false;
  mount();

  expect(seen.collapsed).toBe(false);
  expect(seen.shownIds).toStrictEqual(['spectra', 'peaks']);
  expect(seen.folds).toStrictEqual({});

  act(() => seen.toggle('metadata'));

  expect(seen.shownIds).toStrictEqual(['spectra', 'peaks', 'metadata']);
});

test('without room nothing shows until somebody asks', () => {
  mount();

  expect(seen.collapsed).toBe(true);
  expect(seen.shownIds).toStrictEqual([]);
});

test('a press shows one panel at a time, and what is open never hears of it', () => {
  mount();

  act(() => seen.toggle('metadata'));

  expect(seen.shownIds).toStrictEqual(['metadata']);

  act(() => seen.toggle('peaks'));

  expect(seen.shownIds).toStrictEqual(['peaks']);

  act(() => seen.toggle('peaks'));

  expect(seen.shownIds).toStrictEqual([]);

  expect(open).toStrictEqual(['spectra', 'peaks']);
});

test('the panel over the figure is never folded, and a fold sends it away', () => {
  mount();
  act(() => seen.toggle('metadata'));

  expect(seen.folds.foldedPanelIds).toStrictEqual([]);

  act(() => seen.folds.onFoldedPanelIdsChange?.(['metadata']));

  expect(seen.shownIds).toStrictEqual([]);
});

test('a wider window finds what is open, plus what was on screen', () => {
  mount();
  act(() => seen.toggle('metadata'));

  resizeTo(false);

  expect(seen.collapsed).toBe(false);
  expect(seen.shownIds).toStrictEqual(['spectra', 'peaks', 'metadata']);
});

test('a panel on screen that was already open is not closed by a wider window', () => {
  mount();
  act(() => seen.toggle('peaks'));

  resizeTo(false);

  expect(seen.shownIds).toStrictEqual(['spectra', 'peaks']);
});

test('narrowing the window collapses everything', () => {
  narrow = false;
  mount();

  resizeTo(true);

  expect(seen.collapsed).toBe(true);
  expect(seen.shownIds).toStrictEqual([]);
});
