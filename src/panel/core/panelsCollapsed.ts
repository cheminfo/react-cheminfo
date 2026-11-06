/**
 * Whether the window has room to keep an editor's panels beside its figure.
 *
 * It is the window that is asked rather than the row, because what is decided
 * here is decided before anything is laid out: a link naming a panel is read at
 * load, and a panel built beside the figure only to be taken away a frame later
 * would have loaded its frame for nothing. A framed page is asked about its own
 * frame, which is the window it has.
 */

/**
 * The narrowest window that keeps the panels beside the figure, in pixels: under
 * it the two tool columns leave a row of about 830, and a share of that holds
 * neither a drawing nor a form.
 */
export const COLLAPSE_PANELS_BELOW = 900;

const NARROW_QUERY = `(width < ${COLLAPSE_PANELS_BELOW}px)`;

/**
 * Whether the panels are collapsed, on a window this narrow. `false` where
 * `matchMedia` is missing, which keeps tests and rendering to a string working.
 * @returns Whether the figure keeps the row.
 */
export function readPanelsCollapsed(): boolean {
  if (typeof globalThis.matchMedia !== 'function') return false;
  return globalThis.matchMedia(NARROW_QUERY).matches;
}

/**
 * Hear the window cross that width. A page being printed is laid out at the
 * width of its paper, which says nothing about the window it goes back to, so
 * printing does not count: the panels would be rebuilt, and their frames
 * reloaded, on every print.
 * @param listener - Called with whether the panels are now collapsed.
 * @returns What stops listening.
 */
export function watchPanelsCollapsed(
  listener: (collapsed: boolean) => void,
): () => void {
  if (typeof globalThis.matchMedia !== 'function') return doNothing;
  const narrow = globalThis.matchMedia(NARROW_QUERY);
  const printing = globalThis.matchMedia('print');
  function onChange(): void {
    if (!printing.matches) listener(narrow.matches);
  }
  narrow.addEventListener('change', onChange);
  return () => {
    narrow.removeEventListener('change', onChange);
  };
}

function doNothing(): void {
  // There was nothing to stop listening to.
}
