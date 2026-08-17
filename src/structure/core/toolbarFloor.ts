/** The two 1px borders of a container that sizes itself border-box. */
export const TOOLBAR_BORDERS = 2;

/**
 * The smallest height a drawing editor's container may take.
 *
 * The editor's toolbar is a canvas of a fixed height, drawn from a sprite of a
 * fixed number of buttons: a container any shorter than that does not scroll,
 * it simply cuts the last buttons off. So the floor is whichever is taller,
 * the height the caller asked for or the toolbar plus the borders around it.
 * @param toolbarHeight - Height the toolbar was measured at, in pixels.
 * @param minHeight - Smallest height the caller asked for, in pixels.
 * @param borders - Borders the container adds around the toolbar, in pixels.
 * @returns The height to give the container, in pixels.
 */
export function toolbarFloorHeight(
  toolbarHeight: number,
  minHeight: number,
  borders: number = TOOLBAR_BORDERS,
): number {
  const asked = positive(minHeight);
  const measured = positive(toolbarHeight);
  // A toolbar with no layout yet measures zero, and a floor of two pixels of
  // border would collapse the editor before it has had a chance to draw.
  if (measured === 0) return asked;
  return Math.max(asked, measured + positive(borders));
}

function positive(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}
