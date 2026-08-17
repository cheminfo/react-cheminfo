import type { IconName } from '@blueprintjs/core';
import type { MouseEvent, ReactNode } from 'react';

/**
 * One entry of a site's chrome: a page in the bar, a utility beside it, or a
 * line of a header menu. It is a plain description, so the same array feeds the
 * bar, the menu it overflows into, and a site's own renderer.
 */
export interface NavItem {
  /** What tells this entry apart, and what the active entry is named by. */
  id: string;
  /** What the entry reads. */
  label: ReactNode;
  /**
   * The address the entry opens. Writing it keeps the entry a real link, so a
   * crawler walks the site and a middle click opens a tab of its own, even when
   * the plain click is taken over by `onSelect`.
   * @default undefined
   */
  href?: string;
  /**
   * Glyph before the label, drawn at 14 px.
   * @default undefined
   */
  icon?: IconName;
  /**
   * What the pointer is told, and what names the entry to a screen reader when
   * the label is not text.
   * @default undefined
   */
  title?: string;
  /**
   * Whether the address leaves the site, in which case it opens in a tab of its
   * own.
   * @default false
   */
  external?: boolean;
  /**
   * What the site does when the entry is picked. An entry that also carries an
   * `href` takes over the plain click only — a modified one is left to the
   * browser.
   * @default undefined
   */
  onSelect?: () => void;
  /**
   * What follows the label: a count, a tag, anything the entry reports.
   * @default undefined
   */
  after?: ReactNode;
}

/**
 * Whether a click asked the browser for something other than following the link
 * in place — a tab of its own, a window, a download.
 * @param event - The click on the entry.
 * @returns True when the browser is to be left alone.
 */
export function isModifiedClick(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}
