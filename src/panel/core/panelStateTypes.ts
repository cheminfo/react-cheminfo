import type { Cell, SignalTools } from '../../state/core/cells.ts';

import type { PanelLayout } from './panelLayout.ts';

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
  /**
   * The panels the workspace leaves out: off the rail, out of the stack, and
   * never opened by a gesture; a link naming one reveals it.
   * @default none is left out
   */
  hidden?: Cell<readonly P[]>;
  /**
   * The open panels placed on purpose; `null` pins every open panel. Given, a
   * panel opened from the rail is passing through: the next one opened takes
   * its place, and folding it closes it.
   * @default every open panel is pinned, and a panel opens beside the others
   */
  pinned?: Cell<readonly P[] | null>;
}

/** What the panels of an editor are kept on. */
export interface PanelStateOptions<P extends string> {
  /** Every panel, in the order the rail lists them. */
  ids: readonly P[];
  /** The site's signals. */
  cells: PanelStateCells<P>;
  /** `batch` from the site's signals. */
  signals: Pick<SignalTools, 'batch'>;
  /**
   * The panels the page offers now — those a link's `?hide=` keeps, those
   * the document on screen has something for. Read where the panels are
   * drawn, so a computed follows it. A panel open but not offered keeps its
   * place and its fold for the next page that offers it.
   * @default every panel
   */
  offered?: () => readonly P[];
}

/** The panels of an editor, and what changes them. */
export interface PanelState<P extends string> {
  /** The panels on screen: the open ones offered, or the one over the figure. */
  visible: () => readonly P[];
  /** The panels on screen drawn folded; none while the panels collapse. */
  visibleFolded: () => readonly P[];
  /** The panels the rail lists: offered and not left out, or on screen. */
  rail: () => readonly P[];
  /** The open panels pinned: every open one when the site keeps no pins. */
  pinned: () => readonly P[];
  /**
   * Follow the width of the window; returns the stop.
   * @returns Stops following it.
   */
  start: () => () => void;
  /** Open a panel or close it, from its button on the rail. */
  toggle: (panel: P) => void;
  /**
   * Show a panel open, as a gesture on the figure asks: unfolded, or beside
   * the others unpinned where the site keeps pins. A panel left out stays out,
   * and with the panels collapsed it only joins the preferences: a gesture on
   * the figure must not cover the figure.
   */
  open: (panel: P) => void;
  /**
   * Close a panel, from the cross of its header. With the panels collapsed
   * only the one over the figure leaves, and the preferences stay.
   */
  close: (panel: P) => void;
  /**
   * Fold the panels given, as the panel stack reports them. Where the site
   * keeps pins, an unpinned panel folded is closed.
   */
  setFolded: (folded: readonly string[]) => void;
  /**
   * Pin a panel, opening it, or unpin it; nothing where the site keeps no
   * pins. With the panels collapsed, a panel pinned comes over the figure.
   */
  setPinned: (panel: P, pinned: boolean) => void;
  /** Open a panel unfolded and fold the others; unpinned ones close. */
  focus: (panel: P) => void;
  /**
   * Show a panel asked for by name — a link, a tour — open and unfolded, and
   * offered from then on; with the panels collapsed it comes over the figure.
   */
  reveal: (panel: P) => void;
  /** Reveal a panel and fold every other: the one panel a link shows. */
  showAlone: (panel: P) => void;
  /** Which panels are open, folded and left out, as a settings dialog reads them. */
  layout: () => PanelLayout<P>;
  /**
   * Open, fold and leave out the panels as a settings dialog or a workspace
   * says. A panel it opens is pinned, since it is placed on purpose.
   */
  setLayout: (layout: PanelLayout<P>) => void;
  /** The panels a stored value names, in the order of `ids`. */
  panelsIn: (value: unknown) => P[];
}
