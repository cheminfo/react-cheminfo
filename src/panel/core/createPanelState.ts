/**
 * Which panels of an editor are open beside its figure, and which are folded,
 * kept on the site's own signals: the open and folded panels are preferences,
 * what a narrow window shows is view state. On a window too narrow to keep
 * panels beside the figure they collapse: the figure keeps the row, and one
 * panel at a time comes over it when somebody asks for it.
 */

import type { Cell, SignalTools } from '../../storage/core/documentFile.ts';

import { watchPanelsCollapsed } from './panelsCollapsed.ts';

/** The signals the panels of an editor are kept on. */
export interface PanelStateCells<P extends string> {
  /** The panels open beside the figure: a preference. */
  open: Cell<readonly P[]>;
  /** The open panels drawn folded: a preference. */
  folded: Cell<readonly P[]>;
  /** Whether the window is too narrow for panels beside the figure. */
  collapsed: Cell<boolean>;
  /** The panel over the figure while the panels are collapsed. */
  drawer: Cell<P | null>;
}

/** What the panels of an editor are kept on. */
export interface PanelStateOptions<P extends string> {
  /** Every panel, in the order the rail lists them. */
  ids: readonly P[];
  /** The site's signals. */
  cells: PanelStateCells<P>;
  /** `batch` from the site's signals. */
  signals: Pick<SignalTools, 'batch'>;
}

/** The panels of an editor, and what changes them. */
export interface PanelState<P extends string> {
  /** The panels on screen: the open ones, or the one over the figure. */
  visible: () => readonly P[];
  /** The panels on screen drawn folded; none while the panels collapse. */
  visibleFolded: () => readonly P[];
  /**
   * Follow the width of the window; returns the stop.
   * @returns Stops following it.
   */
  start: () => () => void;
  /** Open a panel or close it, from its button on the rail. */
  toggle: (panel: P) => void;
  /**
   * Show a panel open and unfolded. With the panels collapsed it only joins
   * the preferences: a gesture on the figure must not cover the figure.
   */
  open: (panel: P) => void;
  /** Fold the panels given, as the panel stack reports them. */
  setFolded: (folded: readonly string[]) => void;
  /** The panels a stored value names, in the order of `ids`. */
  panelsIn: (value: unknown) => P[];
}

/**
 * Keep which panels of an editor are open and folded.
 * @param options - Every panel, the site's signals and its `batch`.
 * @returns The panels, and what changes them.
 */
export function createPanelState<P extends string>(
  options: PanelStateOptions<P>,
): PanelState<P> {
  const { ids, cells, signals } = options;
  const { open, folded, collapsed, drawer } = cells;

  const panelsIn = (value: unknown): P[] =>
    Array.isArray(value) ? ids.filter((id) => value.includes(id)) : [];

  const openPanel = (panel: P) => {
    const opened = panelsIn(open.value);
    const foldedPanels = panelsIn(folded.value);
    if (opened.includes(panel) && !foldedPanels.includes(panel)) return;
    signals.batch(() => {
      open.value = panelsIn([...opened, panel]);
      folded.value = foldedPanels.filter((id) => id !== panel);
    });
  };

  return {
    visible: () => {
      if (!collapsed.value) return panelsIn(open.value);
      const panel = drawer.value;
      return panel === null ? [] : [panel];
    },
    visibleFolded: () => (collapsed.value ? [] : panelsIn(folded.value)),
    start: () =>
      watchPanelsCollapsed((next) => {
        signals.batch(() => {
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
      const opened = panelsIn(open.value);
      if (!opened.includes(panel)) {
        openPanel(panel);
        return;
      }
      signals.batch(() => {
        open.value = opened.filter((id) => id !== panel);
        folded.value = panelsIn(folded.value).filter((id) => id !== panel);
      });
    },
    open: openPanel,
    setFolded: (next) => {
      if (collapsed.value) {
        // Folding the one over the figure sends it away.
        if (next.length > 0) drawer.value = null;
        return;
      }
      folded.value = panelsIn(next);
    },
    panelsIn,
  };
}
