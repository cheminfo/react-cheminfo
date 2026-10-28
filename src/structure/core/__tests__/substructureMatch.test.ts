import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { substructureMatch } from '../substructureMatch.ts';

/**
 * The idCode a drawing editor in query mode hands back.
 * @param smiles - The query.
 * @returns Its idCode, flagged as a fragment.
 */
function fragmentIdCode(smiles: string): string {
  const fragment = Molecule.fromSmiles(smiles);
  fragment.setFragment(true);
  return fragment.getIDCode();
}

const ASPIRIN = Molecule.fromSmiles('CC(=O)Oc1ccccc1C(=O)O');

test('the atoms and bonds of the match are returned, in ascending order', () => {
  const match = substructureMatch(ASPIRIN, fragmentIdCode('c1ccccc1'));

  expect(match).toStrictEqual({
    atoms: [4, 5, 6, 7, 8, 9],
    bonds: [4, 5, 6, 7, 8, 9],
  });
});

test('every match is painted, and only the bonds of the query', () => {
  const biphenyl = Molecule.fromSmiles('c1ccccc1-c1ccccc1');
  const match = substructureMatch(biphenyl, fragmentIdCode('c1ccccc1'));

  expect(match.atoms).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  // The bond joining the two rings is no bond of a benzene ring.
  expect(match.bonds).not.toContain(biphenyl.getBond(5, 6));
  expect(match.bonds).toHaveLength(12);
});

test('a ring closed between matched atoms stays unpainted when the query is open', () => {
  const cyclohexane = Molecule.fromSmiles('C1CCCCC1');
  const match = substructureMatch(cyclohexane, fragmentIdCode('CCCCCC'));

  expect(match.atoms).toStrictEqual([0, 1, 2, 3, 4, 5]);
  expect(match.bonds).toHaveLength(5);
});

test('a query drawn as a whole molecule is still read as a fragment', () => {
  const query = Molecule.fromSmiles('CC(=O)O').getIDCode();
  const match = substructureMatch(ASPIRIN, query);

  // The ester, and the acid with its ring carbon standing in for the methyl.
  expect(match.atoms).toStrictEqual([0, 1, 2, 3, 9, 10, 11, 12]);
});

test('the coordinates an editor appends to the idCode are ignored', () => {
  const fragment = Molecule.fromSmiles('c1ccccc1');
  fragment.setFragment(true);
  const { idCode, coordinates } = fragment.getIDCodeAndCoordinates();
  const match = substructureMatch(ASPIRIN, `${idCode} ${coordinates}`);

  expect(match.atoms).toStrictEqual([4, 5, 6, 7, 8, 9]);
});

test('no match, and nothing drawn, both paint nothing', () => {
  const empty = { atoms: [], bonds: [] };

  expect(substructureMatch(ASPIRIN, fragmentIdCode('ClCCl'))).toStrictEqual(
    empty,
  );
  expect(substructureMatch(ASPIRIN, '')).toStrictEqual(empty);
  expect(substructureMatch(ASPIRIN, 'dH')).toStrictEqual(empty);
});
