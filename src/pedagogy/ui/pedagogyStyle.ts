/**
 * What the pedagogy components share about how they look: how long a pointer
 * rests before a definition opens, the monospace stack, and the ink prose is
 * set in.
 */

import { TOKEN } from '../../tokens/core/familyTokens.ts';

/** Long enough that the pointer can cross a chip or a row without opening it. */
export const HOVER_OPEN_DELAY = 150;

/** The stack every construct, pattern and formula is set in. */
export const MONOSPACE =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** The colours prose is set in. */
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
 * The one ink, because there is one ground.
 *
 * A definition, a documented construct and a help card are the same job, and
 * the family answers it with one card: `help-tooltip` in `chrome.css`, light,
 * on a border and a shadow. So the prose here is the family's tokens wherever
 * it is read — on a page, or on that card.
 */
export const PROSE_INK: ProseInk = {
  text: TOKEN.text,
  muted: TOKEN.textMuted,
  code: TOKEN.text,
  rule: TOKEN.border,
};
