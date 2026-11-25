/**
 * Whether a help card was asked for by the reader rather than by the page.
 *
 * A browser tells a control the pointer entered it when the control moves
 * under a pointer that is standing still — a panel unfolds, a result pushes a
 * toolbar down — and a help card opened then covers the very result the
 * reader is looking at. So the family's help opens only for a pointer that
 * **moved** since it crossed onto its target, never once the target was
 * pressed after that crossing, and for a focus only when the keyboard gave it
 * (`:focus-visible`): the focus a click gives is not a request for help.
 *
 * No target is identified, by class or by element: any control's tooltip —
 * a Blueprint wrapper, a react-science `Toolbar.Item` or `ActivityBar.Item`,
 * a disabled anchor — hands over the event it opens with, and that event says
 * which crossing it belongs to. Every crossing begins with a `pointerover`,
 * before the `mouseout` and `mouseover` React builds its entering from, in
 * every engine; so each of those native events is stamped, once, with the
 * crossing it belongs to, and the moves and presses are counted on the same
 * clock. What the pointer did is read from the document by passive listeners:
 * nothing is prevented or changed.
 */

/** A help card's opening event, as Blueprint hands it to `onInteraction`. */
export interface HelpCardEvent {
  /** `mouseenter` or `focus`, as React names it. */
  type: string;
  /** What the event happened on. */
  target: EventTarget | null;
  /**
   * The browser's own event under React's.
   * @default undefined — the event is the browser's own
   */
  nativeEvent?: Event;
}

/** The order the pointer's events happened in. */
let clock = 0;
/** When the latest crossing began: the latest `pointerover`. */
let crossing = 0;
/** When the pointer last moved. */
let moved = 0;
/** When the pointer was last pressed. */
let pressed = 0;
/** The moment of each boundary and focus event, by the browser's event. */
const moments = new WeakMap<Event, number>();
const pressListeners = new Set<() => void>();
let listening = false;

/**
 * Whether the help card of a target may open for the event Blueprint opens
 * it with.
 * @param event - The event that asks for it: an entering pointer or a focus.
 * @returns `true` for a pointer that moved since it crossed onto the target
 *   and has not pressed it since, or for a focus the keyboard gave and no
 *   press followed; `false` for a target that moved under a pointer standing
 *   still, a target just pressed, or a focus a click gave.
 */
export function helpCardMayOpen(event: HelpCardEvent | undefined): boolean {
  const native =
    event?.nativeEvent ?? (event instanceof Event ? event : undefined);
  const moment = native === undefined ? undefined : moments.get(native);
  if (event === undefined || moment === undefined || pressed > moment) {
    return false;
  }
  if (event.type === 'focus' || event.type === 'focusin') {
    return event.target instanceof Element && event.target.matches(FOCUS);
  }
  return moved > moment;
}

/**
 * Be told of every press of the pointer: a help card under a press is in the
 * reader's way, so a press closes it.
 * @param listener - Called on each press.
 * @returns What stops the telling.
 */
export function watchPresses(listener: () => void): () => void {
  listen();
  pressListeners.add(listener);
  return () => {
    pressListeners.delete(listener);
  };
}

/** The focus the keyboard gives, as the browser decides it. */
const FOCUS = ':focus-visible';

function listen(): void {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  const options = { capture: true, passive: true } as const;
  document.addEventListener(
    'pointerover',
    () => {
      crossing = ++clock;
    },
    options,
  );
  document.addEventListener('mouseout', stampCrossing, options);
  document.addEventListener('mouseover', stampCrossing, options);
  document.addEventListener(
    'focusin',
    (event) => {
      moments.set(event, ++clock);
    },
    options,
  );
  document.addEventListener(
    'pointermove',
    () => {
      moved = ++clock;
    },
    options,
  );
  document.addEventListener(
    'pointerdown',
    () => {
      pressed = ++clock;
      for (const listener of pressListeners) listener();
    },
    options,
  );
}

/**
 * Stamp a mouse boundary event with the crossing it belongs to: the latest
 * `pointerover`, which every engine sends before it.
 * @param event - The `mouseout` or `mouseover`.
 */
function stampCrossing(event: MouseEvent): void {
  moments.set(event, crossing);
}
