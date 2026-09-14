/**
 * What the pedagogy components share about how they look: how long a pointer
 * rests before a definition opens, the monospace stack, and the ink prose is
 * set in on each of the two grounds it is shown on.
 */

import { Colors } from '@blueprintjs/core';

import { TOKEN } from '../../tokens/core/familyTokens.ts';

/** Long enough that the pointer can cross a chip or a row without opening it. */
export const HOVER_OPEN_DELAY = 150;

/** The stack every construct, pattern and formula is set in. */
export const MONOSPACE =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** Where prose is drawn: on the dark plate of a tooltip, or on the page. */
export type ProseTone = 'tooltip' | 'page';

/** The colours prose is set in on one ground. */
export interface ProseInk {
  /** The body of a paragraph. */
  text: string;
  /** Notes, labels and provenance: what is read after the rest. */
  muted: string;
  /** Code quoted inside the prose. */
  code: string;
  /** A hairline between two parts, and the plate behind a chip. */
  rule: string;
}

/**
 * The ink of each ground.
 *
 * A Blueprint tooltip is the same dark plate on every site, so its ink is white
 * at decreasing strength, read off the plate rather than off the family tokens,
 * which are written for a light page. The page ink is the tokens.
 */
export const PROSE_INK: Readonly<Record<ProseTone, ProseInk>> = {
  tooltip: {
    text: 'rgb(255 255 255 / 82%)',
    muted: 'rgb(255 255 255 / 62%)',
    code: Colors.BLUE5,
    rule: 'rgb(255 255 255 / 15%)',
  },
  page: {
    text: TOKEN.text,
    muted: TOKEN.textMuted,
    code: TOKEN.text,
    rule: TOKEN.border,
  },
};
