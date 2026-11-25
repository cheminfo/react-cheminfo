import { fromPortal } from './eventSource.ts';
import { ownsNavigationKeys } from './keyTargets.ts';

/** The default number of entries `PageUp` and `PageDown` move by. */
const DEFAULT_PAGE_STEP = 10;

/** How a list stands when a key reaches it. */
export interface ListNavigationOptions {
  /** Number of entries currently displayed. */
  length: number;
  /** Index of the selected entry, or `-1` when nothing is selected. */
  selectedIndex: number;
  /**
   * How many entries `PageUp` and `PageDown` move by. A value below one, or
   * one that is not a number, falls back to the default.
   * @default 10
   */
  pageStep?: number;
}

/** The subset of a keyboard event list navigation reads. */
export interface ListNavigationKeyEvent {
  /** The key that was pressed. */
  key: string;
  /**
   * What the event was aimed at, used to leave typing and controls that move
   * within themselves alone.
   * @default undefined — no target: the key is the list's
   */
  target?: EventTarget | null;
  /**
   * The list's element, whose handler reads the key: a key reaching it from
   * outside its own nodes — from a menu or a dialog opened inside it, through
   * a React portal — is the menu's.
   * @default undefined — every key is the list's own
   */
  currentTarget?: EventTarget | null;
  /**
   * A control inside the list already acted on the key.
   * @default false
   */
  defaultPrevented?: boolean;
  /** Stops the browser scrolling the page under the list. */
  preventDefault: () => void;
}

/** What {@link handleListNavigationKey} needs on top of the list's shape. */
export interface ListNavigationHandlerOptions extends ListNavigationOptions {
  /** Called with the index the key moved the selection to. */
  onSelect: (index: number) => void;
}

/**
 * The entry a navigation key selects.
 *
 * `ArrowDown` and `ArrowUp` move one step, `PageDown` and `PageUp` move
 * `pageStep`, `Home` and `End` jump to the ends, and every result is clamped
 * into the list. With nothing selected, moving down enters at the top and
 * moving up enters at the bottom.
 * @param key - The `key` of the keyboard event.
 * @param options - See {@link ListNavigationOptions}.
 * @returns The index to select — which may be the current one — or `null` when
 *   the key means nothing to a list.
 */
export function nextSelectedIndex(
  key: string,
  options: ListNavigationOptions,
): number | null {
  const { length, selectedIndex, pageStep } = options;
  if (!Number.isFinite(length) || length <= 0) return null;
  const step =
    typeof pageStep === 'number' && Number.isFinite(pageStep) && pageStep >= 1
      ? Math.floor(pageStep)
      : DEFAULT_PAGE_STEP;
  const current =
    selectedIndex >= 0 && selectedIndex < length ? selectedIndex : -1;

  let target: number;
  switch (key) {
    case 'ArrowDown':
      target = current === -1 ? 0 : current + 1;
      break;
    case 'ArrowUp':
      target = current === -1 ? length - 1 : current - 1;
      break;
    case 'PageDown':
      target = Math.max(current, 0) + step;
      break;
    case 'PageUp':
      target = (current === -1 ? length - 1 : current) - step;
      break;
    case 'Home':
      target = 0;
      break;
    case 'End':
      target = length - 1;
      break;
    default:
      return null;
  }

  return Math.min(length - 1, Math.max(0, target));
}

/**
 * Move a list's selection from a keyboard event.
 *
 * A key a control inside the list already acted on (`defaultPrevented`), one
 * aimed at a control that moves within itself — a text field, a select whose
 * list is open, a slider, a spin button ({@link ownsNavigationKeys}) —, or one
 * reaching the list from a menu or a dialog opened inside it (`fromPortal`) is
 * left alone, so typing a filter, choosing an option, moving a slider or
 * walking a row's menu inside the list never moves the selection. A key the list acts on has its default
 * suppressed even when the selection does not move, so the page never scrolls
 * out from under the last entry.
 * @param event - The keyboard event, synthetic or native.
 * @param options - See {@link ListNavigationHandlerOptions}.
 * @returns Whether the selection moved, i.e. whether `onSelect` was called.
 */
export function handleListNavigationKey(
  event: ListNavigationKeyEvent,
  options: ListNavigationHandlerOptions,
): boolean {
  if (
    event.defaultPrevented === true ||
    ownsNavigationKeys(event.target) ||
    fromPortal({
      target: event.target ?? null,
      currentTarget: event.currentTarget ?? null,
    })
  ) {
    return false;
  }
  const next = nextSelectedIndex(event.key, options);
  if (next === null) return false;
  event.preventDefault();
  if (next === options.selectedIndex) return false;
  options.onSelect(next);
  return true;
}
