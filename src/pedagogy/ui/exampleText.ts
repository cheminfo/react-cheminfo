/**
 * Read one text field of an example whose shape the component does not know.
 *
 * A glossary or a cheatsheet may carry its own example shape — a SMILES, a
 * molecule and an observation — so the default drawing reads `code`, `input`
 * and `note` only when they are strings, and draws nothing for what is absent.
 * @param example - One example, of any shape.
 * @param field - The field to read.
 * @returns The text, or `undefined` when the example has no such string.
 */
export function exampleText(
  example: unknown,
  field: 'code' | 'input' | 'note',
): string | undefined {
  if (typeof example !== 'object' || example === null) return undefined;
  const value = (example as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : undefined;
}
