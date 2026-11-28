/**
 * Which panels of an editor are open beside its figure, which are folded,
 * pinned and left out, kept on the site's own signals: those are preferences,
 * what a narrow window shows is view state. On a window too narrow to keep
 * panels beside the figure they collapse: the figure keeps the row, and one
 * panel at a time comes over it when somebody asks for it.
 */

import type { PinCells } from './panelPins.ts';
import {
  foldOrClose,
  forgetPin,
  joinUnpinned,
  openUnpinned,
  pinnedOf,
  pinsFor,
  writePinned,
} from './panelPins.ts';
import type { PanelState, PanelStateOptions } from './panelStateTypes.ts';
import { watchPanelsCollapsed } from './panelsCollapsed.ts';

/**
 * Keep which panels of an editor are open, folded, pinned and left out.
 * @param options - Every panel, the site's signals, its `batch`, and the
 * panels the page offers.
 * @returns The panels, and what changes them.
 */
export function createPanelState<P extends string>(
  options: PanelStateOptions<P>,
): PanelState<P> {
  const { ids, cells, signals, offered } = options;
  const { open, folded, collapsed, drawer, hidden, pinned } = cells;
  const { batch } = signals;
  const pins: PinCells<P> | undefined = pinned
    ? { open, folded, pinned }
    : undefined;

  const panelsIn = (value: unknown): P[] =>
    Array.isArray(value) ? ids.filter((id) => value.includes(id)) : [];
  const offeredNow = () => offered?.() ?? ids;
  const leftOut = (): readonly P[] => hidden?.value ?? [];

  const openPanel = (panel: P) => {
    if (pins) {
      batch(() => {
        openUnpinned(pins, panel, batch);
        folded.value = folded.value.filter((id) => id !== panel);
      });
      return;
    }
    const opened = panelsIn(open.value);
    const foldedPanels = panelsIn(folded.value);
    if (opened.includes(panel) && !foldedPanels.includes(panel)) return;
    batch(() => {
      open.value = panelsIn([...opened, panel]);
      folded.value = foldedPanels.filter((id) => id !== panel);
    });
  };

  const visible = (): readonly P[] => {
    const offered = offeredNow();
    if (collapsed.value) {
      const panel = drawer.value;
      return panel !== null && offered.includes(panel) ? [panel] : [];
    }
    const out = leftOut();
    return panelsIn(open.value).filter(
      (id) => offered.includes(id) && !out.includes(id),
    );
  };

  const foldOthers = (panel: P) => {
    const others = panelsIn(open.value).filter((id) => id !== panel);
    if (pins) foldOrClose(pins, others, batch);
    else folded.value = others;
  };

  const closePanel = (panel: P) => {
    batch(() => {
      open.value = panelsIn(open.value).filter((id) => id !== panel);
      folded.value = panelsIn(folded.value).filter((id) => id !== panel);
      if (pins) forgetPin(pins, panel);
    });
  };

  const reveal = (panel: P) => {
    batch(() => {
      if (collapsed.peek()) drawer.value = panel;
      if (hidden) hidden.value = hidden.value.filter((id) => id !== panel);
      openPanel(panel);
    });
  };

  return {
    visible,
    visibleFolded: () => (collapsed.value ? [] : panelsIn(folded.value)),
    rail: () => {
      const out = leftOut();
      const shown = visible();
      return offeredNow().filter(
        (id) => !out.includes(id) || shown.includes(id),
      );
    },
    pinned: () => panelsIn(pins ? pinnedOf(pins) : open.value),
    start: () =>
      watchPanelsCollapsed((next) => {
        batch(() => {
          // What was on screen stays on screen when there is room for it.
          const panel = drawer.peek();
          collapsed.value = next;
          drawer.value = null;
          if (panel !== null && !next) openPanel(panel);
        });
      }),
    toggle: (panel) => {
      if (collapsed.value) {
        drawer.value = drawer.value === panel ? null : panel;
        return;
      }
      if (panelsIn(open.value).includes(panel)) closePanel(panel);
      else openPanel(panel);
    },
    open: (panel) => {
      if (leftOut().includes(panel)) return;
      if (pins) joinUnpinned(pins, panel, batch);
      else openPanel(panel);
    },
    close: (panel) => {
      if (!collapsed.value) closePanel(panel);
      else if (drawer.value === panel) drawer.value = null;
    },
    setFolded: (next) => {
      if (collapsed.value) {
        // Folding the one over the figure sends it away.
        if (next.length > 0) drawer.value = null;
        return;
      }
      if (pins) {
        foldOrClose(pins, panelsIn(next), batch);
        return;
      }
      // A panel open but not drawn now keeps its fold for the next page.
      const drawn = visible();
      const kept = panelsIn(folded.value).filter((id) => !drawn.includes(id));
      folded.value = panelsIn([...kept, ...next]);
    },
    setPinned: (panel, value) => {
      if (!pins) return;
      batch(() => {
        if (value && collapsed.value) drawer.value = panel;
        writePinned(pins, panel, value, batch);
      });
    },
    focus: (panel) => {
      if (leftOut().includes(panel)) return;
      batch(() => {
        openPanel(panel);
        foldOthers(panel);
      });
    },
    reveal,
    showAlone: (panel) => {
      batch(() => {
        reveal(panel);
        if (!collapsed.peek()) foldOthers(panel);
      });
    },
    layout: () => ({
      open: open.value,
      folded: folded.value,
      hidden: leftOut(),
    }),
    setLayout: (layout) => {
      const kept = pins ? pinsFor(pins, layout.open) : null;
      batch(() => {
        open.value = panelsIn(layout.open);
        folded.value = panelsIn(layout.folded);
        if (hidden) hidden.value = panelsIn(layout.hidden);
        if (pins) pins.pinned.value = kept;
      });
    },
    panelsIn,
  };
}
