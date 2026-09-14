import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

/** Fullscreen owned by the site rather than by the player. */
export interface SlideshowFullscreen {
  /** Whether the site is presenting. */
  isFullscreen: boolean;
  /** Called when `f` or the bar's button asks to change that. */
  onToggle: () => void;
}

/** Whether the player is presenting, and how its key and button change that. */
interface SlideshowFullscreenState {
  /** Whether the talk fills the screen. */
  isFullscreen: boolean;
  /** Enter or leave fullscreen. */
  toggle: () => void;
}

/**
 * The fullscreen a slideshow's `f` key and bar button drive: the site's own
 * when it passes one, otherwise the player element itself, followed through
 * the document's `fullscreenchange` so leaving with Escape is seen too.
 * @param playerRef - The element fullscreened when the site owns no fullscreen.
 * @param owned - The site's fullscreen, when the site owns it.
 * @returns Whether the talk fills the screen, and the toggle.
 */
export function useSlideshowFullscreen(
  playerRef: RefObject<HTMLElement | null>,
  owned: SlideshowFullscreen | undefined,
): SlideshowFullscreenState {
  const [isOwnFullscreen, setIsOwnFullscreen] = useState(false);
  const followsPlayer = owned === undefined;

  const toggleOwn = useCallback(() => {
    const element = playerRef.current;
    if (element === null) return;
    if (document.fullscreenElement === element) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void element.requestFullscreen().catch(() => undefined);
    }
  }, [playerRef]);

  useEffect(() => {
    if (!followsPlayer) return;
    function onFullscreenChange(): void {
      setIsOwnFullscreen(document.fullscreenElement === playerRef.current);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [followsPlayer, playerRef]);

  return owned === undefined
    ? { isFullscreen: isOwnFullscreen, toggle: toggleOwn }
    : { isFullscreen: owned.isFullscreen, toggle: owned.onToggle };
}
