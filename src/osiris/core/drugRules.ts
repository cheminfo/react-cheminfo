/** What Lipinski's rule of five reads. */
export interface LipinskiInputs {
  /** Molecular weight, g/mol. */
  mw: number;
  /** cLogP. */
  logP: number;
  /**
   * The hydrogen-bond donors, counted as the caller decides: the hydrogens on
   * nitrogen and oxygen ("the sum of OHs and NHs", an NH2 counting twice), or
   * OpenChemLib's `donorCount`, the N and O atoms bearing one.
   */
  donors: number;
  /** Nitrogen and oxygen atoms: "the sum of Ns and Os". */
  acceptors: number;
}

/**
 * How many of Lipinski's four limits a molecule exceeds (Adv. Drug Deliv. Rev.
 * 1997, 23, 3): more than 5 donors, a weight over 500, a cLogP over 5, more
 * than 10 acceptors. Poor absorption is likely from two on.
 * @param inputs - The four quantities.
 * @returns 0 to 4.
 */
export function lipinskiViolations(inputs: LipinskiInputs): number {
  let violations = 0;
  if (inputs.donors > 5) violations++;
  if (inputs.mw > 500) violations++;
  if (inputs.logP > 5) violations++;
  if (inputs.acceptors > 10) violations++;
  return violations;
}

/**
 * Whether a molecule passes Lipinski's rule of five: at most one limit
 * exceeded.
 * @param inputs - The four quantities.
 * @returns Whether it passes.
 */
export function passesLipinski(inputs: LipinskiInputs): boolean {
  return lipinskiViolations(inputs) <= 1;
}

/** What Veber's rule reads. */
export interface VeberInputs {
  /** Single bonds that are not terminal, not in a ring and not amide. */
  rotatableBondCount: number;
  /** Topological polar surface area, Å². */
  polarSurfaceArea: number;
}

/**
 * Whether a molecule passes Veber's rule (J. Med. Chem. 2002, 45, 2615): at
 * most 10 rotatable bonds and a polar surface area of at most 140 Å².
 * @param inputs - The two quantities.
 * @returns Whether both hold.
 */
export function passesVeber(inputs: VeberInputs): boolean {
  return inputs.rotatableBondCount <= 10 && inputs.polarSurfaceArea <= 140;
}
