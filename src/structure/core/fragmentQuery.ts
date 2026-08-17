import { isEmptyIdCode } from './editorValue.ts';
import type { StructureKind } from './readStructure.ts';
import { readStructure } from './readStructure.ts';

/** What a substructure field is currently filtering on. */
export interface FragmentQuery {
  /** The notation the query should be read as. */
  kind: StructureKind;
  /** The query, ready to hand a parser. Empty when nothing is filtered on. */
  value: string;
  /**
   * True when the field filters on nothing — a blank box, or the idCode an
   * erased canvas leaves behind.
   */
  isEmpty: boolean;
}

/**
 * Read what a substructure field holds.
 *
 * A filter is fed from two places that disagree about what "nothing" is: a
 * text box hands back the empty string, while a drawing canvas hands back the
 * idCode of the empty molecule. Both mean the filter is off, and a filter that
 * stays on with nothing drawn quietly hides every result.
 * @param text - The field's value: an idCode, a molfile or a line notation.
 * @returns The notation, the query, and whether anything is being filtered on.
 */
export function fragmentQuery(text: string): FragmentQuery {
  if (isEmptyIdCode(text)) return { kind: 'empty', value: '', isEmpty: true };
  const read = readStructure(text);
  return {
    kind: read.kind,
    value: read.value,
    isEmpty: read.kind === 'empty',
  };
}

/**
 * Whether two field values describe the same query, so a search is not run
 * again for a value that only changed by its surrounding blanks.
 * @param left - One field value.
 * @param right - The other field value.
 * @returns True when both would be read as the same query.
 */
export function sameFragmentQuery(left: string, right: string): boolean {
  const first = fragmentQuery(left);
  const second = fragmentQuery(right);
  if (first.isEmpty || second.isEmpty) return first.isEmpty === second.isEmpty;
  return first.kind === second.kind && first.value === second.value;
}
