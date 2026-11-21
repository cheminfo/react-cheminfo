/**
 * Each style there is, loaded only when asked for.
 * Written by scripts/csl-styles.mjs: change the script, not this file.
 */
export const STYLE_LOADERS: Readonly<Record<string, () => Promise<string>>> = {
  'american-chemical-society': () =>
    import('./americanChemicalSociety.ts').then((module) => module.STYLE),
  'american-institute-of-physics': () =>
    import('./americanInstituteOfPhysics.ts').then((module) => module.STYLE),
  'american-mathematical-society-numeric': () =>
    import('./americanMathematicalSocietyNumeric.ts').then(
      (module) => module.STYLE,
    ),
  'american-physics-society': () =>
    import('./americanPhysicsSociety.ts').then((module) => module.STYLE),
  'angewandte-chemie': () =>
    import('./angewandteChemie.ts').then((module) => module.STYLE),
  'beilstein-journal-of-organic-chemistry': () =>
    import('./beilsteinJournalOfOrganicChemistry.ts').then(
      (module) => module.STYLE,
    ),
  'elsevier-with-titles': () =>
    import('./elsevierWithTitles.ts').then((module) => module.STYLE),
  'helvetica-chimica-acta': () =>
    import('./helveticaChimicaActa.ts').then((module) => module.STYLE),
  ieee: () => import('./ieee.ts').then((module) => module.STYLE),
  'institute-of-physics-numeric': () =>
    import('./instituteOfPhysicsNumeric.ts').then((module) => module.STYLE),
  nature: () => import('./nature.ts').then((module) => module.STYLE),
  'royal-society-of-chemistry': () =>
    import('./royalSocietyOfChemistry.ts').then((module) => module.STYLE),
  'springer-mathphys-brackets': () =>
    import('./springerMathphysBrackets.ts').then((module) => module.STYLE),
  'springer-physics-brackets': () =>
    import('./springerPhysicsBrackets.ts').then((module) => module.STYLE),
  synthesis: () => import('./synthesis.ts').then((module) => module.STYLE),
  tetrahedron: () => import('./tetrahedron.ts').then((module) => module.STYLE),
};
