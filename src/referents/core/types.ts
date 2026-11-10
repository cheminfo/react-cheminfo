/**
 * What a figure numbers, and how a document refers to it: a compound under a
 * scheme, a member of a series, anything a site labels and a text cites by
 * number.
 *
 * A label holds a key, never a number: the document the figure is placed in
 * decides the numbers, and writes them over the labels it holds.
 */

/** A rectangle in the figure's own units, those of its `viewBox`. */
export interface ReferentBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One member of a series: a compound made with one row of it. */
export interface ReferentMember {
  /** The row of the series it is made with. */
  row: string;
  /**
   * Its structure, as an OpenChemLib ID code, when the row's values read as
   * substituents: a structure drawn in full elsewhere with this ID code is this
   * member.
   * @default undefined — a row whose values are only text
   */
  idCode?: string;
  /**
   * Its structure as SMILES.
   * @default undefined
   */
  smiles?: string;
  /**
   * Its molecular formula.
   * @default undefined
   */
  mf?: string;
  /**
   * Its picture, an SVG document: the generic structure with the row's values
   * in place. Kept as text, so its ids never meet the figure's.
   * @default undefined — shown as the generic structure, cut out of the figure
   */
  preview?: string;
}

/** Something a figure labels, and a document numbers. */
export interface FigureReferent {
  /**
   * What names it, stable for as long as it exists: its labels and the
   * references to it hold this, never its number.
   */
  key: string;
  /**
   * What is numbered. Each kind is counted on its own.
   * @default 'compound'
   */
  kind?: string;
  /**
   * The author's own name for it, offered when it is looked for. Never
   * printed.
   * @default undefined
   */
  name?: string;
  /**
   * Where it is drawn, in the figure's units: what its picture is cut to.
   * @default undefined — the figure says where it is not
   */
  box?: ReferentBox;
  /**
   * Its structure, as an OpenChemLib ID code: two referents with the same one
   * are one compound, whichever figure they are drawn in.
   * @default undefined — not a structure, or not one that can be read
   */
  idCode?: string;
  /**
   * Its structure as SMILES.
   * @default undefined
   */
  smiles?: string;
  /**
   * Its molecular formula.
   * @default undefined
   */
  mf?: string;
  /**
   * The series whose rows make its members, for a generic structure.
   * @default undefined — not a generic structure
   */
  series?: string;
  /**
   * Its members, one per row it is made with. A row of the series it lacks
   * keeps its letter, and is simply not one of its compounds.
   * @default undefined — every row of its series, with nothing more known
   */
  members?: ReferentMember[];
}

/** One row of a series: the values its generic positions take. */
export interface SeriesRow {
  /** Stable, whatever its place: a reference holds this, never its letter. */
  id: string;
  /** The value of each generic position, `{ R1: 'Me' }`, as written. */
  values: Record<string, string>;
}

/**
 * The variable part of a family of compounds: a column per generic position,
 * a row per member. Its rows are lettered in their order, and every compound
 * made from it shares those letters.
 */
export interface ReferentSeries {
  /** What names it. */
  key: string;
  /** The generic positions, `R1`, `R2`, `X`, in the order shown. */
  columns: string[];
  /** The rows, in the order they are lettered. */
  rows: SeriesRow[];
}

/** What a figure numbers. */
export interface FigureReferents {
  /** The referents, in the order their labels are read. */
  referents: FigureReferent[];
  /** The series the figure defines. */
  series: ReferentSeries[];
}

/** A label, or a reference in the text: a referent, or one of its members. */
export interface ReferentMention {
  /** The referent. */
  key: string;
  /**
   * The row of its series, for a member.
   * @default undefined — the referent itself
   */
  row?: string;
}
