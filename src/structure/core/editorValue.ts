import { looksLikeMolfile } from './molfile.ts';

/** One structure of an editor's value, with whatever was written next to it. */
export interface EditorLine {
  /**
   * The structure. On a line-oriented value this is the first blank-separated
   * token, because a line notation never holds a blank; on a molfile it is the
   * whole file.
   */
  structure: string;
  /**
   * What followed the structure on its line, which a Daylight `.smi` file uses
   * as a name. Empty when nothing did.
   */
  label: string;
  /** 1-based line the structure starts on, so an error can point back at it. */
  line: number;
}

/** An editor's value, classified and cut into the structures it holds. */
export interface EditorValue {
  /** How the value is written; `empty` when it holds no structure at all. */
  kind: 'molfile' | 'smiles' | 'empty';
  /**
   * The molfile, exactly as it arrived, when `kind` is `molfile`. Empty
   * otherwise — a molfile's fixed-width header does not survive being trimmed.
   */
  molfile: string;
  /**
   * Every structure the value holds, in order: one per meaningful line for a
   * line-oriented value, a single entry for a molfile, none for an empty one.
   */
  entries: EditorLine[];
}

/**
 * Take an editor's value apart.
 *
 * A structure box is handed whatever the chemist had: one molfile pasted out
 * of another tool, or a run of line notations one per line, possibly with a
 * name after each and with blank and `#` comment lines in between. Both are
 * read here so a page can take either without asking which it was given.
 * @param text - The editor's value, as typed, pasted or dropped.
 * @returns The notation, the molfile when it is one, and the structures.
 */
export function splitEditorValue(text: string): EditorValue {
  if (text.trim() === '') return { kind: 'empty', molfile: '', entries: [] };
  if (looksLikeMolfile(text)) {
    return {
      kind: 'molfile',
      molfile: text,
      entries: [{ structure: text, label: '', line: 1 }],
    };
  }
  const entries = splitLines(text);
  return entries.length === 0
    ? { kind: 'empty', molfile: '', entries: [] }
    : { kind: 'smiles', molfile: '', entries };
}

/** An idCode and, when the writer emitted one, the atom layout beside it. */
export interface IdCodeValue {
  idCode: string;
  /** Absent when the value carried no coordinates. */
  coordinates?: string;
}

/**
 * Take an idCode apart.
 *
 * A drawing editor appends the atom coordinates after a space, which
 * `Molecule.fromIDCode` takes as a second argument rather than as part of the
 * first, and which two drawings of the same structure differ by.
 * @param value - The editor value, coordinates included or not.
 * @returns The idCode and the coordinates, the idCode empty for a blank value.
 */
export function splitIdCode(value: string): IdCodeValue {
  const [idCode = '', coordinates] = value.trim().split(' ');
  return coordinates === undefined ? { idCode } : { idCode, coordinates };
}

/**
 * Whether an idCode describes nothing.
 *
 * Erasing a canvas does not leave the editor with an empty string: it leaves
 * the idCode of the empty molecule, or of the empty fragment in query mode.
 * Treating either as a structure keeps a filter alive with nothing drawn.
 * @param value - The editor value, coordinates included or not.
 * @returns True when there is nothing on the canvas.
 */
export function isEmptyIdCode(value: string): boolean {
  return EMPTY_ID_CODES.has(splitIdCode(value).idCode);
}

/** What openchemlib writes for a structure with no atoms: molecule, fragment. */
const EMPTY_ID_CODES = new Set(['', 'd@', 'dH']);

function splitLines(text: string): EditorLine[] {
  const entries: EditorLine[] = [];
  const lines = text.split('\n');
  for (let index = 0; index < lines.length; index++) {
    const line = (lines[index] ?? '').trim();
    if (line === '' || line.startsWith('#')) continue;
    const blank = line.search(/\s/);
    entries.push(
      blank === -1
        ? { structure: line, label: '', line: index + 1 }
        : {
            structure: line.slice(0, blank),
            label: line.slice(blank).trim(),
            line: index + 1,
          },
    );
  }
  return entries;
}
