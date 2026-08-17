/** One borrowed work a site credits. */
export interface CreditEntry {
  /** How a site names the work in its own list. */
  id: string;
  /** What the work is called, spelled the way its authors spell it. */
  name: string;
  /** Where the work lives. */
  href: string;
  /** What it does for the site, in one line. */
  description: string;
  /**
   * Licence it is distributed under.
   * @default undefined — the work carries no licence of its own here
   */
  license?: string;
}

/** An id the registry answers to. */
export type CreditId = (typeof CREDITS)[number]['id'];

/**
 * The borrowed works a site names, in the order it names them.
 *
 * An About dialog lists what the page stands on, and every site had been
 * writing that list itself — which is how two of them came to credit the same
 * project to two different organisations. One registry, one answer.
 * @param ids - Which works to list, in display order.
 * @returns The entries, in that order.
 * @throws {Error} When an id is not in the registry: a credits list that
 *   silently drops a work credits nobody.
 */
export function credits(ids: readonly CreditId[]): CreditEntry[] {
  const listed: CreditEntry[] = [];
  for (const id of ids) {
    const entry = creditOf(id);
    if (entry === undefined) {
      throw new Error(`unknown credit: ${id}`);
    }
    listed.push(entry);
  }
  return listed;
}

/**
 * One borrowed work of the registry, for a site checking whether it holds one.
 * @param id - Which work.
 * @returns Its entry, or `undefined` when the registry does not hold it.
 */
export function creditOf(id: string): CreditEntry | undefined {
  return CREDITS.find((candidate) => candidate.id === id);
}

/**
 * Every work our sites borrow, with the organisation that actually publishes
 * it — checked against the package each site installs, not against habit.
 */
export const CREDITS = [
  {
    id: 'openchemlib',
    name: 'OpenChemLib',
    href: 'https://github.com/cheminfo/openchemlib-js',
    description:
      'reads and writes structures, and computes their properties in the browser.',
    license: 'BSD-3-Clause',
  },
  {
    id: 'openchemlib-utils',
    name: 'openchemlib-utils',
    href: 'https://github.com/cheminfo/openchemlib-utils',
    description: 'the structure helpers built on top of OpenChemLib.',
    license: 'MIT',
  },
  {
    id: 'react-ocl',
    name: 'react-ocl',
    href: 'https://github.com/zakodium-oss/react-ocl',
    description: 'the structure editor you draw in, and the 2D renderer.',
    license: 'MIT',
  },
  {
    id: 'react-mf',
    name: 'react-mf',
    href: 'https://github.com/zakodium-oss/react-mf',
    description:
      'typesets a molecular formula, subscripts, isotopes and charges included.',
    license: 'MIT',
  },
  {
    id: 'mass-tools',
    name: 'mass-tools',
    href: 'https://github.com/cheminfo/mass-tools',
    description:
      'parses molecular formulas and computes masses and isotopic distributions.',
    license: 'MIT',
  },
  {
    id: 'chem-equilibrium',
    name: 'chem-equilibrium',
    href: 'https://github.com/cheminfo/chem-equilibrium',
    description:
      'builds the mass-balance system of a solution and finds its root.',
    license: 'MIT',
  },
  {
    id: 'ml-matrix',
    name: 'ml-matrix',
    href: 'https://github.com/mljs/matrix',
    description: 'the linear algebra behind the numbers on the page.',
    license: 'MIT',
  },
  {
    id: 'ml-spectra-processing',
    name: 'ml-spectra-processing',
    href: 'https://github.com/mljs/spectra-processing',
    description: 'the array and spectrum operations the data goes through.',
    license: 'MIT',
  },
  {
    id: 'molstar',
    name: 'Mol*',
    href: 'https://molstar.org/',
    description: 'the 3D viewer, its representations and its surfaces.',
    license: 'MIT',
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    href: 'https://blueprintjs.com/',
    description:
      'the interface components — cards, dialogs, inputs, tables and tags.',
    license: 'Apache-2.0',
  },
  {
    id: 'react-science',
    name: 'react-science',
    href: 'https://github.com/zakodium-oss/react-science',
    description:
      'the scientific application shell this family of sites shares.',
    license: 'MIT',
  },
  {
    id: 'react-cheminfo',
    name: 'react-cheminfo',
    href: 'https://github.com/cheminfo/react-cheminfo',
    description: 'the shared chrome and conventions of the cheminfo sites.',
    license: 'MIT',
  },
  {
    id: 'cheminfo-font',
    name: 'cheminfo-font',
    href: 'https://github.com/cheminfo/font',
    description: 'the chemistry glyphs the toolbars are drawn with.',
    license: 'CC-BY-4.0',
  },
  {
    id: 'nivo',
    name: 'nivo',
    href: 'https://nivo.rocks/',
    description: 'draws the charts — the curves, the diagrams and the axes.',
    license: 'MIT',
  },
  {
    id: 'mathjax',
    name: 'MathJax',
    href: 'https://www.mathjax.org/',
    description: 'typesets the mathematics, from LaTeX to what you read.',
    license: 'Apache-2.0',
  },
  {
    id: 'react',
    name: 'React',
    href: 'https://react.dev/',
    description: 'the component model the pages are written in.',
    license: 'MIT',
  },
  {
    id: 'vite',
    name: 'Vite',
    href: 'https://vite.dev/',
    description: 'builds and serves the static site.',
    license: 'MIT',
  },
] as const satisfies readonly CreditEntry[];
