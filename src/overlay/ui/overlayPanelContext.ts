/**
 * What the rows of one settings panel agree on.
 *
 * A panel is handed its controls as opaque children, so it cannot reach into
 * them and set a prop; and every row deciding for itself whether it is a line
 * on a bar or a cell in a grid is exactly how a panel ends up with three row
 * shapes in it. So the panel says once, here, that its rows are cells and how
 * wide the name column is, and every row reads it back.
 */

import { createContext, useContext } from 'react';

/** What every row inside an {@link OverlayPanel} reads from it. */
export interface OverlayPanelShape {
  /**
   * Width of the name column, in pixels. Settled by the panel rather than by
   * each row, because a column whose width is decided per row is not a column.
   */
  nameWidth: number;
}

/**
 * The panel a control is sitting in, if it is sitting in one.
 *
 * A control rendered on a bar, or on its own, gets `undefined` — which is what
 * leaves every existing caller of {@link OverlayRow} laid out as the line it
 * has always been.
 * @returns The panel, or `undefined` outside one.
 */
export function useOverlayPanelShape(): OverlayPanelShape | undefined {
  return useContext(OverlayPanelContext);
}

/**
 * The shape an {@link OverlayPanel} hands down to the controls inside it.
 *
 * Published for the panel alone. A control reaches it through
 * {@link useOverlayPanelShape}.
 */
export const OverlayPanelContext = createContext<OverlayPanelShape | undefined>(
  undefined,
);
