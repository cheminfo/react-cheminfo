import { useEffect, useLayoutEffect, useRef } from 'react';

import { isTextEntryTarget } from '../../hooks/ui/keyTargets.ts';
import { slideActionForKey, slideDirectionForKey } from '../core/index.ts';

import type { SlidePositionControls } from './useSlidePosition.ts';

/** What the keys do besides moving. */
export interface SlideshowKeyActions {
  /** Blank the screen to a colour, or bring the slide back. */
  onBlank: (color: 'black' | 'white') => void;
  /** Enter or leave fullscreen. */
  onFullscreen: () => void;
  /** Show or hide the presenter's notes. */
  onNotes: () => void;
}

/**
 * The keys of a presentation, heard on the whole document.
 *
 * The arrows, space and PageUp/PageDown move one step at a time, so a steps
 * slide is walked before the talk moves on; `Home` and `End` jump to the ends.
 * @param position - Where the presentation stands, and the moves.
 * @param total - How many slides the talk holds.
 * @param actions - What the other keys do.
 */
export function useSlideshowKeys(
  position: SlidePositionControls,
  total: number,
  actions: SlideshowKeyActions,
): void {
  // Read when a key is pressed, so a handler written inline costs no
  // re-subscription on every render.
  const actionsRef = useRef(actions);
  useLayoutEffect(() => {
    actionsRef.current = actions;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // A player embedded in a page shares the document with its fields, and
      // space is both "next slide" and a character.
      if (isTextEntryTarget(event.target)) return;
      const direction = slideDirectionForKey(event.key);
      if (direction !== null) {
        event.preventDefault();
        if (direction === 'next') position.next();
        else position.previous();
        return;
      }
      const action = slideActionForKey(event.key, position.current, total);
      if (action === null) return;
      event.preventDefault();
      const { onBlank, onFullscreen, onNotes } = actionsRef.current;
      switch (action.kind) {
        case 'go':
          position.goTo(action.index);
          break;
        case 'blank':
          onBlank(action.color);
          break;
        case 'fullscreen':
          onFullscreen();
          break;
        case 'notes':
          onNotes();
          break;
        default:
          break;
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [position, total]);
}
