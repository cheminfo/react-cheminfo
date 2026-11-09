/**
 * What a key does during a presentation, decided without a DOM.
 *
 * The current slide lives in the address, so it arrives as whatever a link
 * carried — a missing number, a negative one, one past the end of a talk that
 * has since been shortened. Every move is therefore clamped here rather than
 * trusted, and the player only ever renders a slide that exists.
 */

/**
 * The slide a requested index resolves to.
 * @param index - The index asked for, from a link or a keystroke.
 * @param total - How many slides the talk holds.
 * @returns A zero-based index that exists, or `0` for a talk with no slides.
 */
export function clampSlideIndex(index: number, total: number): number {
  if (!Number.isFinite(total) || total < 1) return 0;
  if (Number.isNaN(index) || index < 0) return 0;
  const last = total - 1;
  return index > last ? last : Math.trunc(index);
}

/** What a key press asks the player to do. */
export type SlideAction =
  | { kind: 'go'; index: number }
  | { kind: 'blank'; color: 'black' | 'white' }
  | { kind: 'fullscreen' }
  | { kind: 'notes' }
  | null;

/** Which way a key moves through the talk, one step at a time. */
export type SlideDirection = 'next' | 'previous';

/**
 * Which way a key steps: forward or back by one, as a presenter's remote
 * does. A slide walked through step by step takes these one step at a time,
 * while `Home` and `End` still jump to the ends of the talk.
 * @param key - The `key` of the keyboard event.
 * @returns The direction, or `null` for a key that does not step.
 */
export function slideDirectionForKey(key: string): SlideDirection | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      return 'next';
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      return 'previous';
    default:
      return null;
  }
}

/**
 * The action a key press means, with every move already clamped: stepping past
 * the last slide, or back from the first, stays on the slide it is on rather
 * than leaving the talk.
 * @param key - The `key` of the keyboard event.
 * @param index - Which slide is showing.
 * @param total - How many slides the talk holds.
 * @returns The action, or `null` when the key means nothing here.
 */
export function slideActionForKey(
  key: string,
  index: number,
  total: number,
): SlideAction {
  const direction = slideDirectionForKey(key);
  if (direction !== null) {
    const step = direction === 'next' ? 1 : -1;
    return { kind: 'go', index: clampSlideIndex(index + step, total) };
  }
  switch (key) {
    case 'Home':
      return { kind: 'go', index: 0 };
    case 'End':
      return { kind: 'go', index: clampSlideIndex(total - 1, total) };
    default:
      return letterAction(key);
  }
}

function letterAction(key: string): SlideAction {
  switch (key.toLowerCase()) {
    case 'f':
      return { kind: 'fullscreen' };
    case 'b':
      return { kind: 'blank', color: 'black' };
    case 'w':
      return { kind: 'blank', color: 'white' };
    case 'n':
      return { kind: 'notes' };
    default:
      return null;
  }
}
