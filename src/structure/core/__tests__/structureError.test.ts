import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { structureError } from '../structureError.ts';

test('the class name and the parser name are dropped, the position kept', () => {
  expect(
    structureError(
      new Error(
        'Class$S19: SmilesParser: dangling ring closure: 1; position:4',
      ),
    ),
  ).toStrictEqual({ message: 'Dangling ring closure: 1', position: 4 });
});

test('the position is read however it is capitalised', () => {
  expect(
    structureError(
      new Error(
        'Class$S19: SmilesParser: unknown element label found. Position:0',
      ),
    ),
  ).toStrictEqual({ message: 'Unknown element label found.', position: 0 });
});

test('the words that only lead up to the position go with it', () => {
  expect(
    structureError(
      new Error(
        'Class$S19: SmilesParser: closing bracket at unexpected position:2',
      ),
    ),
  ).toStrictEqual({ message: 'Closing bracket', position: 2 });
});

test('an error that names no position carries none', () => {
  expect(
    structureError(new Error('This idCode holds no atoms.')),
  ).toStrictEqual({ message: 'This idCode holds no atoms.' });
});

test('a real openchemlib failure is read, position included', () => {
  let caught: unknown;
  try {
    Molecule.fromSmiles('CCOQCC');
  } catch (error) {
    caught = error;
  }

  expect(structureError(caught)).toStrictEqual({
    message: 'Unknown element label found.',
    position: 3,
  });
});

test('a thrown value that is not an Error still says something', () => {
  expect(structureError('boom')).toStrictEqual({ message: 'Boom' });
  expect(structureError(undefined)).toStrictEqual({
    message: 'This structure could not be read.',
  });
});

test('an error with an empty message still produces a sentence', () => {
  const silent = new Error('placeholder');
  silent.message = '';

  expect(structureError(silent)).toStrictEqual({
    message: 'This structure could not be read.',
  });
});
