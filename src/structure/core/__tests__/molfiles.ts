/** Butane, as openchemlib writes it: a blank title line, then the header. */
export const BUTANE_V2000 = `
OCL MolfileCreator  2D

  4  3  0  0  0  0  0  0  0  0999 V2000
    2.5981    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.7321   -0.5000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.8660    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000   -0.5000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
M  END
`;

/**
 * The same butane in V3000, whose V2000-shaped line declares zero atoms: the
 * real counts are on the `M  V30 COUNTS` line.
 */
export const BUTANE_V3000 = `
OCL MolfileCreator  2D

  0  0  0  0  0  0              0 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 4 3 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C 2.598 0 0 0
M  V30 2 C 1.732 -0.5 0 0
M  V30 3 C 0.866 0 0 0
M  V30 4 C 0 -0.5 0 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 2 1 2 3
M  V30 3 1 3 4
M  V30 END BOND
M  V30 END CTAB
M  END
`;

/** What a viewer renders as an empty scene without reporting anything. */
export const EMPTY_V2000 = `
OCL MolfileCreator  2D

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`;
