/**
 * A table of sensitivity factors as the shipped instruments write it: one
 * string per element, each level followed by its factor — `2p 0.668 2s 0.391`
 * — which keeps a table of several hundred levels readable as a table.
 */

import type { XpsSensitivityFactor } from './xpsInstrument.ts';

/**
 * The factors of a table, one per level.
 * @param lines - One string per element: level and factor, in pairs.
 * @returns The factors, element by element in the order the table lists them.
 */
export function expandFactorTable(
  lines: Readonly<Record<string, string>>,
): XpsSensitivityFactor[] {
  const factors: XpsSensitivityFactor[] = [];
  for (const [element, text] of Object.entries(lines)) {
    const words = text.split(' ');
    for (let index = 0; index + 1 < words.length; index += 2) {
      factors.push({
        element,
        orbital: words[index] as string,
        factor: Number(words[index + 1]),
      });
    }
  }
  return factors;
}
