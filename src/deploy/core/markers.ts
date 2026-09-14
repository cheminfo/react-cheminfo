/**
 * Whether a line, or the comment block written directly above it, carries a
 * marker — so a waiver can be explained in as many lines as it needs.
 * @param lines - The file, split into lines.
 * @param index - The line the marker would apply to.
 * @param marker - The marker to look for, lowercased.
 * @returns True when the line or its comment block carries it.
 */
export function carriesMarker(
  lines: readonly string[],
  index: number,
  marker: string,
): boolean {
  if ((lines[index] ?? '').toLowerCase().includes(marker)) return true;
  for (let above = index - 1; above >= 0; above--) {
    const line = lines[above] ?? '';
    if (!/^\s*#/.test(line)) return false;
    if (line.toLowerCase().includes(marker)) return true;
  }
  return false;
}
