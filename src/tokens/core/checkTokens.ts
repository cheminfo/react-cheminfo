// tokens-ok: file — the checker names the colours it looks for.
import { normalizeColor, readHexColor, readRgbColor } from './colors.ts';
import { BANNED_COLORS } from './rules.ts';

/** What a site got wrong where a token was called for. */
export type TokenViolationKind =
  'blueprint-grey' | 'blueprint-blue' | 'retyped-token' | 'redeclared-brand';

/** One place a site writes a colour that is not its own to write. */
export interface TokenViolation {
  /** The file it is written in, named as the caller named it. */
  file: string;
  /** Which line, counting from 1. */
  line: number;
  /** Which column, counting from 1. */
  column: number;
  /** What kind of mistake it is. */
  kind: TokenViolationKind;
  /** The text as written — the hex, the `rgb()` call, the property name. */
  text: string;
  /** The token to use instead, in one line. */
  hint: string;
}

/** How forgiving a scan is. */
export interface CheckTokensOptions {
  /**
   * Colours the project legitimately owns — a subject-matter palette, a logo
   * of somebody else.
   * @default []
   */
  allow?: readonly string[];
  /**
   * Lines carrying this marker are skipped, for the rare deliberate literal.
   * @default 'tokens-ok'
   */
  ignoreMarker?: string;
}

/**
 * Every colour a set of files writes that belongs to the family rather than to
 * the site.
 *
 * The neutrals, the geometry and the type are shared, and the two colours a
 * site owns come from `<SiteTheme siteId>`; a site that re-types either — a
 * Blueprint grey because a component used it, `#f5f7fa` because that is what
 * the token holds today, `--brand` because the palette was declared by hand —
 * leaves its page unable to follow the family. Both spellings of one colour
 * are caught, `#5f6b7c` and `rgb(95 107 124)` alike, and reading a token
 * through `var()` is never a violation.
 * @param files - The files to read, each with the path a report names it by.
 * @param options - The colours the project owns, and the marker waiving a line.
 * @returns Every violation, in file order and then in reading order.
 */
export function findTokenViolations(
  files: ReadonlyArray<{ path: string; text: string }>,
  options: CheckTokensOptions = {},
): TokenViolation[] {
  const marker = (options.ignoreMarker ?? DEFAULT_IGNORE_MARKER).toLowerCase();
  const allowed = new Set<string>();
  for (const entry of options.allow ?? []) {
    const color = normalizeColor(entry);
    if (color !== null) allowed.add(color);
  }

  const violations: TokenViolation[] = [];
  for (const file of files) {
    // A file whose opening lines carry the marker defines the palette rather
    // than consuming it — the token block itself, the registry of banned
    // colours, an image generated outside any page.
    if (waivesWholeFile(file.text, marker)) continue;
    const scan = scanFile(file.text, marker);
    for (const candidate of scan.candidates) {
      if (scan.markedLines.has(candidate.line)) continue;
      if (candidate.color !== null && allowed.has(candidate.color)) continue;
      violations.push({
        file: file.path,
        line: candidate.line,
        column: candidate.column,
        kind: candidate.kind,
        text: candidate.text,
        hint: candidate.hint,
      });
    }
  }
  return violations;
}

const DEFAULT_IGNORE_MARKER = 'tokens-ok';

// How far into a file the whole-file waiver may sit: a licence header, an
// import or two, and the comment saying why this file writes colours.
const WAIVER_LINES = 6;

function waivesWholeFile(text: string, marker: string): boolean {
  if (marker.length === 0) return false;
  const head = text.split('\n', WAIVER_LINES).join('\n').toLowerCase();
  return head.includes(`${marker}: file`);
}

// Longest first, so `--brand-alt` is never read as `--brand`.
const BRAND_PROPERTIES = ['--brand-alt', '--brand', '--accent'] as const;

interface Candidate extends Omit<TokenViolation, 'file'> {
  /** The colour written, or `null` for a property that should not be declared. */
  color: string | null;
}

interface FileScan {
  candidates: Candidate[];
  markedLines: Set<number>;
}

// One pass over the file: the marker, the block structure and every colour are
// all read from the same walk, so nothing is matched a second time per line.
function scanFile(text: string, marker: string): FileScan {
  const lower = text.toLowerCase();
  const candidates: Candidate[] = [];
  const markedLines = new Set<number>();
  const rootBlocks: boolean[] = [];
  // Which parentheses are open, and whether each is a `var(` past its comma —
  // a colour there is a fallback for the token named beside it.
  const parens: Array<{ isVar: boolean; sawComma: boolean }> = [];
  let selectorStart = 0;
  let line = 1;
  let lineStart = 0;

  for (let index = 0; index < lower.length; index++) {
    const char = lower[index];
    if (char === '\n') {
      line++;
      lineStart = index + 1;
      continue;
    }
    if (
      marker.length > 0 &&
      char === marker[0] &&
      lower.startsWith(marker, index)
    ) {
      markedLines.add(line);
      index += marker.length - 1;
      continue;
    }
    if (char === '(') {
      parens.push({
        isVar: lower.startsWith('var(', index - 3),
        sawComma: false,
      });
      continue;
    }
    if (char === ')') {
      parens.pop();
      continue;
    }
    if (char === ',') {
      const open = parens.at(-1);
      if (open !== undefined) open.sawComma = true;
      continue;
    }
    if (char === '{') {
      rootBlocks.push(lower.slice(selectorStart, index).includes(':root'));
      selectorStart = index + 1;
      continue;
    }
    if (char === '}' || char === ';') {
      if (char === '}') rootBlocks.pop();
      selectorStart = index + 1;
      continue;
    }

    if (char === '#' || char === 'r') {
      const match =
        char === '#' ? readHexColor(lower, index) : readRgbColor(lower, index);
      if (match === null) continue;
      const rule = BANNED_COLORS.get(match.color);
      const open = parens.at(-1);
      const isFallback = open !== undefined && open.isVar && open.sawComma;
      if (rule !== undefined && !isFallback) {
        candidates.push({
          line,
          column: index - lineStart + 1,
          kind: rule.kind,
          text: text.slice(index, match.end),
          hint: rule.hint,
          color: match.color,
        });
      }
      index = match.end - 1;
      continue;
    }

    if (char === '-') {
      const property = readBrandDeclaration(lower, index);
      if (property === null) continue;
      if (rootBlocks.includes(true)) {
        candidates.push({
          line,
          column: index - lineStart + 1,
          kind: 'redeclared-brand',
          text: property.name,
          hint: `render <SiteTheme siteId> instead of declaring ${property.name} in :root.`,
          color: null,
        });
      }
      index = property.end - 1;
    }
  }
  return { candidates, markedLines };
}

// A declaration of one of the palette properties. Reading one — `var(--brand)`
// — has no colon after the name, so it never lands here.
function readBrandDeclaration(
  lower: string,
  start: number,
): { name: string; end: number } | null {
  for (const name of BRAND_PROPERTIES) {
    if (!lower.startsWith(name, start)) continue;
    const after = start + name.length;
    // `--brand-alt-text` is its own property, not `--brand-alt`.
    if (isNameChar(lower[after])) return null;
    let index = after;
    while (isSpace(lower[index])) index++;
    if (lower[index] !== ':') return null;
    return { name, end: after };
  }
  return null;
}

function isNameChar(char: string | undefined): boolean {
  if (char === undefined) return false;
  return (
    (char >= '0' && char <= '9') ||
    (char >= 'a' && char <= 'z') ||
    char === '-' ||
    char === '_'
  );
}

function isSpace(char: string | undefined): boolean {
  return char === ' ' || char === '\t';
}
