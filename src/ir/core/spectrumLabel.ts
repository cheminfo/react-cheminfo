/**
 * How a spectrum read from a file is named: its own title with the file's
 * name beside it, or the file's name alone, numbered when the file holds
 * several — a WDF map, a multi-block SPC.
 * @param fileName - The file it was read from.
 * @param title - The title the file gives it, if any.
 * @param index - Its position in the file, from 0.
 * @param count - How many spectra the file holds.
 * @returns The name, e.g. `Adamantane (adamantan)` or `map (6x6) #3`.
 */
export function spectrumLabel(
  fileName: string,
  title: string | undefined,
  index: number,
  count: number,
): string {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const trimmed = title?.trim();
  const name = trimmed ? `${trimmed} (${base})` : base;
  return count > 1 ? `${name} #${index + 1}` : name;
}
