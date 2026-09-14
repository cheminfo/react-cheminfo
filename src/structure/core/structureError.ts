/** What went wrong while reading a structure, and where. */
export interface StructureError {
  /** The reason, as one sentence a chemist can act on. */
  message: string;
  /**
   * Index of the offending character in the input, when the parser named one.
   * @default undefined
   */
  position?: number;
}

/**
 * Turn a parse failure into a readable reason and the position it names.
 *
 * openchemlib is compiled from Java, so a failure arrives as
 * `Class$S19: SmilesParser: dangling ring closure: 1; position:4` — a mangled
 * class name, the name of the parser, the reason, and sometimes the character
 * it stopped on. Only the last two mean anything to someone writing a
 * structure, and the position is what lets a page point at the mistake, so
 * the reason is returned without it and the position beside it.
 * @param error - Whatever the parser threw.
 * @returns The reason, capitalised, and the offending position when one was
 * named.
 */
export function structureError(error: unknown): StructureError {
  const raw = messageOf(error);
  const message = cleanMessage(raw);
  const position = readPosition(raw);
  return position === undefined ? { message } : { message, position };
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '';
}

/** What is said when the parser gave no reason at all. */
const SILENT_FAILURE = 'This structure could not be read.';

function readPosition(raw: string): number | undefined {
  const index = /position\s*:\s*(?<index>\d+)/i.exec(raw)?.groups?.index;
  return index === undefined ? undefined : Number(index);
}

function cleanMessage(raw: string): string {
  const text = raw
    // The generated class name of the exception, which names nothing.
    .replace(/^\w*\$\w+:\s*/, '')
    // The parser that raised it: the page already says what it was reading.
    .replace(/^(?:SmilesParser|MolfileParser|Molfile\w*|IDCodeParser):\s*/, '')
    // The position is returned on its own, so it leaves the sentence together
    // with the words that only lead up to it.
    .replace(/[;,]?\s*(?:at\s+unexpected\s+)?position\s*:\s*\d+\.?\s*$/i, '')
    .trim();
  if (text === '') return SILENT_FAILURE;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
