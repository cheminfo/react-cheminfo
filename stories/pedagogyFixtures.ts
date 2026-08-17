/**
 * One tool's worth of real teaching content, so the pedagogic components are
 * looked at holding what a site would actually put in them.
 *
 * The subject is SMILES — the line notation smiles.cheminfo.org teaches — and
 * every string below is a molecule that parses: ethanol, acetic acid, benzene,
 * L-alanine. A component judged against `foo` / `bar` looks fine and then
 * breaks on the first real column of text.
 */

import type { Glossary } from '../src/pedagogy/core/glossary.ts';
import type { ProgressSummary } from '../src/pedagogy/core/progress.ts';
import type { BaseExercise, TutorialStep } from '../src/pedagogy/core/types.ts';
import type { TestCaseResult } from '../src/pedagogy/core/validation.ts';
import type { ReferenceSection } from '../src/pedagogy/ui/ReferenceSectionBlock.tsx';
import type { SyntaxTooltipContent } from '../src/pedagogy/ui/SyntaxTooltip.tsx';

/** The jargon a first lesson on SMILES cannot avoid. */
export const SMILES_GLOSSARY: Glossary = {
  smiles: {
    title: 'SMILES',
    summary:
      'A line notation that writes a structure as a walk through it: atoms as their element symbols, bonds as the characters between them.',
    examples: [
      { code: 'CCO', note: 'ethanol — two carbons, then the hydroxyl oxygen' },
      { code: 'c1ccccc1', note: 'benzene, written with aromatic atoms' },
    ],
  },
  'organic subset': {
    title: 'Organic subset',
    summary:
      'B, C, N, O, P, S, F, Cl, Br and I may be written bare, with no brackets. Anything else — a charge, an isotope, a metal — goes inside square brackets.',
    examples: [
      { code: 'ClCCl', note: 'dichloromethane; Cl is read as one symbol' },
      {
        code: '[Se]',
        note: 'selenium is outside the subset, so it is bracketed',
      },
    ],
  },
  'implicit hydrogen': {
    title: 'Implicit hydrogen',
    summary:
      'An atom of the organic subset is filled up to its normal valence with hydrogens, so they are almost never written.',
    examples: [
      { code: 'C', note: 'one carbon and four hydrogens: methane' },
      { code: 'O', note: 'water, for the same reason' },
    ],
  },
  branch: {
    title: 'Branch',
    summary:
      'Parentheses hang a side chain off the atom before them, then return the walk to that atom.',
    examples: [
      { code: 'CC(C)C', note: 'isobutane — the middle carbon carries three' },
      { code: 'CC(=O)O', note: 'acetic acid: the carbonyl is the branch' },
    ],
  },
  'ring closure': {
    title: 'Ring closure',
    summary:
      'A digit after two atoms bonds them to each other, which is how a ring is closed without writing the same atom twice.',
    examples: [
      { code: 'C1CCCCC1', note: 'cyclohexane — six atoms between the two 1s' },
      { code: 'C1CC1', note: 'cyclopropane; the digit is reused freely after' },
    ],
  },
  'aromatic atom': {
    title: 'Aromatic atom',
    summary:
      'A lowercase symbol says the atom belongs to an aromatic ring, and the bonds around it are aromatic without being written.',
    examples: [
      { code: 'c1ccccc1', note: 'benzene' },
      { code: 'c1ccc2ccccc2c1', note: 'naphthalene, two rings sharing a bond' },
    ],
  },
  'bracket atom': {
    title: 'Bracket atom',
    summary:
      'Square brackets are where an atom carries anything unusual: an isotope, a charge, an explicit hydrogen count, a chirality.',
    examples: [
      {
        code: '[NH4+]',
        input: 'ammonium',
        note: 'charge and H count together',
      },
      { code: '[13CH4]', input: 'carbon-13 methane', note: 'isotope in front' },
    ],
  },
  stereocentre: {
    title: 'Stereocentre',
    summary:
      'An @ inside the brackets orders the neighbours anticlockwise as they are written, @@ clockwise. It is a local instruction, not an R/S label.',
    examples: [
      { code: 'N[C@@H](C)C(=O)O', input: 'L-alanine', note: 'the natural one' },
      { code: 'N[C@H](C)C(=O)O', input: 'D-alanine', note: 'its mirror image' },
    ],
  },
  'double bond': {
    title: 'Double bond',
    summary:
      'An = between two atoms. A single bond needs no character at all, so the ones that are written are the ones that matter.',
    examples: [
      { code: 'C=C', note: 'ethene' },
      { code: 'CC(=O)C', note: 'acetone, whose carbonyl sits in a branch' },
    ],
  },
};

/**
 * A paragraph of the kind a tutorial step carries: several linked terms, and
 * one — `canonicalisation` — that nobody has written a definition for yet.
 */
export const SMILES_PARAGRAPH =
  'A [[smiles|SMILES]] string writes a structure the way you would walk it: CCO is ethanol, and every atom of the [[organic subset]] fills in its own [[implicit hydrogen|hydrogens]]. Parentheses open a [[branch]] — CC(=O)O is acetic acid — a repeated digit closes a ring ([[ring closure]]), and benzene is six [[aromatic atom|aromatic atoms]] in a row, c1ccccc1. Which of two equally valid strings a program should hand back is [[canonicalisation]], and that is a separate question.';

/** A shorter one, for a story that has to fit next to something else. */
export const SMILES_SENTENCE =
  'Write the [[bracket atom|bracketed]] form whenever an atom carries a charge, an isotope or a [[stereocentre]].';

/**
 * One exercise's ladder, exported on its own: a nudge, then the construct, then
 * almost the answer.
 */
export const ALANINE_HINTS: string[] = [
  'The α carbon carries four different neighbours, so it needs brackets.',
  'Inside the brackets the hydrogen is written out, right after the @ or @@.',
  'Start the walk at the nitrogen, and the natural form is the @@ one.',
];

/** Six exercises, two per level, of the kind the Exercises tab hands out. */
export const SMILES_EXERCISES: BaseExercise[] = [
  {
    id: 'ethanol',
    title: 'Ethanol',
    level: 'beginner',
    description:
      'Write ethanol as a [[smiles|SMILES]] string. Its [[implicit hydrogen|hydrogens]] are filled in for you.',
    hints: [
      'Carbon is C and oxygen is O; nothing else has to be written.',
      'Walk the molecule: carbon, carbon, then the oxygen of the hydroxyl.',
      'Three characters, no bond symbols at all.',
    ],
    solution: 'CCO',
  },
  {
    id: 'propan-2-ol',
    title: 'Propan-2-ol',
    level: 'beginner',
    description:
      'Write propan-2-ol, whose hydroxyl sits on the middle carbon. You will need a [[branch]].',
    hints: [
      'Start on an end carbon and walk to the middle one.',
      'Hang the third carbon off the middle atom in parentheses, then carry on to the oxygen.',
    ],
    solution: 'CC(C)O',
  },
  {
    id: 'acetic-acid',
    title: 'Acetic acid',
    level: 'intermediate',
    description:
      'Write acetic acid. The carbonyl is a [[double bond]] and belongs in a [[branch]].',
    hints: [
      'The two oxygens are not the same: one is doubly bonded, one carries the acidic hydrogen.',
      'A branch may hold a bond symbol: (=O).',
      'Methyl, then the carboxyl carbon, then its two oxygens.',
    ],
    solution: 'CC(=O)O',
  },
  {
    id: 'benzene',
    title: 'Benzene',
    level: 'intermediate',
    description:
      'Write benzene with [[aromatic atom|aromatic atoms]] rather than alternating single and double bonds.',
    hints: [
      'Lowercase c is an aromatic carbon.',
      'Open the ring with a digit on the first atom and close it with the same digit on the last.',
    ],
    solution: 'c1ccccc1',
  },
  {
    id: 'l-alanine',
    title: 'L-alanine',
    level: 'advanced',
    description:
      'Write L-alanine, the natural enantiomer, with its [[stereocentre]] spelled out.',
    hints: ALANINE_HINTS,
    solution: 'N[C@@H](C)C(=O)O',
  },
  {
    id: 'paracetamol',
    title: 'Paracetamol',
    level: 'advanced',
    description:
      'Write paracetamol: an acetamide on a para-substituted phenol. Every construct of this tour is in it.',
    hints: [
      'Build it in three pieces: the acetyl, the amide nitrogen, the ring.',
      'A substituent on an aromatic ring is a branch hanging off a lowercase atom.',
      'Para means three ring atoms between the two substituents, either way round.',
    ],
    solution: 'CC(=O)Nc1ccc(O)cc1',
  },
];

/** What a step of this tour preloads into the live playground. */
export interface SmilesStepPayload {
  /** The string the step opens on, which the student is free to edit. */
  smiles: string;
  /** What that string is, in words. */
  compound: string;
}

/** One stop of the SMILES tour. */
export type SmilesTutorialStep = TutorialStep<SmilesStepPayload>;

/** Ten steps, four green, three amber, three pink. */
export const SMILES_TUTORIAL: SmilesTutorialStep[] = [
  {
    id: 'atoms',
    title: 'Atoms in a row',
    level: 'beginner',
    description:
      'Write the atoms in the order you walk them. Neighbours written next to each other are bonded, so a chain needs no bond symbol at all.',
    smiles: 'CCO',
    compound: 'ethanol',
  },
  {
    id: 'implicit-hydrogens',
    title: 'The hydrogens fill themselves in',
    level: 'beginner',
    description:
      'One character is a molecule: an atom of the [[organic subset]] is completed to its normal valence, so C alone is methane.',
    smiles: 'C',
    compound: 'methane',
  },
  {
    id: 'branches',
    title: 'Branches',
    level: 'beginner',
    description:
      'A [[branch]] in parentheses hangs off the atom before it, then the walk returns to that atom and carries on.',
    smiles: 'CC(C)C',
    compound: 'isobutane',
  },
  {
    id: 'double-bonds',
    title: 'Double and triple bonds',
    level: 'beginner',
    description:
      'A [[double bond]] is =, a triple one #. Single bonds stay unwritten, which keeps the interesting ones visible.',
    smiles: 'CC(=O)C',
    compound: 'acetone',
  },
  {
    id: 'rings',
    title: 'Closing a ring',
    level: 'intermediate',
    description:
      'A [[ring closure]] digit bonds the two atoms that carry it. Count the atoms between the digits: that is the ring size.',
    smiles: 'C1CCCCC1',
    compound: 'cyclohexane',
  },
  {
    id: 'aromatic-rings',
    title: 'Aromatic rings',
    level: 'intermediate',
    description:
      'Lowercase says [[aromatic atom|aromatic]]. Benzene is six of them; edit one c to C and the ring stops making sense to a parser.',
    smiles: 'c1ccccc1',
    compound: 'benzene',
  },
  {
    id: 'brackets',
    title: 'Brackets, charges and dots',
    level: 'intermediate',
    description:
      'A [[bracket atom]] carries what a bare symbol cannot, and a dot separates species that are not bonded at all.',
    smiles: '[Na+].[Cl-]',
    compound: 'sodium chloride',
  },
  {
    id: 'stereocentres',
    title: 'Stereocentres',
    level: 'advanced',
    description:
      'A [[stereocentre]] orders its neighbours as they are written, so moving the nitrogen to the end changes @@ into @ without changing the molecule.',
    smiles: 'N[C@@H](C)C(=O)O',
    compound: 'L-alanine',
  },
  {
    id: 'double-bond-geometry',
    title: 'Double bond geometry',
    level: 'advanced',
    description:
      'The slashes mark the two single bonds around a double one, never the double bond itself. Same side, same slash direction.',
    smiles: 'F/C=C/F',
    compound: '(E)-1,2-difluoroethene',
  },
  {
    id: 'fused-rings',
    title: 'Fused rings',
    level: 'advanced',
    description:
      'Two open ring digits at once: the second closes the ring the first is still walking through, which is how a fused system is written.',
    smiles: 'c1ccc2ccccc2c1',
    compound: 'naphthalene',
  },
];

/** How much of a twelve-exercise set an average student has done. */
export const PARTIAL_PROGRESS: ProgressSummary = {
  solved: 4,
  attempted: 3,
  total: 12,
  ratio: 4 / 12,
};

/** A set nobody has opened yet. */
export const FRESH_PROGRESS: ProgressSummary = {
  solved: 0,
  attempted: 0,
  total: 12,
  ratio: 0,
};

/** A finished set, which is what turns the bar green. */
export const COMPLETE_PROGRESS: ProgressSummary = {
  solved: 12,
  attempted: 0,
  total: 12,
  ratio: 1,
};

/** A graded case of a substructure-query exercise. */
export interface QueryTestCaseResult extends TestCaseResult {
  /** The molecule the query was run on. */
  smiles: string;
  /** What that molecule is called, so a row reads like a chemistry problem. */
  name: string;
}

/**
 * The verdict on `C(=O)O` typed for "match every carboxylic acid, and nothing
 * else": right on the acids, wrong on the ester it also swallows.
 */
export const QUERY_TEST_CASES: QueryTestCaseResult[] = [
  {
    name: 'acetic acid',
    smiles: 'CC(=O)O',
    passed: true,
    reason: 'matched once, on C2–O3, and one match is what was wanted',
    actual: 'C(=O)O',
  },
  {
    name: 'benzoic acid',
    smiles: 'OC(=O)c1ccccc1',
    passed: true,
    reason: 'matched once; the aromatic ring is left alone, as it should be',
    actual: 'OC(=O)',
  },
  {
    name: 'methyl acetate',
    smiles: 'CC(=O)OC',
    passed: false,
    reason:
      'matched, but an ester is not an acid — ask for the hydroxyl hydrogen with [OX2H1] and this one stops matching',
    actual: 'C(=O)O',
  },
  {
    name: 'malonic acid',
    smiles: 'OC(=O)CC(=O)O',
    passed: false,
    reason: 'matched 1 group, expected 2: both acids have to be found',
    actual: 'OC(=O)',
  },
  {
    name: 'ethanol',
    smiles: 'CCO',
    passed: true,
    reason: 'not matched, and it should not be: there is no carbonyl',
    actual: null,
  },
  {
    name: 'acetamide',
    smiles: 'CC(=O)N',
    passed: true,
    reason: 'not matched — the nitrogen is not an oxygen',
    actual: null,
  },
];

/** The same six once the query reads `[CX3](=O)[OX2H1]`. */
export const SOLVED_TEST_CASES: QueryTestCaseResult[] = [
  {
    name: 'acetic acid',
    smiles: 'CC(=O)O',
    passed: true,
    reason: 'matched once, on C2–O3, and one match is what was wanted',
    actual: 'CC(=O)[OH]',
  },
  {
    name: 'benzoic acid',
    smiles: 'OC(=O)c1ccccc1',
    passed: true,
    reason: 'matched once; the aromatic ring is left alone, as it should be',
    actual: '[OH]C(=O)',
  },
  {
    name: 'methyl acetate',
    smiles: 'CC(=O)OC',
    passed: true,
    reason: 'not matched: the ester oxygen carries a carbon, not a hydrogen',
    actual: null,
  },
  {
    name: 'malonic acid',
    smiles: 'OC(=O)CC(=O)O',
    passed: true,
    reason: 'matched 2 groups, which is both of them',
    actual: '[OH]C(=O), C(=O)[OH]',
  },
  {
    name: 'ethanol',
    smiles: 'CCO',
    passed: true,
    reason: 'not matched, and it should not be: there is no carbonyl',
    actual: null,
  },
  {
    name: 'acetamide',
    smiles: 'CC(=O)N',
    passed: true,
    reason: 'not matched — the nitrogen is not an oxygen',
    actual: null,
  },
];

/** One construct, described the way every cheatsheet row of a tool is. */
export const AROMATIC_SYNTAX: SyntaxTooltipContent = {
  syntax: 'c',
  name: 'Aromatic atom',
  tag: 'OpenSMILES §3.1.5',
  summary: 'A lowercase element symbol: the atom is part of an aromatic ring.',
  detail:
    'The bonds around it are aromatic without being written, so a lowercase ring needs no alternating = at all. A parser that cannot perceive an aromatic system in what you wrote rejects the string rather than guessing.',
  example: {
    code: 'c1ccccc1',
    input: 'benzene',
    note: 'Uppercase C1CCCCC1 is cyclohexane — a different molecule.',
  },
};

/** A second one, for a story showing two of them side by side. */
export const RING_CLOSURE_SYNTAX: SyntaxTooltipContent = {
  syntax: '1',
  name: 'Ring closure',
  summary: 'A digit bonds the two atoms that carry it.',
  detail:
    'The digit is a label, not a position: it is free again the moment the ring closes, so one string may reuse 1 a dozen times. Ten and above are written %10.',
  example: {
    code: 'C1CCCCC1',
    input: 'cyclohexane',
    note: 'Six atoms between the two 1s, so a six-membered ring.',
  },
};

/** The atoms block, whose rows all open a long description on hover. */
export const ATOMS_SECTION: ReferenceSection = {
  id: 'atoms',
  title: 'Atoms',
  intro: 'The organic subset is written bare; everything else is bracketed.',
  color: '#1c6e42',
  rows: [
    {
      syntax: 'C',
      description: 'Aliphatic carbon, filled up to four bonds with hydrogens.',
      tooltip: {
        syntax: 'C',
        name: 'Aliphatic carbon',
        summary: 'One carbon, with its hydrogens implied.',
        detail:
          'B, C, N, O, P, S, F, Cl, Br and I need no brackets. Two-letter symbols are read greedily, so Cl is always chlorine.',
        example: {
          code: 'C',
          input: 'methane',
          note: 'Four hydrogens, none of them written.',
        },
      },
    },
    {
      syntax: 'c',
      description: 'Aromatic carbon, as in c1ccccc1.',
      tooltip: AROMATIC_SYNTAX,
    },
    {
      syntax: '[Na+]',
      description: 'Bracket atom: isotope, charge, H count and chirality.',
    },
    {
      syntax: '[nH]',
      description: 'The NH of pyrrole — an aromatic nitrogen with one H.',
    },
    {
      syntax: '*',
      description: 'Any atom; mostly seen in the SMARTS dialect.',
    },
  ],
};

/** The bonds block. */
export const BONDS_SECTION: ReferenceSection = {
  id: 'bonds',
  title: 'Bonds',
  intro: 'A single bond is written by writing nothing.',
  color: '#b45309',
  rows: [
    { syntax: '-', description: 'Single bond, almost always left out.' },
    {
      syntax: '=',
      description: 'Double bond: CC(=O)C is acetone.',
      tooltip: {
        syntax: '=',
        name: 'Double bond',
        summary: 'Two atoms sharing two pairs.',
        detail:
          'Written between the atoms, or as the first character inside a branch. Between two lowercase atoms it is wrong: aromaticity has already said it.',
        example: {
          code: 'CC(=O)C',
          input: 'acetone',
          note: 'The carbonyl sits inside the branch.',
        },
      },
    },
    { syntax: '#', description: 'Triple bond: C#N is hydrogen cyanide.' },
    {
      syntax: ':',
      description: 'Aromatic bond, implied between lowercase atoms.',
    },
    {
      syntax: '.',
      description: 'No bond: [Na+].[Cl-] is two species in one string.',
    },
  ],
};

/** The branches and rings block. */
export const BRANCHES_SECTION: ReferenceSection = {
  id: 'branches-rings',
  title: 'Branches and rings',
  color: '#4338ca',
  rows: [
    {
      syntax: '( )',
      description: 'Branch off the previous atom: CC(C)C is isobutane.',
      tooltip: {
        syntax: '( )',
        name: 'Branch',
        summary: 'A side chain, after which the walk returns.',
        detail:
          'Branches nest, and the last substituent is usually written outside them: CC(=O)O has one branch, not two.',
        example: {
          code: 'CC(C)C',
          input: 'isobutane',
          note: 'The middle carbon carries three methyls.',
        },
      },
    },
    {
      syntax: '1',
      description: 'Ring closure: C1CCCCC1 is cyclohexane.',
      tooltip: RING_CLOSURE_SYNTAX,
    },
    {
      syntax: '2',
      description: 'A second ring open at once — c1ccc2ccccc2c1.',
    },
    { syntax: '%10', description: 'Ring closure numbered ten or above.' },
  ],
};

/** The stereochemistry block. */
export const STEREOCHEMISTRY_SECTION: ReferenceSection = {
  id: 'stereochemistry',
  title: 'Stereochemistry',
  intro: 'All of these are local instructions, not R/S or E/Z labels.',
  color: '#be123c',
  rows: [
    {
      syntax: '[C@H]',
      description: 'Neighbours anticlockwise, in the order they are written.',
      tooltip: {
        syntax: '@',
        name: 'Anticlockwise stereocentre',
        summary: 'Look from the first neighbour: the rest run anticlockwise.',
        detail:
          'Because the order is the written one, reordering the atoms flips the symbol without changing the molecule — two correct strings for one enantiomer may disagree on @ and @@.',
        example: {
          code: 'N[C@H](C)C(=O)O',
          input: 'D-alanine',
          note: 'The unnatural enantiomer.',
        },
      },
    },
    {
      syntax: '[C@@H]',
      description: 'The mirror image: N[C@@H](C)C(=O)O is L-alanine.',
    },
    {
      syntax: '/',
      description: 'Geometry of a double bond: F/C=C/F is the E isomer.',
    },
    {
      syntax: '\\',
      description: 'The other direction; the pair is read together.',
    },
  ],
};

/**
 * A block shipped before anybody wrote its long descriptions: every row is
 * plain text rather than a chip that opens nothing.
 */
export const GROUPS_SECTION: ReferenceSection = {
  id: 'groups',
  title: 'Functional groups, written out',
  rows: [
    { syntax: 'C(=O)O', description: 'Carboxylic acid' },
    { syntax: 'C(=O)N', description: 'Amide' },
    { syntax: 'C#N', description: 'Nitrile' },
    { syntax: '[N+](=O)[O-]', description: 'Nitro group' },
    { syntax: 'S(=O)(=O)O', description: 'Sulfonic acid' },
  ],
};

/** The whole cheatsheet a student prints and takes into the exam room. */
export const SMILES_REFERENCE: ReferenceSection[] = [
  ATOMS_SECTION,
  BONDS_SECTION,
  BRANCHES_SECTION,
  STEREOCHEMISTRY_SECTION,
  GROUPS_SECTION,
];

/** A block the printed sheet drops, since a pointer is the whole point of it. */
export const SCREEN_ONLY_SECTION: ReferenceSection = {
  id: 'on-screen',
  title: 'Only on screen',
  intro: 'Hover any dotted row for the long story.',
  color: '#5b6875',
  noPrint: true,
  rows: [
    {
      syntax: 'Enter',
      description: 'Parse what is in the box and redraw the structure.',
    },
    { syntax: 'Alt-click', description: 'Copy the canonical form back.' },
  ],
};
