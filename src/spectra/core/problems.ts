/** How much a problem matters. */
export type ProblemSeverity = 'error' | 'warning';

/** Something the settings get wrong, or probably get wrong. */
export interface SettingsProblem {
  /**
   * `error` when the processor throws or the matrix comes out wrong;
   * `warning` when it runs and the reader most likely did not mean it.
   */
  severity: ProblemSeverity;
  /** Which part of the settings it is about, as the panel labels that part. */
  where: string;
  /** What is wrong, in one sentence a reader can act on. */
  message: string;
}

/**
 * A problem, spelled out.
 * @param severity - How much it matters.
 * @param where - Which part of the settings it is about.
 * @param message - What is wrong.
 * @returns The problem.
 */
export function problem(
  severity: ProblemSeverity,
  where: string,
  message: string,
): SettingsProblem {
  return { severity, where, message };
}

/**
 * Whether a value is a number the processor can work with.
 * @param value - What the settings hold.
 * @returns True when it is a finite number.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Whether a value is a whole number.
 * @param value - What the settings hold.
 * @returns True when it is a finite integer.
 */
export function isWholeNumber(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

/**
 * Whether a label can stand as the name of a variable.
 *
 * A range's label becomes a parameter of the function the calculations are
 * compiled into, so a label with a space in it fails far from the field that
 * caused it — which is why it is checked here instead.
 * @param label - What the reader typed.
 * @returns True when the label can be a variable name.
 */
export function isUsableLabel(label: string): boolean {
  return /^[A-Za-z_$][\w$]*$/.test(label) && !RESERVED_WORDS.has(label);
}

/**
 * What is wrong with an expression, as far as can be told without running it.
 *
 * The expression is compiled by the processor, not here, so this catches what
 * a reader actually mistypes — an empty box, unclosed brackets, a variable that
 * never appears — and stays silent about the rest rather than pretending to be
 * a parser.
 * @param formula - What the reader typed.
 * @param variable - The one name the expression may read, `x` or `y`.
 * @returns The complaint, or undefined when nothing obvious is wrong.
 */
export function formulaProblem(
  formula: string,
  variable: string,
): string | undefined {
  const trimmed = formula.trim();
  if (trimmed === '') return 'The expression is empty.';
  if (!new RegExp(String.raw`\b${variable}\b`).test(trimmed)) {
    return `The expression never reads ${variable}, so every point would get the same value.`;
  }
  let depth = 0;
  for (const character of trimmed) {
    if (character === '(') depth++;
    if (character === ')') depth--;
    if (depth < 0) return 'A closing bracket has nothing to close.';
  }
  if (depth > 0) return 'A bracket is left open.';
  return undefined;
}

/** The names a range may not take, because a function cannot be given them. */
const RESERVED_WORDS: ReadonlySet<string> = new Set([
  'arguments',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);
