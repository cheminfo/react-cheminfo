/**
 * The colour the 3D view emphasises in, read off the page it sits on.
 *
 * A WebGL colour cannot be a custom property, and the family's accent is the
 * one colour a site owns, so it cannot be written into a shared library either:
 * the view asks the browser what `--accent` resolved to where it is drawn, as
 * the parallel coordinates do, and hands molstar the answer.
 */

import { normalizeColor } from '../../tokens/core/colors.ts';
import { FAMILY_TOKEN_VALUES } from '../../tokens/core/familyTokens.ts';

/**
 * What `--accent` resolved to on an element of the view.
 * @param element - An element of the view, once it is on the page, or `null`
 * before it is.
 * @returns The accent as `#rrggbb`. A site that declares none emphasises in its
 * text colour, and a page that declares neither, or no page yet, in the
 * family's.
 */
export function highlightColorOf(element: Element | null): string {
  return (
    tokenColor(element, '--accent') ??
    tokenColor(element, '--text') ??
    FAMILY_TOKEN_VALUES['--text']
  );
}

function tokenColor(element: Element | null, name: string): string | undefined {
  const resolve = globalThis.getComputedStyle;
  if (element === null || typeof resolve !== 'function') return undefined;
  const color = normalizeColor(resolve(element).getPropertyValue(name));
  return color === null ? undefined : `#${color}`;
}
