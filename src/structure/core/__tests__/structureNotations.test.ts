import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import type { StructureNotationKind } from '../structureNotations.ts';
import { structureNotations } from '../structureNotations.ts';

const CAFFEINE = 'CN1C=NC2=C1C(=O)N(C)C(=O)N2C';

function notationsOf(smiles: string): Map<StructureNotationKind, string> {
  const written = new Map<StructureNotationKind, string>();
  for (const notation of structureNotations(Molecule.fromSmiles(smiles))) {
    written.set(notation.kind, notation.value);
  }
  return written;
}

test('the notations come in the order the dialog shows them', () => {
  const kinds = structureNotations(Molecule.fromSmiles(CAFFEINE)).map(
    (notation) => notation.kind,
  );

  expect(kinds).toStrictEqual([
    'smiles',
    'molfileV3000',
    'molfileV2000',
    'idCode',
    'noStereoIdCode',
    'noStereoTautomerIdCode',
  ]);
});

test('caffeine is written every way, each in its own dialect', () => {
  const written = notationsOf(CAFFEINE);

  expect(written.get('idCode')).toBe(String.raw`dg|d@Dq]@\bbbbfJSSimUSTs@@`);
  expect(written.get('smiles')).toBe('C[n]1c(C(N(C)C(N2C)=O)=O)c2nc1');
  expect(written.get('molfileV2000')).toContain('V2000');
  expect(written.get('molfileV3000')).toContain('M  V30 BEGIN CTAB');
});

test('the canonical identifiers are the three idCodes, and nothing else', () => {
  const notations = structureNotations(Molecule.fromSmiles(CAFFEINE));
  const canonical = notations.filter((notation) => notation.canonical);

  expect(canonical.map((notation) => notation.kind)).toStrictEqual([
    'idCode',
    'noStereoIdCode',
    'noStereoTautomerIdCode',
  ]);
});

test('the two enantiomers of alanine differ by idCode and agree without stereo', () => {
  const r = notationsOf('C[C@H](N)C(=O)O');
  const s = notationsOf('C[C@@H](N)C(=O)O');

  expect(r.get('idCode')).not.toBe(s.get('idCode'));
  expect(r.get('noStereoIdCode')).toBe(s.get('noStereoIdCode'));
  expect(r.get('noStereoIdCode')).toBe('gGX`BDdwMT@@');
});

test('the keto and the enol form of acetone agree on the tautomer idCode', () => {
  const keto = notationsOf('CC(=O)C');
  const enol = notationsOf('CC(O)=C');

  expect(keto.get('idCode')).not.toBe(enol.get('idCode'));
  expect(keto.get('noStereoTautomerIdCode')).toBe(
    enol.get('noStereoTautomerIdCode'),
  );
});

test('the molfiles are saved under names that cannot collide', () => {
  const files = structureNotations(Molecule.fromSmiles(CAFFEINE))
    .filter((notation) => notation.file !== undefined)
    .map(
      (notation) => `name${notation.file?.suffix}.${notation.file?.extension}`,
    );

  expect(files).toStrictEqual(['name-v3000.mol', 'name-v2000.mol']);
});

test('a structure with no atom is written as empty strings, not thrown on', () => {
  const notations = structureNotations(new Molecule(0, 0));

  expect(notations).toHaveLength(6);
  expect(notations[0]?.value).toBe('');
});
