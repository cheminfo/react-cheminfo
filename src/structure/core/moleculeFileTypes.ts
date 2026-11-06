/** The most molecules one file holds. */
export const MOLECULE_FILE_LIMIT = 10_000;

/**
 * What a list of molecules is saved as: an SDF, or a tab-separated text file
 * carrying a SMILES.
 */
export type MoleculeFileFormat = 'sdf' | 'txt';

/** One molecule of a file. */
export interface MoleculeFileRow {
  /** The structure, which both formats are written from. */
  idCode: string;
  /**
   * What the molecule is called, written as the molfile's title too. Null is
   * a molecule with no name among others that have one.
   * @default undefined — the file has no column for a name
   */
  name?: string | null;
  /**
   * The other values, in the order they are written: one SDF field or one
   * column each. Null is an empty cell and writes no field; undefined asks for
   * no column, so a value only some searches have stays out of the others.
   * @default {}
   */
  fields?: Readonly<Record<string, string | number | null | undefined>>;
}

/** How a file is written. */
export interface MoleculeFileOptions {
  /** What the molecules are written as. */
  format: MoleculeFileFormat;
  /**
   * The most molecules the file holds; reading stops there.
   * @default MOLECULE_FILE_LIMIT
   */
  limit?: number;
  /**
   * How many molecules are expected, for the progress.
   * @default limit
   */
  total?: number;
  /**
   * Stops the writing; the promise then rejects with the abort's reason.
   * @default undefined — it runs to its end
   */
  signal?: AbortSignal;
  /**
   * Told of the molecules written so far, whenever the page gets a turn.
   * @default undefined — nobody is told
   */
  onProgress?: (done: number, total: number) => void;
}

/** A file ready to be saved. */
export interface MoleculeFile {
  /** Its bytes, typed for its format. */
  blob: Blob;
  /** How many molecules it holds. */
  rows: number;
  /** How many could not be read from their idCode, and were left out. */
  skipped: number;
}
