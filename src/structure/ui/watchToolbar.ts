/**
 * Run something against the editor's toolbar canvas as soon as it exists, and
 * again against each new one the editor builds.
 *
 * The editor is imported lazily and builds itself asynchronously, so the
 * toolbar is almost never there on the first look, and how long it takes is a
 * cold module graph and a network away from anything this code can predict.
 * So its arrival is watched for rather than waited out: a deadline that
 * expires leaves whatever depends on the toolbar missing for the life of the
 * page, with nothing on screen to say why.
 * @param container - The element wrapping the editor.
 * @param onToolbar - Called with each toolbar found; what it returns is called
 * when that toolbar is replaced or the watch ends.
 * @returns A function ending the watch.
 */
export function watchToolbar(
  container: HTMLElement,
  onToolbar: (toolbar: HTMLCanvasElement) => () => void,
): () => void {
  let toolbar: HTMLCanvasElement | null = null;
  let release: (() => void) | null = null;

  const attach = (): void => {
    const found = findToolbar(container);
    if (found === null) return;
    release?.();
    toolbar = found;
    release = onToolbar(found);
  };

  const arrivals = new MutationObserver(() => {
    if (toolbar?.isConnected === true) return;
    attach();
  });
  arrivals.observe(container, { childList: true, subtree: true });
  attach();

  return () => {
    arrivals.disconnect();
    release?.();
  };
}

/**
 * Find the toolbar canvas of the editor.
 *
 * The editor builds itself inside a shadow root and puts the toolbar there as
 * a direct child, the drawing canvas being nested deeper.
 * @param container - The element wrapping the editor.
 * @returns The toolbar canvas, or null while the editor has not drawn one.
 */
function findToolbar(container: HTMLElement): HTMLCanvasElement | null {
  for (const element of container.querySelectorAll('*')) {
    for (const child of element.shadowRoot?.children ?? []) {
      if (child instanceof HTMLCanvasElement) return child;
    }
  }
  return null;
}
