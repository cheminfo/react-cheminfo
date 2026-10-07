/**
 * Which parts of an organism's name nomenclature sets in italics.
 *
 * The genus, the species epithet and an infraspecific epithet are italic; the
 * authority, a strain, `sp.`, a cultivar and the words announcing a rank
 * (`subsp.`, `var.`, `f.`) are upright. Names arrive the way their source wrote
 * them — "Catharanthus roseus (L.) G. Don", "Streptomyces sp. CHQ-64",
 * "Isodon Shikokiana Var. Occidentalis" — so this reads them by their shape,
 * and a name it cannot place is left upright rather than guessed at.
 */

import {
  BEFORE_EPITHET,
  CANDIDATUS,
  HYBRID,
  NOT_EPITHET,
  NOT_GENUS,
  RANK_MARKERS,
  UNNAMED,
} from './organismWords.ts';

/** A run of an organism's name, set one way. */
export interface OrganismNamePart {
  /** The text, exactly as the name carries it. */
  text: string;
  /** Whether nomenclature sets it in italics. */
  italic: boolean;
}

interface Piece {
  text: string;
  word: boolean;
  italic: boolean;
}

const CONSORTIUM = /(?<plus>\s+\+\s+)/;
const VIRUS = /\b(?:virus|viruses|phage|bacteriophage|viroid|satellite)\b/i;
const SEPARATOR = /^[\s_]+$/;
const TRAILING_MARK = /^(?<word>.+?)(?<mark>[,;]+)$/;
const GENUS = /^[A-Z][a-z]+$/;
const ABBREVIATED_GENUS = /^[A-Z]\.$/;
// A family, a subfamily or a tribe written where a genus would stand:
// -aceae, -oideae and -eae in botany, -idae in zoology. No genus ends so.
const FAMILY = /(?:eae|idae)$/;
const BRACKETED_GENUS = /^\[(?<genus>[A-Z][a-z]+)\]$/;
const JOINED_MARKER =
  /^(?<marker>subsp\.|ssp\.|var\.|f\.|pv\.)(?<epithet>[a-z][a-z-]+)$/i;
const EPITHET = /^[a-zß-öø-ÿ][a-zß-öø-ÿ-]+$/;
const CAPITALISED_EPITHET = /^[A-Z][a-zß-öø-ÿ-]+$/;
const STARTS_WITH_LETTER = /^\p{L}/u;
const STARTS_UPPERCASE = /^\p{Lu}/u;

/**
 * The runs of an organism's name, each set upright or in italics.
 *
 * Joined together, the runs give back the name exactly. A consortium written
 * `A + B` is read as two names; a virus, and anything that does not open with
 * a genus, is one upright run.
 * @param name - The name, as its source writes it.
 * @returns The runs, consecutive runs never set the same way.
 */
export function splitOrganismName(name: string): OrganismNamePart[] {
  if (name === '') return [];
  if (VIRUS.test(name)) return [{ text: name, italic: false }];
  const pieces: Piece[] = [];
  for (const segment of name.split(CONSORTIUM)) {
    if (CONSORTIUM.test(segment)) {
      pieces.push({ text: segment, word: false, italic: false });
    } else {
      pieces.push(...styledPieces(segment));
    }
  }
  return mergedRuns(pieces);
}

function styledPieces(text: string): Piece[] {
  const pieces = tokenize(text);
  const words = pieces.filter((piece) => piece.word);
  styleWords(words);
  for (let index = 0; index < pieces.length; index++) {
    const piece = pieces[index] as Piece;
    if (piece.word) continue;
    piece.italic =
      pieces[index - 1]?.italic === true && pieces[index + 1]?.italic === true;
  }
  return pieces;
}

function tokenize(text: string): Piece[] {
  const pieces: Piece[] = [];
  for (const chunk of text.split(/(?<gap>[\s_]+)/)) {
    if (chunk === '') continue;
    if (SEPARATOR.test(chunk)) {
      pieces.push({ text: chunk, word: false, italic: false });
      continue;
    }
    // A comma or a semicolon closing a word is punctuation, not part of it.
    const { word: bare = chunk, mark } =
      TRAILING_MARK.exec(chunk)?.groups ?? {};
    const joined = JOINED_MARKER.exec(bare)?.groups;
    const bracketed = BRACKETED_GENUS.exec(bare)?.groups;
    const words =
      joined !== undefined
        ? [joined.marker, joined.epithet]
        : bracketed !== undefined
          ? ['[', bracketed.genus, ']']
          : [bare];
    for (const word of words) {
      pieces.push({ text: word ?? '', word: true, italic: false });
    }
    if (mark !== undefined) {
      pieces.push({ text: mark, word: false, italic: false });
    }
  }
  return pieces;
}

function styleWords(words: Piece[]): void {
  let index = words[0]?.text === '×' ? 1 : 0;
  const first = words[index];
  if (first === undefined) return;
  if (CANDIDATUS.has(first.text)) {
    first.italic = true;
    return;
  }

  let genus: Piece | undefined;
  if (first.text === '[' && words[index + 2]?.text === ']') {
    genus = words[index + 1];
    index += 3;
  } else if (GENUS.test(first.text) || ABBREVIATED_GENUS.test(first.text)) {
    genus = first;
    index += 1;
  }
  if (
    genus === undefined ||
    NOT_GENUS.has(genus.text.toLowerCase()) ||
    FAMILY.test(genus.text)
  ) {
    return;
  }
  genus.italic = true;

  const titleCase = isTitleCase(words);
  const next = words[index]?.text;
  if (next === undefined || UNNAMED.has(next.toLowerCase())) return;
  let announced = false;
  if (HYBRID.has(next) || BEFORE_EPITHET.has(next.toLowerCase())) {
    index += 1;
    announced = true;
  }
  if (isEpithet(words[index], titleCase || announced)) {
    (words[index] as Piece).italic = true;
    index += 1;
    // A zoological trinomial names its subspecies with no word announcing it.
    if (isEpithet(words[index], false)) {
      (words[index] as Piece).italic = true;
      index += 1;
    }
  }

  for (; index < words.length; index++) {
    const word = (words[index] as Piece).text;
    const marks = RANK_MARKERS.has(word.toLowerCase()) || HYBRID.has(word);
    if (marks && isEpithet(words[index + 1], true)) {
      (words[index + 1] as Piece).italic = true;
      index += 1;
    }
  }
}

function isEpithet(word: Piece | undefined, capitalised: boolean): boolean {
  if (word === undefined) return false;
  const lower = word.text.toLowerCase();
  if (
    NOT_EPITHET.has(lower) ||
    UNNAMED.has(lower) ||
    RANK_MARKERS.has(lower) ||
    HYBRID.has(word.text)
  ) {
    return false;
  }
  return (
    EPITHET.test(word.text) ||
    (capitalised && CAPITALISED_EPITHET.test(word.text))
  );
}

// A source that capitalises every word ("Agave Americana") still means a
// binomial; the words announcing a rank are left out of the count.
function isTitleCase(words: readonly Piece[]): boolean {
  let lettered = 0;
  for (const { text } of words) {
    const lower = text.toLowerCase();
    if (RANK_MARKERS.has(lower) || UNNAMED.has(lower) || HYBRID.has(text)) {
      continue;
    }
    if (!STARTS_WITH_LETTER.test(text)) continue;
    if (!STARTS_UPPERCASE.test(text)) return false;
    lettered += 1;
  }
  return lettered >= 2;
}

function mergedRuns(pieces: readonly Piece[]): OrganismNamePart[] {
  const runs: OrganismNamePart[] = [];
  for (const piece of pieces) {
    if (piece.text === '') continue;
    const last = runs.at(-1);
    if (last?.italic === piece.italic) {
      last.text += piece.text;
    } else {
      runs.push({ text: piece.text, italic: piece.italic });
    }
  }
  return runs;
}
