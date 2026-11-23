/**
 * How a copy went, as the notice at the bottom of the window says it:
 * - `copied`: the clipboard holds everything asked for;
 * - `copiedAsText`: it holds the text of a picture it could not take as one —
 *   an SVG in Firefox or Safari, which only Chrome and Edge copy as a picture;
 * - `unsupported`: this browser can put no such thing on the clipboard;
 * - `refused`: it can, and would not this time.
 */
export type CopyOutcome = 'copied' | 'copiedAsText' | 'unsupported' | 'refused';

/**
 * Whether the clipboard holds something after a copy, if not everything.
 * @param outcome - How the copy went.
 * @returns Whether anything was copied.
 */
export function isCopied(outcome: CopyOutcome): boolean {
  return outcome === 'copied' || outcome === 'copiedAsText';
}
