/**
 * Where every element sits in the table, and which family it belongs to.
 *
 * Deliberately the *position* and nothing else: the masses, the isotopes and
 * the exact monoisotopic masses are `chemical-elements`' subject, and a site
 * that needs them reads them from there. Importing that package pulls its whole
 * isotope table, which a site wanting only an element picker must not be made
 * to carry — so the symbols and names are repeated here, and a test asserts
 * they still agree with it.
 *
 * `block` follows the element's *position* in the table, which is what a
 * student reads off it. The configuration is the authority on which subshell is
 * actually filling, and the two disagree for a handful of elements — lanthanum
 * fills 5d, not 4f. See `ELEMENT_ANOMALIES` in the orbital module.
 */

/** Region of the table an element sits in. */
export type ElementBlock = 's' | 'p' | 'd' | 'f';

/** Coarse family, used to colour the table. */
export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanoid'
  | 'actinoid';

/** One element, as the table places it. */
export interface PeriodicElement {
  /** Proton count, 1 to 118. */
  atomicNumber: number;
  /** Chemical symbol, e.g. `Fe`. */
  symbol: string;
  /** English name, spelled as `chemical-elements` spells it. */
  name: string;
  /** Row of the table, 1 to 7. */
  period: number;
  /** IUPAC column 1 to 18; `null` for the lanthanoids and the actinoids. */
  group: number | null;
  block: ElementBlock;
  category: ElementCategory;
}

/** `[symbol, name, period, group, category]`; atomic number is the position. */
type ElementRow = [string, string, number, number | null, ElementCategory];

const ROWS: ElementRow[] = [
  ['H', 'Hydrogen', 1, 1, 'nonmetal'],
  ['He', 'Helium', 1, 18, 'noble-gas'],
  ['Li', 'Lithium', 2, 1, 'alkali-metal'],
  ['Be', 'Beryllium', 2, 2, 'alkaline-earth-metal'],
  ['B', 'Boron', 2, 13, 'metalloid'],
  ['C', 'Carbon', 2, 14, 'nonmetal'],
  ['N', 'Nitrogen', 2, 15, 'nonmetal'],
  ['O', 'Oxygen', 2, 16, 'nonmetal'],
  ['F', 'Fluorine', 2, 17, 'halogen'],
  ['Ne', 'Neon', 2, 18, 'noble-gas'],
  ['Na', 'Sodium', 3, 1, 'alkali-metal'],
  ['Mg', 'Magnesium', 3, 2, 'alkaline-earth-metal'],
  ['Al', 'Aluminium', 3, 13, 'post-transition-metal'],
  ['Si', 'Silicon', 3, 14, 'metalloid'],
  ['P', 'Phosphorus', 3, 15, 'nonmetal'],
  ['S', 'Sulfur', 3, 16, 'nonmetal'],
  ['Cl', 'Chlorine', 3, 17, 'halogen'],
  ['Ar', 'Argon', 3, 18, 'noble-gas'],
  ['K', 'Potassium', 4, 1, 'alkali-metal'],
  ['Ca', 'Calcium', 4, 2, 'alkaline-earth-metal'],
  ['Sc', 'Scandium', 4, 3, 'transition-metal'],
  ['Ti', 'Titanium', 4, 4, 'transition-metal'],
  ['V', 'Vanadium', 4, 5, 'transition-metal'],
  ['Cr', 'Chromium', 4, 6, 'transition-metal'],
  ['Mn', 'Manganese', 4, 7, 'transition-metal'],
  ['Fe', 'Iron', 4, 8, 'transition-metal'],
  ['Co', 'Cobalt', 4, 9, 'transition-metal'],
  ['Ni', 'Nickel', 4, 10, 'transition-metal'],
  ['Cu', 'Copper', 4, 11, 'transition-metal'],
  ['Zn', 'Zinc', 4, 12, 'transition-metal'],
  ['Ga', 'Gallium', 4, 13, 'post-transition-metal'],
  ['Ge', 'Germanium', 4, 14, 'metalloid'],
  ['As', 'Arsenic', 4, 15, 'metalloid'],
  ['Se', 'Selenium', 4, 16, 'nonmetal'],
  ['Br', 'Bromine', 4, 17, 'halogen'],
  ['Kr', 'Krypton', 4, 18, 'noble-gas'],
  ['Rb', 'Rubidium', 5, 1, 'alkali-metal'],
  ['Sr', 'Strontium', 5, 2, 'alkaline-earth-metal'],
  ['Y', 'Yttrium', 5, 3, 'transition-metal'],
  ['Zr', 'Zirconium', 5, 4, 'transition-metal'],
  ['Nb', 'Niobium', 5, 5, 'transition-metal'],
  ['Mo', 'Molybdenum', 5, 6, 'transition-metal'],
  ['Tc', 'Technetium', 5, 7, 'transition-metal'],
  ['Ru', 'Ruthenium', 5, 8, 'transition-metal'],
  ['Rh', 'Rhodium', 5, 9, 'transition-metal'],
  ['Pd', 'Palladium', 5, 10, 'transition-metal'],
  ['Ag', 'Silver', 5, 11, 'transition-metal'],
  ['Cd', 'Cadmium', 5, 12, 'transition-metal'],
  ['In', 'Indium', 5, 13, 'post-transition-metal'],
  ['Sn', 'Tin', 5, 14, 'post-transition-metal'],
  ['Sb', 'Antimony', 5, 15, 'metalloid'],
  ['Te', 'Tellurium', 5, 16, 'metalloid'],
  ['I', 'Iodine', 5, 17, 'halogen'],
  ['Xe', 'Xenon', 5, 18, 'noble-gas'],
  ['Cs', 'Caesium', 6, 1, 'alkali-metal'],
  ['Ba', 'Barium', 6, 2, 'alkaline-earth-metal'],
  ['La', 'Lanthanum', 6, null, 'lanthanoid'],
  ['Ce', 'Cerium', 6, null, 'lanthanoid'],
  ['Pr', 'Praseodymium', 6, null, 'lanthanoid'],
  ['Nd', 'Neodymium', 6, null, 'lanthanoid'],
  ['Pm', 'Promethium', 6, null, 'lanthanoid'],
  ['Sm', 'Samarium', 6, null, 'lanthanoid'],
  ['Eu', 'Europium', 6, null, 'lanthanoid'],
  ['Gd', 'Gadolinium', 6, null, 'lanthanoid'],
  ['Tb', 'Terbium', 6, null, 'lanthanoid'],
  ['Dy', 'Dysprosium', 6, null, 'lanthanoid'],
  ['Ho', 'Holmium', 6, null, 'lanthanoid'],
  ['Er', 'Erbium', 6, null, 'lanthanoid'],
  ['Tm', 'Thulium', 6, null, 'lanthanoid'],
  ['Yb', 'Ytterbium', 6, null, 'lanthanoid'],
  ['Lu', 'Lutetium', 6, null, 'lanthanoid'],
  ['Hf', 'Hafnium', 6, 4, 'transition-metal'],
  ['Ta', 'Tantalum', 6, 5, 'transition-metal'],
  ['W', 'Tungsten', 6, 6, 'transition-metal'],
  ['Re', 'Rhenium', 6, 7, 'transition-metal'],
  ['Os', 'Osmium', 6, 8, 'transition-metal'],
  ['Ir', 'Iridium', 6, 9, 'transition-metal'],
  ['Pt', 'Platinum', 6, 10, 'transition-metal'],
  ['Au', 'Gold', 6, 11, 'transition-metal'],
  ['Hg', 'Mercury', 6, 12, 'transition-metal'],
  ['Tl', 'Thallium', 6, 13, 'post-transition-metal'],
  ['Pb', 'Lead', 6, 14, 'post-transition-metal'],
  ['Bi', 'Bismuth', 6, 15, 'post-transition-metal'],
  ['Po', 'Polonium', 6, 16, 'post-transition-metal'],
  ['At', 'Astatine', 6, 17, 'halogen'],
  ['Rn', 'Radon', 6, 18, 'noble-gas'],
  ['Fr', 'Francium', 7, 1, 'alkali-metal'],
  ['Ra', 'Radium', 7, 2, 'alkaline-earth-metal'],
  ['Ac', 'Actinium', 7, null, 'actinoid'],
  ['Th', 'Thorium', 7, null, 'actinoid'],
  ['Pa', 'Protactinium', 7, null, 'actinoid'],
  ['U', 'Uranium', 7, null, 'actinoid'],
  ['Np', 'Neptunium', 7, null, 'actinoid'],
  ['Pu', 'Plutonium', 7, null, 'actinoid'],
  ['Am', 'Americium', 7, null, 'actinoid'],
  ['Cm', 'Curium', 7, null, 'actinoid'],
  ['Bk', 'Berkelium', 7, null, 'actinoid'],
  ['Cf', 'Californium', 7, null, 'actinoid'],
  ['Es', 'Einsteinium', 7, null, 'actinoid'],
  ['Fm', 'Fermium', 7, null, 'actinoid'],
  ['Md', 'Mendelevium', 7, null, 'actinoid'],
  ['No', 'Nobelium', 7, null, 'actinoid'],
  ['Lr', 'Lawrencium', 7, null, 'actinoid'],
  ['Rf', 'Rutherfordium', 7, 4, 'transition-metal'],
  ['Db', 'Dubnium', 7, 5, 'transition-metal'],
  ['Sg', 'Seaborgium', 7, 6, 'transition-metal'],
  ['Bh', 'Bohrium', 7, 7, 'transition-metal'],
  ['Hs', 'Hassium', 7, 8, 'transition-metal'],
  ['Mt', 'Meitnerium', 7, 9, 'transition-metal'],
  ['Ds', 'Darmstadtium', 7, 10, 'transition-metal'],
  ['Rg', 'Roentgenium', 7, 11, 'transition-metal'],
  ['Cn', 'Copernicium', 7, 12, 'transition-metal'],
  ['Nh', 'Nihonium', 7, 13, 'post-transition-metal'],
  ['Fl', 'Flerovium', 7, 14, 'post-transition-metal'],
  ['Mc', 'Moscovium', 7, 15, 'post-transition-metal'],
  ['Lv', 'Livermorium', 7, 16, 'post-transition-metal'],
  ['Ts', 'Tennessine', 7, 17, 'halogen'],
  ['Og', 'Oganesson', 7, 18, 'noble-gas'],
];

/** Every element, ordered by atomic number. */
export const PERIODIC_ELEMENTS: readonly PeriodicElement[] = ROWS.map(
  (row, index) => ({
    atomicNumber: index + 1,
    symbol: row[0],
    name: row[1],
    period: row[2],
    group: row[3],
    block: blockOf(index + 1, row[3]),
    category: row[4],
  }),
);

const BY_SYMBOL = new Map(
  PERIODIC_ELEMENTS.map((element) => [element.symbol, element]),
);

/**
 * Look up an element by its symbol.
 * @param symbol - Chemical symbol, e.g. `Cl`. Case sensitive, as symbols are.
 * @returns The element, or `undefined` when no element carries that symbol.
 */
export function elementBySymbol(symbol: string): PeriodicElement | undefined {
  return BY_SYMBOL.get(symbol);
}

/**
 * Look up an element by its atomic number.
 * @param atomicNumber - Proton count, 1 to 118.
 * @returns The element, or `undefined` when it is outside the table.
 */
export function elementByAtomicNumber(
  atomicNumber: number,
): PeriodicElement | undefined {
  return PERIODIC_ELEMENTS[atomicNumber - 1];
}

function blockOf(atomicNumber: number, group: number | null): ElementBlock {
  if (group === null) return 'f';
  // Helium sits above the p block but its only electrons are 1s.
  if (atomicNumber === 2) return 's';
  if (group <= 2) return 's';
  if (group <= 12) return 'd';
  return 'p';
}
