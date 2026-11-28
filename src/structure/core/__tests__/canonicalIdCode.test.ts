import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { isIdCodeText, readCanonicalIdCode } from '../canonicalIdCode.ts';
import { readIdCodeStrictly } from '../readIdCodeStrictly.ts';

const BENZENE = 'gFp@DiTt@@@';

function decode(idCode: string, coordinates?: string): Molecule {
  return coordinates === undefined
    ? Molecule.fromIDCode(idCode)
    : Molecule.fromIDCode(idCode, coordinates);
}

test('a canonical idCode is read, with or without the editor’s coordinates', () => {
  expect(readCanonicalIdCode(BENZENE, decode)?.getIDCode()).toBe(BENZENE);
  expect(readCanonicalIdCode(` ${BENZENE} `, decode)?.getIDCode()).toBe(
    BENZENE,
  );

  const drawn = Molecule.fromSmiles('c1ccccc1');
  drawn.inventCoordinates();
  const withCoordinates = `${drawn.getIDCode()} ${drawn.getIDCoordinates()}`;
  const kept = readCanonicalIdCode(withCoordinates, decode, {
    coordinates: 'keep',
  });

  expect(kept?.getIDCode()).toBe(BENZENE);
  expect(readCanonicalIdCode(withCoordinates, decode)?.getIDCode()).toBe(
    BENZENE,
  );
});

test('a word that decodes into some other molecule is no idCode', () => {
  expect(readCanonicalIdCode('ethanol', decode)).toBeNull();
  expect(readCanonicalIdCode('notanidcode', decode)).toBeNull();
});

test('text an idCode never holds is not even decoded', () => {
  const decoded: string[] = [];
  const spy = (idCode: string) => {
    decoded.push(idCode);
    return Molecule.fromIDCode(idCode);
  };

  expect(readCanonicalIdCode('O=Cc1ccccc1', spy)).toBeNull();
  expect(readCanonicalIdCode('', spy)).toBeNull();
  expect(decoded).toStrictEqual([]);
  expect(isIdCodeText(BENZENE)).toBe(true);
  expect(isIdCodeText('C1CC')).toBe(false);
});

test('a decoder that throws reads as no idCode', () => {
  expect(
    readCanonicalIdCode(BENZENE, () => {
      throw new Error('unreadable');
    }),
  ).toBeNull();
});

test('the strict reader hands back the molecule, or nothing', () => {
  expect(readIdCodeStrictly(BENZENE)?.getIDCode()).toBe(BENZENE);
  expect(readIdCodeStrictly('notanidcode')).toBeUndefined();
});
