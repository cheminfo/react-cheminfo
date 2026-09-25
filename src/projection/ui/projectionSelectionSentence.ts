import { formatInteger } from '../../format/core/numbers.ts';
import { fillCopy } from '../core/fillCopy.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';

/**
 * The sentence reporting what a gesture picked out.
 * @param copy - The words the map writes.
 * @param count - How many samples are selected.
 * @param total - How many there are in all.
 * @returns The sentence.
 */
export function projectionSelectionSentence(
  copy: ProjectionCopy,
  count: number,
  total: number,
): string {
  if (count === 0) return copy.sentence.selectionNone;
  return fillCopy(copy.sentence.selection, {
    count: formatInteger(count),
    total: formatInteger(total),
  });
}
