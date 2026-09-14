import { isInteractiveTarget, isTextEntryTarget } from './keyTargets.ts';

/** The subset of a keyboard event {@link onActivateKey} reads. */
export interface ActivationKeyEvent {
  /** The key that was pressed. */
  key: string;
  /** What the event was aimed at. */
  target?: EventTarget | null;
  /** The element the handler is attached to. */
  currentTarget?: EventTarget | null;
  /** True while a held key auto-repeats. */
  repeat?: boolean;
  /** Stops the space bar from scrolling the page. */
  preventDefault: () => void;
}

/**
 * Whether a key is the keyboard equivalent of a click: `Enter` or the space
 * bar, which is what a `<button>` answers to.
 * @param event - The keyboard event, or anything carrying its `key`.
 * @returns True for `Enter` and the space bar.
 */
export function isActivationKey(
  event: Pick<ActivationKeyEvent, 'key'>,
): boolean {
  return event.key === 'Enter' || event.key === ' ';
}

/**
 * A `keydown` handler that gives an element which is not a `<button>` — a
 * clickable row, a card, a drop zone with `role="button"` — the activation a
 * button gets for free.
 *
 * `Enter` and the space bar call `activate`, with the default suppressed so the
 * space bar does not also scroll the page. A key typed into a field inside the
 * element, a key aimed at a button or a link nested in it, and the repeats of a
 * held key are all left alone, so nothing is activated twice.
 * @param activate - What a click on the element does; it receives the event.
 * @returns The handler, to pass as `onKeyDown`.
 */
export function onActivateKey<TEvent extends ActivationKeyEvent>(
  activate: (event: TEvent) => void,
): (event: TEvent) => void {
  return (event) => {
    if (!isActivationKey(event) || event.repeat === true) return;
    const { target, currentTarget } = event;
    if (isTextEntryTarget(target)) return;
    if (
      target !== currentTarget &&
      currentTarget !== undefined &&
      isInteractiveTarget(target)
    ) {
      return;
    }
    event.preventDefault();
    activate(event);
  };
}
