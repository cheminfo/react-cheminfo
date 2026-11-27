/**
 * Reading the repository's own JSON files, which a checker must do without ever
 * throwing: the absence of a file, and a file somebody has broken, are both
 * things to report rather than to crash on.
 */

/**
 * A JSON file the repository may not have, or may have broken.
 * @param text - The file, unparsed.
 * @returns Its object form, or undefined when it is neither.
 */
export function parseJsonObject(
  text: string | undefined,
): Record<string, unknown> | undefined {
  if (text === undefined) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (typeof parsed !== 'object' || parsed === null) return undefined;
  return parsed as Record<string, unknown>;
}

/**
 * A block of a `package.json` as a map of strings, dropping any entry that is
 * not one — the nested form of `overrides` pins something other than the
 * package it is written under.
 * @param value - The block, as parsed.
 * @returns Its string entries.
 */
export function stringEntries(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null) return {};
  const found: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string') found[key] = entry;
  }
  return found;
}

/**
 * Where a report should point, so the reader lands on the line itself.
 * @param text - The file to search, when there is one.
 * @param needle - The literal, or the pattern, to find.
 * @returns Its line, counting from 1, or 0 when it is not there.
 */
export function lineOf(
  text: string | undefined,
  needle: string | RegExp,
): number {
  if (text === undefined) return 0;
  const at =
    typeof needle === 'string'
      ? text.indexOf(needle)
      : (needle.exec(text)?.index ?? -1);
  if (at === -1) return 0;
  return lineAt(text, at);
}

/**
 * The line an offset of a file falls on.
 * @param text - The file.
 * @param offset - Where in it, counting characters from 0.
 * @returns The line, counting from 1.
 */
export function lineAt(text: string, offset: number): number {
  return text.slice(0, offset).split('\n').length;
}
