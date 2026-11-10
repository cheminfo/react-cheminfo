import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { DEFAULT_CONFORMER_OPTIONS } from '../../../structure/core/conformerOptions.ts';
import { generateConformers } from '../../../structure/core/conformers.ts';
import { classifyMolfile } from '../../../structure/core/molfile.ts';
import type { MolfileDialect } from '../../../structure/core/molfileExport.ts';
import { writeMolfile } from '../../../structure/core/molfileExport.ts';
import { registerResources } from '../../../structure/core/oclResources.ts';
import type { MoleculeFileFormat } from '../moleculeFileFormats.ts';
import {
  moleculeFileAtoms,
  moleculeFileChoices,
  moleculeFileText,
} from '../moleculeFileFormats.ts';

/** Water at 0.96 Å, shorter than the bonds OpenChemLib's writer leaves alone. */
const WATER: ReadonlyArray<readonly [number, number, number]> = [
  [0.1, 0.2, 0.3],
  [1.06, 0.2, 0.3],
  [-0.1409, 1.1294, 0.3],
];

function water(): Molecule {
  const molecule = Molecule.fromSmiles('O');
  molecule.addImplicitHydrogens();
  molecule.setName('water');
  molecule.ensureHelperArrays(Molecule.cHelperNeighbours);
  const atoms = [
    0,
    molecule.getConnAtom(0, 0),
    molecule.getConnAtom(0, 1),
  ] as const;
  for (const [index, atom] of atoms.entries()) {
    const [x = 0, y = 0, z = 0] = WATER[index] ?? [];
    molecule.setAtomX(atom, x);
    molecule.setAtomY(atom, y);
    molecule.setAtomZ(atom, z);
  }
  return molecule;
}

// The distance between the first two atoms, read the way any tool reads a file.
function firstBond(text: string): number {
  const molecule = Molecule.fromMolfile(text);
  return Math.hypot(
    molecule.getAtomX(0) - molecule.getAtomX(1),
    molecule.getAtomY(0) - molecule.getAtomY(1),
    molecule.getAtomZ(0) - molecule.getAtomZ(1),
  );
}

function translate(key: string): string {
  return key;
}

test('a molfile is offered for a connection table of one model, and for nothing else', () => {
  const data = water().toMolfile();

  expect([
    moleculeFileAtoms({ format: 'mol', data }, 1),
    moleculeFileAtoms({ format: 'sdf', data: water().toMolfileV3() }, 1),
    moleculeFileAtoms({ format: 'mol', data }, 2),
    moleculeFileAtoms({ format: 'xyz', data: '1\n\nO 0 0 0\n' }, 1),
    moleculeFileAtoms({ format: 'mol', data: 'not a molfile' }, 1),
    moleculeFileAtoms(null, 1),
    moleculeFileAtoms(undefined, 1),
  ]).toStrictEqual([3, 3, 0, 0, 0, 0, 0]);
});

test('V2000 is greyed above what it holds', () => {
  expect(
    moleculeFileChoices(999, translate as never).map(({ value, disabled }) => [
      value,
      disabled ?? false,
    ]),
  ).toStrictEqual([
    ['molfileV2000', false],
    ['molfileV3000', false],
  ]);

  const [v2000, v3000] = moleculeFileChoices(1000, translate as never);

  expect(v2000?.disabled).toBe(true);
  expect(v2000?.title).toBe('molecule3d.molfileV2000TooLarge');
  expect(v3000?.disabled).toBeUndefined();
});

test('the dialect of the file comes back as it is, without its data fields', async () => {
  const data = water().toMolfile();
  const record = `${data}> <ID>\n1\n\n$$$$\n`;

  await expect(
    moleculeFileText({ format: 'sdf', data: record }, 'molfileV2000'),
  ).resolves.toBe(data);
});

test.each<[string, MolfileDialect, MoleculeFileFormat, MolfileDialect]>([
  ['V2000', 'v2000', 'molfileV3000', 'v3000'],
  ['V3000', 'v3000', 'molfileV2000', 'v2000'],
])(
  'a %s file is written in the other dialect, at the same coordinates',
  async (_name, dialect, format, version) => {
    const data = writeMolfile(water(), dialect);
    const text = await moleculeFileText({ format: 'sdf', data }, format);

    expect(classifyMolfile(text)).toStrictEqual({ version, atomCount: 3 });
    expect(firstBond(text)).toBeCloseTo(0.96, 3);
    expect(text.split('\n', 1)[0]).toBe('water');
    expect(Molecule.fromMolfile(text).getIDCode()).toBe(water().getIDCode());
  },
);

test('a short bond keeps its length in either dialect', () => {
  expect(firstBond(writeMolfile(water(), 'v2000'))).toBeCloseTo(0.96, 3);
  expect(firstBond(writeMolfile(water(), 'v3000'))).toBeCloseTo(0.96, 3);
});

test('a conformer keeps its stereocentre in either dialect', async () => {
  await registerResources();
  const alanine = Molecule.fromSmiles('C[C@H](N)C(O)=O');
  const [conformer] = generateConformers(alanine, {
    ...DEFAULT_CONFORMER_OPTIONS,
    maxConformers: 1,
    // The default wall-clock budget comes back empty on a loaded machine.
    timeoutSeconds: 60,
  }).conformers;
  const data = conformer?.molfile.data ?? '';
  const v3000 = await moleculeFileText({ format: 'mol', data }, 'molfileV3000');
  const v2000 = await moleculeFileText(
    { format: 'sdf', data: v3000 },
    'molfileV2000',
  );

  expect(Molecule.fromMolfile(data).toIsomericSmiles()).toBe(
    alanine.toIsomericSmiles(),
  );
  expect(Molecule.fromMolfile(v3000).toIsomericSmiles()).toBe(
    alanine.toIsomericSmiles(),
  );
  expect(Molecule.fromMolfile(v2000).toIsomericSmiles()).toBe(
    alanine.toIsomericSmiles(),
  );
});
