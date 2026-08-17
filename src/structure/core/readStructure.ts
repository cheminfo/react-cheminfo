import { looksLikeMolfile } from './molfile.ts';

/** How a piece of structure text turned out to be written. */
export type StructureKind = 'molfile' | 'smiles' | 'smarts' | 'empty';

/** A piece of structure text, and the notation it should be read as. */
export interface ReadStructureResult {
  kind: StructureKind;
  /**
   * The text to hand a parser. A line notation is trimmed; a molfile is left
   * exactly as it arrived, because its first three lines are a fixed-width
   * header whose title line is very often blank — trimming shifts every line
   * up and the counts line is then read as an atom.
   */
  value: string;
}

/**
 * Decide what a piece of text is, without parsing it.
 *
 * Nothing is asked of the user, because the answer is in the text: a molfile
 * carries a version stamp and several lines, a query carries syntax that only
 * exists in SMARTS, and whatever is left is a SMILES. Text that holds nothing
 * is the third answer, so a field can tell "not typed yet" from "typed
 * something wrong" and only complain about the second.
 * @param text - The structure, as typed, pasted or dropped.
 * @returns The notation and the text to read it with.
 */
export function readStructure(text: string): ReadStructureResult {
  const trimmed = text.trim();
  if (trimmed === '') return { kind: 'empty', value: '' };
  if (looksLikeMolfile(text)) return { kind: 'molfile', value: text };
  if (looksLikeSmarts(trimmed)) return { kind: 'smarts', value: trimmed };
  return { kind: 'smiles', value: trimmed };
}

/**
 * Whether a line notation uses syntax that exists in SMARTS and not in SMILES.
 *
 * Only the inside of a bracket atom is inspected for the primitives, because
 * `#` is a triple bond outside one and `D`, `X`, `R`, `v` and `h` are the
 * start of real element symbols. `~`, `&`, `,`, `;`, `!` and `$(` are SMARTS
 * anywhere they appear.
 * @param text - The line notation, already trimmed.
 * @returns True when it can only be a query.
 */
export function looksLikeSmarts(text: string): boolean {
  if (/[~&;,!]/.test(text) || text.includes('$(')) return true;
  for (const match of text.matchAll(BRACKET_ATOM)) {
    if (QUERY_PRIMITIVE.test(match.groups?.atom ?? '')) return true;
  }
  return BARE_WILDCARD.test(text.replaceAll(BRACKET_ATOM, ''));
}

const BRACKET_ATOM = /\[(?<atom>[^\]]*)\]/g;

/**
 * `#6` (atomic number), `X3` / `D2` / `R1` / `r5` / `v4` / `h1` / `x2`
 * (counts), and the `a` / `A` wildcards. A digit is required after the letter,
 * so `[Xe]` and `[Rn]` stay elements. The wildcard is anchored to the start of
 * the atom, after an optional isotope: unanchored it matches the `a` of
 * `[Na+]`, and every bracketed element holding a lowercase a — Na, Ca, Ba, La,
 * Ta — would then read as a query rather than as the atom it is.
 */
const QUERY_PRIMITIVE = /#\d|[DXRrvhx]\d|^\*|^\d*[aA](?![a-z])/;

/**
 * Outside a bracket the wildcard has to stand on its own: a letter on either
 * side and it is part of a word, not a pattern. Widening this to any `a` or
 * `A` reads the header `CAS` as the three-atom SMARTS `C`,`A`,`S`, and a
 * spreadsheet's header row stops being recognised as one.
 */
const BARE_WILDCARD = /(?:^|[^A-Za-z])[aA](?![a-z])/;
