/**
 * The ways a student types a charge or a hydrate, rewritten into the syntax
 * `mf-parser` reads.
 *
 * The parser silently drops a trailing minus — `NO3-` would be read as neutral
 * nitrate and `SO4--` as neutral sulfate — and reads the dot of `CuSO4.5H2O` as
 * a decimal, giving `H2CuO5.5S`. Both are rewritten here, before the parser
 * ever sees the text, rather than by every site that reads a formula.
 */

/**
 * Rewrite the ways a charge and a hydrate are commonly typed into the syntax
 * the parser reads.
 *
 * - `NO3-`, `SO4--`, `S2O3-2`, `CO3 2-`, `CO3^2-` → `NO3(-1)`, `SO4(-2)`, …
 * - `CuSO4.5H2O`, `CuSO4·5H2O`, `CuSO4*5H2O` → `CuSO4 . 5H2O`
 *
 * A charge already written in parentheses, `Fe(3+)`, is left as it is.
 * @param text - The formula as typed.
 * @returns The formula the parser is given.
 */
export function normalizeFormula(text: string): string {
  let formula = text.trim().replaceAll(/[·•*]/g, '.');
  formula = formula.replaceAll(/\s*\.\s*/g, ' . ');

  const separated =
    /^(?<body>.*?\S)(?:\s+|\^)(?<digits>\d*)(?<signs>[+-]+)$/u.exec(formula);
  if (separated?.groups) {
    const { body = '', digits = '', signs = '' } = separated.groups;
    return withCharge(body, signs, digits);
  }
  const signThenDigits =
    /^(?<body>.*?[^\s(])(?<sign>[+-])(?<digits>\d+)$/u.exec(formula);
  if (signThenDigits?.groups) {
    const { body = '', sign = '', digits = '' } = signThenDigits.groups;
    return withCharge(body, sign, digits);
  }
  const trailingSigns = /^(?<body>.*?[^\s+-])(?<signs>[+-]+)$/u.exec(formula);
  if (trailingSigns?.groups) {
    const { body = '', signs = '' } = trailingSigns.groups;
    return withCharge(body, signs, '');
  }
  return formula;
}

function withCharge(body: string, signs: string, digits: string): string {
  const sign = signs.startsWith('-') ? '-' : '+';
  const magnitude = digits === '' ? signs.length : Number(digits);
  return `${body.trim()}(${sign}${magnitude})`;
}
