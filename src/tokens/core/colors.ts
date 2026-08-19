// tokens-ok: file — the colour reader is tested against literals.
/**
 * Reading a colour out of source text, in both spellings the same value is
 * written in: `#5f6b7c` and `rgb(95 107 124)`. Both come back as the same six
 * lowercase hex digits, so a table of banned colours holds one entry per
 * colour rather than one per way of typing it.
 */

/** A colour found in the text, and where it ends. */
export interface ColorMatch {
  /** The value, as six lowercase hex digits, without its `#`. */
  color: string;
  /** The index just past the last character the colour is written with. */
  end: number;
}

/**
 * The colour a hex literal starts at, in `#rgb`, `#rgba`, `#rrggbb` or
 * `#rrggbbaa` form. The alpha, when there is one, says nothing about the
 * colour and is dropped.
 * @param lower - The text being scanned, already lowercased.
 * @param start - The index of the `#`.
 * @returns The colour and its end, or `null` when it is not a hex colour.
 */
export function readHexColor(lower: string, start: number): ColorMatch | null {
  let end = start + 1;
  while (isHexDigit(lower[end])) end++;

  // A run of hex digits running straight into a word is an identifier — a
  // private field, an anchor — rather than a colour.
  if (isWordChar(lower[end])) return null;

  const digits = end - start - 1;
  if (digits === 3 || digits === 4) {
    const red = lower[start + 1];
    const green = lower[start + 2];
    const blue = lower[start + 3];
    return { color: `${red}${red}${green}${green}${blue}${blue}`, end };
  }
  if (digits === 6 || digits === 8) {
    return { color: lower.slice(start + 1, start + 7), end };
  }
  return null;
}

/**
 * The colour an `rgb()` or `rgba()` call starts at, in either the comma or the
 * space separated spelling.
 *
 * Only a plain byte triple is read: a percentage, a decimal or a variable
 * inside the call means the value cannot be compared with a hex literal, and
 * is left alone rather than guessed at.
 * @param lower - The text being scanned, already lowercased.
 * @param start - The index of the `r`.
 * @returns The colour and its end, or `null` when it is not one.
 */
export function readRgbColor(lower: string, start: number): ColorMatch | null {
  let open = -1;
  if (lower.startsWith('rgb(', start)) open = start + 3;
  else if (lower.startsWith('rgba(', start)) open = start + 4;
  if (open === -1) return null;

  const close = lower.indexOf(')', open);
  if (close === -1) return null;

  const components: number[] = [];
  let value = -1;
  for (let index = open + 1; index < close; index++) {
    const char = lower[index];
    if (char !== undefined && char >= '0' && char <= '9') {
      value = Math.max(value, 0) * 10 + Number(char);
      continue;
    }
    if (value >= 0) {
      components.push(value);
      value = -1;
    }
    // The alpha of the modern syntax, which the colour does not depend on.
    if (char === '/') break;
    if (char !== ' ' && char !== ',' && char !== '\t' && char !== '\n') {
      return null;
    }
  }
  if (value >= 0) components.push(value);
  if (components.length < 3) return null;

  let color = '';
  for (let index = 0; index < 3; index++) {
    const component = components[index];
    if (component === undefined || component > 255) return null;
    color += component.toString(16).padStart(2, '0');
  }
  return { color, end: close + 1 };
}

/**
 * The `rrggbb` form of a colour written by hand — in an allow list, on a
 * command line — in any of the spellings the scanner itself reads.
 * @param value - The colour, with or without its `#`.
 * @returns The six lowercase hex digits, or `null` when it is not a colour.
 */
export function normalizeColor(value: string): string | null {
  const text = value.trim().toLowerCase();
  if (text === '') return null;
  let match: ColorMatch | null = null;
  if (text.startsWith('#')) match = readHexColor(text, 0);
  else if (text.startsWith('rgb')) match = readRgbColor(text, 0);
  else match = readHexColor(`#${text}`, 0);
  return match === null ? null : match.color;
}

function isHexDigit(char: string | undefined): boolean {
  if (char === undefined) return false;
  return (char >= '0' && char <= '9') || (char >= 'a' && char <= 'f');
}

function isWordChar(char: string | undefined): boolean {
  if (char === undefined) return false;
  return (
    (char >= '0' && char <= '9') || (char >= 'a' && char <= 'z') || char === '_'
  );
}
