/**
 * What OSIRIS predicts for benzidine, as the pool hands it over: a fixture for
 * the panel's tests and stories, which need no OpenChemLib to draw it. Three of
 * its risks come back high and one comes back clean, so every tone is shown.
 */

import type { OsirisProperties, RiskDetail } from '../types.ts';

/** Benzidine, predicted from its idCode. */
export const BENZIDINE: OsirisProperties = {
  idCode: 'dg}@@@mIe]e^ftx@H@H@@',
  smiles: 'Nc(cc1)ccc1-c(cc1)ccc1N',
  label: 'Benzidine',
  molecularFormula: 'C12H12N2',
  molecularWeight: 184.241_280_000_000_02,
  logP: 1.964_200_027_287_006_4,
  logS: -3.853_999_853_134_155_3,
  polarSurfaceArea: 52.040_000_915_527_344,
  druglikeness: -7.134_903_320_081_218,
  drugScore: 0.091_844_476_595_875_75,
  acceptorCount: 2,
  donorCount: 2,
  stereoCenterCount: 0,
  rotatableBondCount: 1,
  risks: {
    mutagenic: 'high',
    tumorigenic: 'high',
    irritant: 'high',
    reproductive: 'none',
  },
};

/** Why benzidine's mutagenicity came back high: a matched fragment. */
export const BENZIDINE_MUTAGENIC: RiskDetail = {
  risk: 'mutagenic',
  findings: [
    {
      kind: 'fragment',
      description: 'High-risk fragments indicating Mutagenicity:',
      severity: 'high',
      idCode: 'dk^@@@RYWYVftx@H@@@H',
      atoms: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      bonds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
  ],
};
