/**
 * The molecules every parallel-coordinates story is drawn from: twenty-four
 * drugs and metabolites, with the properties openchemlib works out for them.
 *
 * The data lives here so that a story file is the states rather than the
 * numbers, and nothing in it is invented: the SMILES are the published
 * structures and every property is read off `MoleculeProperties` at load, so a
 * reader checking one of these against a reference book is checking the
 * library rather than a table somebody typed. `openchemlib` is a development
 * dependency, so a story may import it where nothing under `src` ever may.
 */

import { Molecule, MoleculeProperties } from 'openchemlib';

import type { ParallelAxis, ParallelTick } from '../src/parallel/core/index.ts';
import { parallelAxisOf } from '../src/parallel/core/index.ts';

/** One molecule, and what openchemlib says about it. */
export interface DrugRow {
  /** What it is called. */
  name: string;
  /** Its structure. */
  smiles: string;
  /** Its molecular formula, as openchemlib writes it. */
  formula: string;
  /** Its relative molecular weight, in g/mol. */
  weight: number;
  /** Its predicted partition coefficient. */
  logP: number;
  /** Its predicted solubility. */
  logS: number;
  /** Its topological polar surface area, in Å². */
  polarSurfaceArea: number;
  /** How many hydrogen-bond donors it carries. */
  donorCount: number;
  /** How many acceptors. */
  acceptorCount: number;
  /** How many of its bonds turn freely. */
  rotatableBondCount: number;
  /** How many of Lipinski's four rules it breaks, from 0 to 4. */
  lipinskiBreaks: number;
}

/** The structures the stories draw, in the order the figure indexes them. */
const STRUCTURES: ReadonlyArray<readonly [string, string]> = [
  ['Aspirin', 'CC(=O)Oc1ccccc1C(=O)O'],
  ['Paracetamol', 'CC(=O)Nc1ccc(O)cc1'],
  ['Ibuprofen', 'CC(C)Cc1ccc(cc1)C(C)C(=O)O'],
  ['Naproxen', 'COc1ccc2cc(ccc2c1)C(C)C(=O)O'],
  ['Diclofenac', 'OC(=O)Cc1ccccc1Nc1c(Cl)cccc1Cl'],
  ['Caffeine', 'Cn1cnc2c1c(=O)n(C)c(=O)n2C'],
  ['Theophylline', 'Cn1c(=O)c2[nH]cnc2n(C)c1=O'],
  ['Nicotine', 'CN1CCCC1c1cccnc1'],
  ['Morphine', 'CN1CCC23c4c5ccc(O)c4OC2C(O)C=CC3C1C5'],
  ['Penicillin G', 'CC1(C)SC2C(NC(=O)Cc3ccccc3)C(=O)N2C1C(=O)O'],
  ['Amoxicillin', 'CC1(C)SC2C(NC(=O)C(N)c3ccc(O)cc3)C(=O)N2C1C(=O)O'],
  [
    'Atorvastatin',
    'CC(C)c1c(C(=O)Nc2ccccc2)c(-c2ccccc2)c(-c2ccc(F)cc2)n1CCC(O)CC(O)CC(=O)O',
  ],
  ['Metformin', 'CN(C)C(=N)NC(=N)N'],
  [
    'Sildenafil',
    'CCCc1nn(C)c2c1nc([nH]c2=O)-c1cc(ccc1OCC)S(=O)(=O)N1CCN(C)CC1',
  ],
  ['Diazepam', 'CN1c2ccc(Cl)cc2C(=NCC1=O)c1ccccc1'],
  ['Warfarin', 'CC(=O)CC(c1ccccc1)c1c(O)c2ccccc2oc1=O'],
  ['Salbutamol', 'CC(C)(C)NCC(O)c1ccc(O)c(CO)c1'],
  ['Ascorbic acid', 'OCC(O)C1OC(=O)C(O)=C1O'],
  ['Glucose', 'OCC1OC(O)C(O)C(O)C1O'],
  ['Testosterone', 'CC12CCC3C(CCC4=CC(=O)CCC34C)C1CCC2O'],
  ['Cholesterol', 'CC(C)CCCC(C)C1CCC2C3CC=C4CC(O)CCC4(C)C3CCC12C'],
  ['Dopamine', 'NCCc1ccc(O)c(O)c1'],
  ['Serotonin', 'NCCc1c[nH]c2ccc(O)cc12'],
  ['Omeprazole', 'COc1ccc2[nH]c(S(=O)Cc3ncc(C)c(OC)c3C)nc2c1'],
];

/** The molecules, with everything the figure and its cards read. */
export const DRUGS: readonly DrugRow[] = readDrugs();

/** How many of them there are, which a selection is a share of. */
export const DRUG_COUNT = DRUGS.length;

/** The three words a count of broken rules is written with. */
export const LIPINSKI_TICKS: readonly ParallelTick[] = [
  { value: 0, label: 'none' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: 'all 4' },
];

/** The axes the stories draw, from left to right. */
export const DRUG_AXES: readonly ParallelAxis[] = [
  axis('weight', 'Molecular weight', 'g/mol', (row) => row.weight),
  axis('logP', 'cLogP', '', (row) => row.logP),
  axis('logS', 'Solubility', '', (row) => row.logS),
  axis('tpsa', 'Polar surface', 'Å²', (row) => row.polarSurfaceArea),
  axis('donors', 'H donors', '', (row) => row.donorCount),
  axis('acceptors', 'H acceptors', '', (row) => row.acceptorCount),
  axis('rotatable', 'Rotatable bonds', '', (row) => row.rotatableBondCount),
];

/**
 * The same axes with Lipinski's count on the end, written in words.
 *
 * A coded quantity is what `ticks` exists for: `2` on an axis means nothing,
 * and the reader is counting rules rather than measuring anything.
 */
export const DRUG_AXES_WITH_RULES: readonly ParallelAxis[] = [
  ...DRUG_AXES,
  {
    ...axis('lipinski', 'Rules broken', '', (row) => row.lipinskiBreaks),
    domain: [0, 4],
    ticks: LIPINSKI_TICKS,
  },
];

function axis(
  id: string,
  label: string,
  unit: string,
  value: (row: DrugRow) => number,
): ParallelAxis {
  return parallelAxisOf(DRUGS, { id, label, unit, value });
}

function readDrugs(): DrugRow[] {
  const rows: DrugRow[] = [];
  for (const [name, smiles] of STRUCTURES) {
    const molecule = Molecule.fromSmiles(smiles, { noCoordinates: true });
    const formula = molecule.getMolecularFormula();
    // The constructor mutates the molecule it is given, so it never gets the
    // one the formula was read from.
    const properties = new MoleculeProperties(
      Molecule.fromSmiles(smiles, { noCoordinates: true }),
    );
    const row: DrugRow = {
      name,
      smiles,
      formula: formula.formula,
      weight: formula.relativeWeight,
      logP: properties.logP,
      logS: properties.logS,
      polarSurfaceArea: properties.polarSurfaceArea,
      donorCount: properties.donorCount,
      acceptorCount: properties.acceptorCount,
      rotatableBondCount: properties.rotatableBondCount,
      lipinskiBreaks: 0,
    };
    row.lipinskiBreaks = lipinskiBreaks(row);
    rows.push(row);
  }
  return rows;
}

function lipinskiBreaks(row: DrugRow): number {
  let broken = 0;
  if (row.weight > 500) broken++;
  if (row.logP > 5) broken++;
  if (row.donorCount > 5) broken++;
  if (row.acceptorCount > 10) broken++;
  return broken;
}
