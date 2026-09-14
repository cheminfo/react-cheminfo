import { isInteractiveTarget, isTextEntryTarget } from './keyTargets.ts';
import type {
  ListNavigationHandlerOptions,
  ListNavigationKeyEvent,
} from './listNavigation.ts';
import { handleListNavigationKey } from './listNavigation.ts';

/** How a list whose keys are heard on the whole document behaves. */
export interface DocumentListNavigationOptions extends ListNavigationHandlerOptions {
  /**
   * Called with the selected index when `Enter` is pressed, unless the key is
   * aimed at a button, a link or a field that answers it itself.
   * @default undefined — `Enter` is left to the page
   */
  onActivate?: (index: number) => void;
  /**
   * Whether `PageUp`, `PageDown`, `Home` and `End` move the selection too. Off
   * by default: heard on the document, they would stop scrolling the page.
   * @default false
   */
  pageKeys?: boolean;
  /**
   * Whether the list listens at all, e.g. `false` while a dialog is open over
   * it or while another list on the page is the one being read.
   * @default true
   */
  enabled?: boolean;
  /**
   * Leaves a key to whatever it is aimed at, on top of the text fields that
   * are always left alone: a structure editor's canvas, a slider, a menu.
   * @default undefined
   */
  ignoreKey?: (event: DocumentListKeyEvent) => boolean;
}

/** The subset of a document keyboard event the navigation reads. */
export interface DocumentListKeyEvent extends ListNavigationKeyEvent {
  /** True when an earlier handler already acted on the key. */
  defaultPrevented?: boolean;
  /** Whether Alt was held. */
  altKey?: boolean;
  /** Whether Control was held. */
  ctrlKey?: boolean;
  /** Whether Meta (Command) was held. */
  metaKey?: boolean;
  /** Whether Shift was held. */
  shiftKey?: boolean;
}

/**
 * Move a list's selection from a key heard on the whole document.
 *
 * A key already handled, a key pressed with a modifier, and a key aimed at a
 * text field are left to the page. `ArrowUp` and `ArrowDown` move the
 * selection as {@link handleListNavigationKey} does, and `Enter` activates the
 * selected entry when the list asks for it.
 * @param event - The native keyboard event.
 * @param options - See {@link DocumentListNavigationOptions}.
 * @returns Whether the selection moved; an activation does not move it.
 */
export function handleDocumentListKey(
  event: DocumentListKeyEvent,
  options: DocumentListNavigationOptions,
): boolean {
  const { enabled = true, pageKeys = false, onActivate, ignoreKey } = options;
  if (!enabled || event.defaultPrevented === true) return false;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return false;
  }
  if (isTextEntryTarget(event.target)) return false;
  if (ignoreKey?.(event) === true) return false;

  if (event.key === 'Enter') {
    const { selectedIndex, length } = options;
    if (onActivate === undefined || isInteractiveTarget(event.target)) {
      return false;
    }
    if (selectedIndex < 0 || selectedIndex >= length) return false;
    event.preventDefault();
    onActivate(selectedIndex);
    return false;
  }
  if (!pageKeys && event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
    return false;
  }
  return handleListNavigationKey(event, options);
}
