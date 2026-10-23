/** The titration a card answers: 10 mL of acetic acid by NaOH, both 0.1 M. */
export const TITRATION_ROWS: ReadonlyArray<readonly [number, number]> = [
  [0, 2.88],
  [2, 4.15],
  [4, 4.58],
  [5, 4.76],
  [6, 4.93],
  [8, 5.36],
  [9, 5.71],
  [9.9, 6.76],
  [10, 8.72],
  [10.1, 10.7],
  [11, 11.68],
  [14, 12.22],
  [20, 12.52],
];

/**
 * The curve as a table, tab-separated and header first.
 * @returns The text a spreadsheet pastes.
 */
export function titrationTable(): string {
  const lines = ['Volume (mL)\tpH'];
  for (const [volume, ph] of TITRATION_ROWS) lines.push(`${volume}\t${ph}`);
  return lines.join('\n');
}
