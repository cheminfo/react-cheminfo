/**
 * A small graded series for the tests: count the electrons of an ion.
 */

import {
  emptyCase,
  readAnswerNumber,
  unreadableCase,
} from '../../core/answers.ts';
import type { SeriesTool } from '../../core/series.ts';
import { finishValidation } from '../../core/validation.ts';

/** One ion a question asks about. */
export interface Ion {
  formula: string;
  name: string;
  protons: number;
  charge: number;
}

export const IONS: readonly Ion[] = [
  { formula: 'Na+', name: 'the sodium ion', protons: 11, charge: 1 },
  { formula: 'Cl-', name: 'the chloride ion', protons: 17, charge: -1 },
  { formula: 'Fe3+', name: 'the iron(III) ion', protons: 26, charge: 3 },
  { formula: 'O2-', name: 'the oxide ion', protons: 8, charge: -2 },
  { formula: 'Mg2+', name: 'the magnesium ion', protons: 12, charge: 2 },
  { formula: 'Al3+', name: 'the aluminium ion', protons: 13, charge: 3 },
];

export const ELECTRONS: SeriesTool<Ion> = {
  id: 'electrons',
  pool: IONS,
  key: (ion) => ion.formula,
  level: (ion) => (Math.abs(ion.charge) > 1 ? 'intermediate' : 'beginner'),
  fields: () => [{ key: 'electrons', label: 'Electrons' }],
  grade(ion, answers) {
    const typed = answers.electrons ?? '';
    const expected = ion.protons - ion.charge;
    if (typed.trim() === '') {
      return finishValidation([
        emptyCase('Electrons', 'a number of electrons'),
      ]);
    }
    const value = readAnswerNumber(typed, true);
    if (value === undefined) {
      return finishValidation([
        unreadableCase('Electrons', typed, 'a whole number'),
      ]);
    }
    return finishValidation([
      {
        label: 'Electrons',
        passed: value === expected,
        reason:
          value === expected
            ? `${value} electrons`
            : `${value} electrons, expected ${expected}`,
        actual: typed,
      },
    ]);
  },
  hints: (ion) => [
    'Count the protons first.',
    'A positive charge is electrons taken away.',
    `It has ${ion.protons} protons.`,
  ],
  solution: (ion) =>
    `${ion.protons} protons, charge ${ion.charge}: ${ion.protons - ion.charge} electrons.`,
};

/** The two answers the sign of a charge offers, the second one a formula. */
export const SIGN_CHOICES = [
  { value: 'cation', label: 'a cation' },
  { value: 'anion', label: 'an anion, like {{Cl-}}' },
] as const;

/** A tool whose one field is a pick: is the ion a cation or an anion? */
export const SIGNS: SeriesTool<Ion> = {
  id: 'signs',
  pool: IONS,
  key: (ion) => ion.formula,
  fields: () => [{ key: 'sign', label: 'The ion is', choices: SIGN_CHOICES }],
  grade(ion, answers) {
    const picked = answers.sign ?? '';
    const expected = ion.charge > 0 ? 'cation' : 'anion';
    if (picked === '') {
      return finishValidation([emptyCase('The ion is', 'one of the answers')]);
    }
    return finishValidation([
      {
        label: 'The ion is',
        passed: picked === expected,
        reason:
          picked === expected ? picked : `${picked}, expected ${expected}`,
        actual: picked,
      },
    ]);
  },
  hints: () => ['Look at the sign of the charge.', 'A cation lost electrons.'],
  solution: (ion) =>
    `Its charge is ${ion.charge}, so it is a ${ion.charge > 0 ? 'cation' : 'anion'}.`,
};
