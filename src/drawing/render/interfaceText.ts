/**
 * The family's interface text — what `chrome.css` sets every page's words in
 * — measured without a browser, so a layout made in a test, in a worker or
 * for a file is the one the page shows.
 */

import { textWidth } from './metrics.ts';

/**
 * The family's interface font: each platform's system face — SF Pro on
 * macOS, Segoe UI on Windows, Roboto on Android — with Helvetica and Arial
 * after them, as `chrome.css` sets the body.
 */
export const INTERFACE_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * How much wider the interface face sets a text than the Helvetica metrics
 * `textWidth` knows, by what the text is made of. Measured in Chromium on SF
 * Pro at 11, 12 and 13 px (2026-11-20): figures — `60000`, `0.2688`, `65,535`
 * — run 1.11 to 1.15 times as wide set regular (1.17 to 1.24 bold), words —
 * step names, channel names — 1.04 to 1.10 times. One factor for both would
 * either cut names that fit, or let a tick label run into the axis title.
 */
export const INTERFACE_FACE_SLACK = { figures: 1.15, words: 1.08 } as const;

/** What an interface text is made of, which sets how much wider it runs. */
export type InterfaceTextKind = keyof typeof INTERFACE_FACE_SLACK;

/** How an interface text is set. */
export interface InterfaceTextOptions {
  /**
   * Whether it is set in bold.
   * @default false
   */
  bold?: boolean;
  /**
   * What it is made of: figures (a tick label, a value) or words (a name, a
   * sentence).
   * @default 'words'
   */
  kind?: InterfaceTextKind;
}

/**
 * The width a text takes in the family's interface face: Helvetica's metrics,
 * stretched by the slack of its kind ({@link INTERFACE_FACE_SLACK}).
 * @param text - The text.
 * @param size - The font size, CSS pixels.
 * @param options - See {@link InterfaceTextOptions}.
 * @returns Its width, CSS pixels.
 */
export function interfaceTextWidth(
  text: string,
  size: number,
  options: InterfaceTextOptions = {},
): number {
  const { bold = false, kind = 'words' } = options;
  return textWidth(text, size, bold) * INTERFACE_FACE_SLACK[kind];
}
