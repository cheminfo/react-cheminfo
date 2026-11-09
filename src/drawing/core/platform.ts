/**
 * The shortcut modifier of the platform the page runs on: ⌘ on a Mac, Ctrl
 * everywhere else — both what a tooltip shows and what a key handler answers,
 * so a Mac never takes Ctrl for ⌘.
 */

/** Whether the page runs on a Mac, an iPad or an iPhone. */
export const IS_MAC = isApplePlatform(
  typeof navigator === 'undefined' ? '' : navigator.userAgent,
);

/** How the shortcut modifier is written on a key cap. */
export const MOD_KEY = IS_MAC ? '⌘' : 'Ctrl';

/** How the Alt key is written on a key cap. */
export const ALT_KEY = IS_MAC ? '⌥' : 'Alt';

/**
 * Whether the page may fill the screen: a frame without `allowfullscreen`, or
 * a phone browser, may not.
 */
export const CAN_FILL_SCREEN =
  typeof document !== 'undefined' && document.fullscreenEnabled;

/**
 * Whether a user agent names an Apple platform. An iPad asks for the desktop
 * site as a Mac, which is what its keyboard carries anyway.
 * @param userAgent - The `navigator.userAgent` string.
 * @returns True on macOS, iPadOS and iOS.
 */
export function isApplePlatform(userAgent: string): boolean {
  return /Mac|iPhone|iPad|iPod/.test(userAgent);
}

/**
 * Whether a key event holds the platform's shortcut modifier.
 * @param event - The key event.
 * @param isMac - Whether to read it as a Mac does.
 * @returns ⌘ on a Mac, Ctrl elsewhere.
 */
export function hasModifier(
  event: Pick<KeyboardEvent, 'ctrlKey' | 'metaKey'>,
  isMac = IS_MAC,
): boolean {
  return isMac ? event.metaKey : event.ctrlKey;
}

/**
 * A shortcut written on one line: `⇧⌘Z` on a Mac, `Ctrl+⇧+Z` elsewhere.
 * @param keys - The key caps, in order.
 * @param isMac - Whether to write it as a Mac does.
 * @returns The text.
 */
export function shortcutText(keys: readonly string[], isMac = IS_MAC): string {
  return keys.join(isMac ? '' : '+');
}
