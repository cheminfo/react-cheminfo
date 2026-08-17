/**
 * Switch one part of the page off, or on again, in the draft the dialog holds.
 *
 * A part is named once however many times it is ticked, and the order the
 * vocabulary gives is restored when the link is written, so two people who
 * ticked the same boxes hand out the same link.
 * @param hidden - The parts the draft switches off.
 * @param part - The part being ticked.
 * @param off - Whether the link should switch it off.
 * @returns The parts the draft switches off after the change.
 */
export function withPart(
  hidden: readonly string[],
  part: string,
  off: boolean,
): readonly string[] {
  const rest = hidden.filter((entry) => entry !== part);
  return off ? [...rest, part] : rest;
}
