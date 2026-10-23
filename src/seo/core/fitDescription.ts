import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  DESCRIPTION_TARGET,
} from './limits.ts';
import { plainDescription, plainProse } from './plainDescription.ts';

/** The window {@link fitDescription} grows a description into. */
export interface FitDescriptionOptions {
  /**
   * The length growing stops at: a description past it keeps what it has.
   * @default 132
   */
  target?: number;
  /**
   * The shortest description whole sentences of the base may stop at.
   * @default 110
   */
  minLength?: number;
  /**
   * The longest description, a clause included: one that would run past it is
   * not added.
   * @default 160
   */
  maxLength?: number;
}

/**
 * The sentence a page is indexed under, cut from its own prose and grown, when
 * that prose is short, with what kind of page it is.
 *
 * The base is fitted first, as `plainDescription` fits it — markup resolved,
 * whole sentences kept, a dot inside `C(=O)O` ending none. Each entry of
 * `extras` is then one choice, written longest first: at most one of its
 * clauses is added, the first that still fits, and growing stops once the text
 * reaches `target`. So a page whose own prose fills a result keeps it, and only
 * a short one is told it is "exercise 3 of 12".
 *
 * Nothing is refused here: a description still outside the window is what
 * `routeProblems` reports, in the test every site asserts empty.
 * @param base - The page's own prose, markup and all.
 * @param extras - Clauses to grow it with, most worth reading first, each
 * entry its alternatives from longest to shortest.
 * @param options - The window the description is grown into.
 * @returns The description.
 */
export function fitDescription(
  base: string,
  extras: ReadonlyArray<readonly string[]> = [],
  options: FitDescriptionOptions = {},
): string {
  const {
    target = DESCRIPTION_TARGET,
    minLength = DESCRIPTION_MIN,
    maxLength = DESCRIPTION_MAX,
  } = options;
  let text = plainDescription(base, { minLength, maxLength });
  // Prose already cut mid-sentence is not grown: a clause after an ellipsis
  // reads as two snippets.
  if (text.endsWith('…')) return text;
  for (const choice of extras) {
    if (text.length >= target) break;
    for (const clause of choice) {
      const words = plainProse(clause);
      if (words === '') continue;
      const grown = text === '' ? words : `${text} ${words}`;
      if (grown.length <= maxLength) {
        text = grown;
        break;
      }
    }
  }
  return text;
}
