import type * as Embed from 'cheminfo-mcp-server/embed';
import type { RefObject } from 'react';
import { useEffect } from 'react';

import { loadEmbed, loadedEmbed } from './embed.ts';
import { holdRoomForPanels } from './holdRoomForPanels.ts';

/**
 * Fit the frame a chat shows a card in to the card: report the card's height
 * to the view framing it, now and on every change, so nothing scrolls twice,
 * and grow the card while a panel it opened is open, so the frame holds the
 * panel too. A card opened on its own is the page: there is no frame to tell
 * and none to grow, and nothing is done.
 *
 * Its shape is a React 19 ref callback's — `ref={fitCardToFrame}` — so it
 * starts once the card is mounted and stops when it is removed. The first
 * card waits for `cheminfo-mcp-server/embed` to load; a site without it gets
 * a card that never reports.
 * @param card - The element holding the whole card; none reports nothing.
 * @returns A function that stops both, or undefined when nothing started.
 */
export function fitCardToFrame(
  card: HTMLElement | null,
): (() => void) | undefined {
  if (card === null) return undefined;
  const embed = loadedEmbed();
  if (embed !== undefined) return fitLoaded(embed, card);
  let stop: (() => void) | undefined;
  let stopped = false;
  loadEmbed().then(
    (module) => {
      if (!stopped) stop = fitLoaded(module, card);
    },
    () => undefined,
  );
  return () => {
    stopped = true;
    stop?.();
  };
}

/**
 * {@link fitCardToFrame} for a card held in a ref, from its first render to
 * its last.
 * @param card - The ref of the element holding the whole card.
 */
export function useFitCardToFrame(card: RefObject<HTMLElement | null>): void {
  useEffect(() => fitCardToFrame(card.current), [card]);
}

/**
 * Keep a card at least as tall as the dialogs and popovers opened over it,
 * framed or not: {@link holdRoomForPanels} for a card held in a ref. A card
 * whose height is reported elsewhere uses this; one that only needs its frame
 * fitted uses {@link useFitCardToFrame}, which does both.
 * @param card - The ref of the element holding the whole card.
 */
export function useOverlayRoom(card: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = card.current;
    return element === null ? undefined : holdRoomForPanels(element);
  }, [card]);
}

function fitLoaded(
  embed: typeof Embed,
  card: HTMLElement,
): (() => void) | undefined {
  if (!embed.isFramed()) return undefined;
  const stopRoom = holdRoomForPanels(card);
  const stopReport = embed.reportEmbedHeight(card);
  return () => {
    stopReport();
    stopRoom();
  };
}
