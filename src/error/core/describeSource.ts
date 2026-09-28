/**
 * Name the source of a failed read.
 *
 * A reader is met by a user exactly once — when it fails — so what it says
 * then is the whole of its interface, and saying it in one voice across a site
 * matters more than in most code.
 *
 * A message that opens with the file's own name tells whoever dropped eleven
 * files which of them is the problem; one that opens with `The pasted text`
 * tells them the message is about the box they just typed into.
 * @param fileName - The file's name, absent for a paste.
 * @returns A subject a sentence can start with.
 * @example
 * `${describeSource(fileName)} holds no readable peak list.`
 */
export function describeSource(fileName?: string): string {
  return fileName === undefined ? 'The pasted text' : fileName;
}
