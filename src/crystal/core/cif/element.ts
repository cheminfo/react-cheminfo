import { elementBySymbol } from '../../../periodic/core/elements.ts';

/**
 * Read the element of an atom site: the type symbol's, else the label's.
 * @param typeSymbol - `_atom_site_type_symbol`, or `null` when absent.
 * @param label - `_atom_site_label`.
 * @returns The chemical symbol.
 * @throws {Error} When neither opens with an element symbol.
 */
export function elementOf(typeSymbol: string | null, label: string): string {
  const fromType = typeSymbol === null ? null : symbolOf(typeSymbol);
  if (fromType !== null) return fromType;
  const fromLabel = symbolOf(label);
  if (fromLabel !== null) return fromLabel;
  throw new Error(
    `Atom site "${label}" names no element: neither its type symbol nor its label opens with one.`,
  );
}

/**
 * Read the chemical symbol a CIF token opens with.
 *
 * A type symbol carries the oxidation state (`Na1+`, `Cl1-`) and a label
 * carries an index in whatever case the refinement wrote it (`NA1`, `CL2`), so
 * the letters are taken, recapitalised and checked against the periodic table.
 * Deuterium, which a neutron structure writes `D`, is hydrogen.
 * @param token - a type symbol or an atom-site label.
 * @returns the symbol, or `null` when the letters name no element.
 */
function symbolOf(token: string): string | null {
  const letters = /^(?<letters>[A-Za-z]{1,2})/.exec(token)?.groups?.letters;
  if (letters === undefined) return null;
  for (let length = letters.length; length >= 1; length--) {
    const symbol =
      letters.charAt(0).toUpperCase() + letters.slice(1, length).toLowerCase();
    if (elementBySymbol(symbol) !== undefined) return symbol;
    if (symbol === 'D') return 'H';
  }
  return null;
}
