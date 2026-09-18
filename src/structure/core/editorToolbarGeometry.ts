/**
 * Where the openchemlib editor draws each toolbar button.
 *
 * The toolbar is two columns of seventeen square buttons inside a thin border,
 * numbered down the first column and then down the second, as
 * `EDITOR_TOOLBAR_BUTTONS` lists them. Every length here is in CSS pixels at
 * the size openchemlib draws the toolbar, and is scaled by the height the
 * toolbar is measured at, so a toolbar drawn larger still maps correctly.
 */

/** Buttons in one column of the toolbar. */
export const EDITOR_TOOLBAR_ROWS = 17;

/** Columns of the toolbar. */
export const EDITOR_TOOLBAR_COLUMNS = 2;

/** Side of one button, in CSS pixels. */
const BUTTON_SIZE = 21;

/** Border around the buttons, in CSS pixels. */
const BORDER = 2;

/** Height of the toolbar as openchemlib draws it, in CSS pixels. */
const DRAWN_HEIGHT = EDITOR_TOOLBAR_ROWS * BUTTON_SIZE + 2 * BORDER;

/** Where a button is drawn, in CSS pixels from the toolbar's top left corner. */
export interface EditorToolbarButtonBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The button under a point of the toolbar.
 * @param x - Distance from the toolbar's left edge, in CSS pixels.
 * @param y - Distance from the toolbar's top edge, in CSS pixels.
 * @param toolbarHeight - Height the toolbar is measured at, in CSS pixels.
 * @returns The button's index, or -1 when the point is on no button.
 */
export function editorToolbarButtonAt(
  x: number,
  y: number,
  toolbarHeight: number,
): number {
  const scale = scaleOf(toolbarHeight);
  if (scale === 0) return -1;
  const column = Math.floor((x / scale - BORDER) / BUTTON_SIZE);
  const row = Math.floor((y / scale - BORDER) / BUTTON_SIZE);
  if (column < 0 || column >= EDITOR_TOOLBAR_COLUMNS) return -1;
  if (row < 0 || row >= EDITOR_TOOLBAR_ROWS) return -1;
  return column * EDITOR_TOOLBAR_ROWS + row;
}

/**
 * Where a button is drawn.
 * @param button - The button's index.
 * @param toolbarHeight - Height the toolbar is measured at, in CSS pixels.
 * @returns The button's box, relative to the toolbar.
 */
export function editorToolbarButtonBox(
  button: number,
  toolbarHeight: number,
): EditorToolbarButtonBox {
  const scale = scaleOf(toolbarHeight);
  const column = Math.floor(button / EDITOR_TOOLBAR_ROWS);
  const row = button % EDITOR_TOOLBAR_ROWS;
  return {
    left: (BORDER + column * BUTTON_SIZE) * scale,
    top: (BORDER + row * BUTTON_SIZE) * scale,
    width: BUTTON_SIZE * scale,
    height: BUTTON_SIZE * scale,
  };
}

function scaleOf(toolbarHeight: number): number {
  return Number.isFinite(toolbarHeight) && toolbarHeight > 0
    ? toolbarHeight / DRAWN_HEIGHT
    : 0;
}
