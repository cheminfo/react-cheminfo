/** A molecule the sites actually show, with the name written under it. */
export interface DemoMolecule {
  /** What the caption says. */
  name: string;
  /** The SMILES the depiction is drawn from. */
  smiles: string;
}

/** 1,3,7-trimethylxanthine — the molecule every demo opens on. */
export const CAFFEINE = 'CN1C=NC2=C1C(=O)N(C)C(=O)N2C';

/** Acetylsalicylic acid, whose acetyl is a substructure worth painting. */
export const ASPIRIN = 'CC(=O)Oc1ccccc1C(=O)O';

/** The ring a depiction has to draw as a ring rather than as six lines. */
export const BENZENE = 'c1ccccc1';

/** Three real molecules, small enough that a row of them stays legible. */
export const DEMO_MOLECULES: readonly DemoMolecule[] = [
  { name: 'caffeine', smiles: CAFFEINE },
  { name: 'aspirin', smiles: ASPIRIN },
  { name: 'benzene', smiles: BENZENE },
];

/**
 * The atoms of aspirin's acetyl group, as a substructure match hands them
 * over: the methyl, the carbonyl carbon, its oxygen and the ester oxygen.
 */
export const ASPIRIN_ACETYL = [0, 1, 2, 3];
