import { roomForPanels } from '../core/panelRoom.ts';

import { anchorBottom, openPanels } from './openPanels.ts';

/**
 * Keep a card as tall as the dialogs and popovers open over it need, until
 * the returned function is called; the card gives the height back as each
 * closes. A chat frames a card exactly as tall as the card reports, so a
 * panel taller than the card would otherwise be cut at the frame's edge.
 *
 * The room is measured once per animation frame, whenever the document
 * changes — a panel opening, closing or moving changes the tree or a class —
 * and whenever an open panel changes size, which one whose content arrives
 * after it opens does without touching the tree. A card whose view fills the
 * screen holds no room: its frame is not what is on screen then.
 * @param card - The element whose height the frame follows.
 * @returns A function that stops watching and gives the card its height back.
 */
export function holdRoomForPanels(card: HTMLElement): () => void {
  let frame = 0;
  const watched = new Set<Element>();
  const sizes =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(schedule);
  const mutations = new MutationObserver(schedule);

  function measure(): void {
    frame = 0;
    const panels = openPanels(card);
    if (sizes !== undefined) watchSizes(sizes, watched, panels.elements);
    const room = document.fullscreenElement
      ? 0
      : roomForPanels(panels.found, anchorBottom(card));
    const minHeight = room > 0 ? `${room}px` : '';
    if (card.style.minHeight !== minHeight) card.style.minHeight = minHeight;
  }

  function schedule(): void {
    if (frame === 0) frame = requestAnimationFrame(measure);
  }

  mutations.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
  document.addEventListener('fullscreenchange', schedule);
  schedule();
  return () => {
    mutations.disconnect();
    sizes?.disconnect();
    document.removeEventListener('fullscreenchange', schedule);
    cancelAnimationFrame(frame);
    card.style.minHeight = '';
  };
}

/**
 * Watch the size of the panels on screen, and of no other element.
 * @param sizes - The observer.
 * @param watched - The elements it watches, kept up to date.
 * @param panels - The panels open now.
 */
function watchSizes(
  sizes: ResizeObserver,
  watched: Set<Element>,
  panels: readonly Element[],
): void {
  for (const element of watched) {
    if (!panels.includes(element)) {
      sizes.unobserve(element);
      watched.delete(element);
    }
  }
  for (const element of panels) {
    if (!watched.has(element)) {
      sizes.observe(element);
      watched.add(element);
    }
  }
}
