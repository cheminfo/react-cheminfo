/**
 * Which open panels of an editor are pinned. A panel is pinned on purpose —
 * its pin, a double click on its icon, a workspace naming it — and stays while
 * others come and go. A panel opened any other way is passing through: the
 * next one opened takes its place, and folding it closes it.
 *
 * Kept on the site's own signals; `null` pins every open panel, which is what
 * a workspace kept before pins existed reads as.
 */

import type { Cell, SignalTools } from '../../state/core/cells.ts';

/** The signals the pins of a layout are kept on. */
export interface PinCells<P extends string> {
  /** The panels open in the stack. */
  open: Cell<readonly P[]>;
  /** The open panels drawn folded. */
  folded: Cell<readonly P[]>;
  /** The panels placed on purpose; null pins every open panel. */
  pinned: Cell<readonly P[] | null>;
}

type Batch = SignalTools['batch'];

/**
 * The open panels pinned. A folded panel always is: only a pinned panel keeps
 * its header in the stack.
 * @param cells - The layout.
 * @returns The panels, in the order they were opened.
 */
export function pinnedOf<P extends string>(cells: PinCells<P>): readonly P[] {
  const pinned = cells.pinned.value;
  const open = cells.open.value;
  if (pinned === null) return open;
  const folded = cells.folded.value;
  return open.filter((id) => pinned.includes(id) || folded.includes(id));
}

/**
 * Open a panel unpinned, in place of every other unpinned one. A panel
 * already open stays as it is.
 * @param cells - The layout.
 * @param panel - The panel.
 * @param batch - The site's `batch`.
 */
export function openUnpinned<P extends string>(
  cells: PinCells<P>,
  panel: P,
  batch: Batch,
): void {
  if (cells.open.value.includes(panel)) return;
  const pinned = pinnedOf(cells);
  batch(() => {
    cells.pinned.value = pinned;
    cells.open.value = [...pinned, panel];
  });
}

/**
 * Open a panel unpinned beside the others, as a gesture on the figure does:
 * selecting an object opens its panel, and must not close the panel it was
 * picked from. The next panel opened replaces both.
 * @param cells - The layout.
 * @param panel - The panel.
 * @param batch - The site's `batch`.
 */
export function joinUnpinned<P extends string>(
  cells: PinCells<P>,
  panel: P,
  batch: Batch,
): void {
  if (cells.open.value.includes(panel)) return;
  const pinned = pinnedOf(cells);
  batch(() => {
    cells.pinned.value = pinned;
    cells.open.value = [...cells.open.value, panel];
  });
}

/**
 * Pin a panel, opening it when it is not open, or unpin it. An unpinned panel
 * shows its body, since folding it would close it.
 * @param cells - The layout.
 * @param panel - The panel.
 * @param pinned - Whether it is to be pinned.
 * @param batch - The site's `batch`.
 */
export function writePinned<P extends string>(
  cells: PinCells<P>,
  panel: P,
  pinned: boolean,
  batch: Batch,
): void {
  const kept = pinnedOf(cells).filter((id) => id !== panel);
  batch(() => {
    if (pinned && !cells.open.value.includes(panel)) {
      cells.open.value = [...cells.open.value, panel];
    }
    if (!pinned) {
      cells.folded.value = cells.folded.value.filter((id) => id !== panel);
    }
    cells.pinned.value = pinned ? [...kept, panel] : kept;
  });
}

/**
 * Fold the pinned panels among these, close the unpinned ones, and unfold the
 * other pinned panels.
 * @param cells - The layout.
 * @param folded - The open panels folded.
 * @param batch - The site's `batch`.
 */
export function foldOrClose<P extends string>(
  cells: PinCells<P>,
  folded: readonly P[],
  batch: Batch,
): void {
  const pinned = pinnedOf(cells);
  batch(() => {
    cells.open.value = cells.open.value.filter(
      (id) => pinned.includes(id) || !folded.includes(id),
    );
    cells.folded.value = folded.filter((id) => pinned.includes(id));
  });
}

/**
 * The pins once these panels are the open ones, as a settings dialog sets
 * them: a panel newly among them was placed on purpose, so it is pinned.
 * @param cells - The layout, before the change.
 * @param open - The panels open after it.
 * @returns The pins.
 */
export function pinsFor<P extends string>(
  cells: PinCells<P>,
  open: readonly P[],
): readonly P[] | null {
  if (cells.pinned.value === null) return null;
  const pinned = pinnedOf(cells);
  const wasOpen = cells.open.value;
  return open.filter((id) => pinned.includes(id) || !wasOpen.includes(id));
}

/**
 * Drop a closed panel from the pins, so it opens unpinned when it comes back.
 * @param cells - The layout.
 * @param panel - The panel closed.
 */
export function forgetPin<P extends string>(
  cells: PinCells<P>,
  panel: P,
): void {
  const pinned = cells.pinned.value;
  if (pinned?.includes(panel)) {
    cells.pinned.value = pinned.filter((id) => id !== panel);
  }
}
