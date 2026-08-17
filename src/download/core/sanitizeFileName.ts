// Windows refuses these outright, and they read as syntax in a shell.
const RESERVED = /["*:<>?|]/gu;
const PATH_SEPARATOR = /[/\\]/gu;
// Control characters that are not whitespace: a newline is folded into a space
// below rather than dropped, so a pasted two-line name stays readable.
const CONTROL = /[^\P{Cc}\s]/gu;
const WHITESPACE = /\s+/gu;
const LEADING = /^[\s.-]+/u;
const TRAILING = /[\s.]+$/u;

/**
 * Turn whatever a molecule, a list or a page is called into a name a file
 * system takes.
 *
 * The name usually comes from something the visitor typed or from a record
 * that was downloaded, so it may carry a path, a newline, or nothing at all.
 * Path separators become hyphens rather than disappearing, so the parts of the
 * name stay readable, and a name left empty falls back rather than saving a
 * file with no name at all.
 * @param name - What the file should be called.
 * @param fallback - Name used when nothing usable is left.
 * @returns A file name safe to pass to a download.
 */
export function sanitizeFileName(name: string, fallback = 'download'): string {
  const cleaned = name
    .replaceAll(CONTROL, '')
    .replaceAll(PATH_SEPARATOR, '-')
    .replaceAll(RESERVED, '')
    .replaceAll(WHITESPACE, ' ')
    .replace(LEADING, '')
    .replace(TRAILING, '');
  return cleaned === '' ? fallback : cleaned;
}
