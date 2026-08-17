/** One row of a properties panel: what is measured, and what it reads. */
export interface MoleculeProperty {
  /** Name of the property. */
  name: string;
  /** Its value, already written the way a page shows it. */
  value: string;
}

/** Caffeine, as a properties panel shows it. */
export const CAFFEINE_PROPERTIES: readonly MoleculeProperty[] = [
  { name: 'Molecular formula', value: 'C8H10N4O2' },
  { name: 'Monoisotopic mass', value: '194.08038 Da' },
  { name: 'Average mass', value: '194.1906 Da' },
  { name: 'SMILES', value: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C' },
  { name: 'InChIKey', value: 'RYYVLZVUVIJVGH-UHFFFAOYSA-N' },
];

/** Aspirin, so a second section of the same panel says something else. */
export const ASPIRIN_PROPERTIES: readonly MoleculeProperty[] = [
  { name: 'Molecular formula', value: 'C9H8O4' },
  { name: 'Monoisotopic mass', value: '180.04226 Da' },
  { name: 'Average mass', value: '180.1574 Da' },
  { name: 'SMILES', value: 'CC(=O)Oc1ccccc1C(=O)O' },
];

/** One entry of a list the keyboard walks. */
export interface MoleculeEntry {
  /** Common name, which is also the key of the row. */
  name: string;
  /** Molecular formula, written as a page would. */
  formula: string;
  /** Monoisotopic mass in daltons. */
  mass: number;
}

/**
 * Ten molecules an assay would actually list, so arrow keys have something
 * honest to walk through.
 */
export const MOLECULES: readonly MoleculeEntry[] = [
  { name: 'Methane', formula: 'CH4', mass: 16.0313 },
  { name: 'Ethanol', formula: 'C2H6O', mass: 46.0419 },
  { name: 'Acetone', formula: 'C3H6O', mass: 58.0419 },
  { name: 'Benzene', formula: 'C6H6', mass: 78.0464 },
  { name: 'Toluene', formula: 'C7H8', mass: 92.0621 },
  { name: 'Phenol', formula: 'C6H6O', mass: 94.0413 },
  { name: 'Glucose', formula: 'C6H12O6', mass: 180.0634 },
  { name: 'Aspirin', formula: 'C9H8O4', mass: 180.0423 },
  { name: 'Caffeine', formula: 'C8H10N4O2', mass: 194.0804 },
  { name: 'Cholesterol', formula: 'C27H46O', mass: 386.3549 },
];
