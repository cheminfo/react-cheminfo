/**
 * A graded series as a site would write one — count the electrons of an ion —
 * so the series components are looked at holding real questions.
 */

import type { ReactNode } from 'react';
import { MF } from 'react-mf';

import { normalizeFormula } from '../src/formula/core/normalizeFormula.ts';
import {
  emptyCase,
  readAnswerNumber,
  unreadableCase,
} from '../src/pedagogy/core/answers.ts';
import type { Attempt, AttemptStore } from '../src/pedagogy/core/attempts.ts';
import { createAttemptStore } from '../src/pedagogy/core/attempts.ts';
import type { ProgressRecords } from '../src/pedagogy/core/progress.ts';
import type { SeriesTool } from '../src/pedagogy/core/series.ts';
import { finishValidation } from '../src/pedagogy/core/validation.ts';

/** One ion a question asks about. */
export interface Ion {
  formula: string;
  name: string;
  protons: number;
  charge: number;
}

const IONS: readonly Ion[] = [
  { formula: 'Na+', name: 'the sodium ion', protons: 11, charge: 1 },
  { formula: 'Cl-', name: 'the chloride ion', protons: 17, charge: -1 },
  { formula: 'Fe(3+)', name: 'the iron(III) ion', protons: 26, charge: 3 },
  { formula: 'O(2-)', name: 'the oxide ion', protons: 8, charge: -2 },
  { formula: 'Mg(2+)', name: 'the magnesium ion', protons: 12, charge: 2 },
  { formula: 'Al(3+)', name: 'the aluminium ion', protons: 13, charge: 3 },
  { formula: 'SO4--', name: 'the sulfate ion', protons: 48, charge: -2 },
  { formula: 'NH4+', name: 'the ammonium ion', protons: 11, charge: 1 },
  { formula: 'NO3-', name: 'the nitrate ion', protons: 31, charge: -1 },
  { formula: 'Cu(2+)', name: 'the copper(II) ion', protons: 29, charge: 2 },
  { formula: 'S(2-)', name: 'the sulfide ion', protons: 16, charge: -2 },
  { formula: 'K+', name: 'the potassium ion', protons: 19, charge: 1 },
];

/** The tool: one box, graded as a tutor would. */
export const ELECTRONS: SeriesTool<Ion> = {
  id: 'electrons',
  pool: IONS,
  key: (ion) => ion.formula,
  level: (ion) => (Math.abs(ion.charge) > 1 ? 'intermediate' : 'beginner'),
  fields: () => [{ key: 'electrons', label: 'Electrons', placeholder: '10' }],
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
            : `${value} electrons, expected ${value < expected ? 'more' : 'fewer'}`,
        actual: typed,
      },
    ]);
  },
  hints: (ion) => [
    'Count the protons first: the formula gives them, element by element.',
    'A positive charge is electrons taken away; a negative one, electrons added.',
    `It has ${ion.protons} protons and a charge of ${ion.charge}.`,
  ],
  solution: (ion) =>
    `${ion.protons} protons and a charge of ${ion.charge} leave ${ion.protons - ion.charge} electrons.`,
};

/**
 * How a question is named in the list: its formula, drawn.
 * @param ion - The question.
 * @returns The formula.
 */
export function ionLabel(ion: Ion): ReactNode {
  return <MF mf={normalizeFormula(ion.formula)} />;
}

/**
 * The statement of a question.
 * @param ion - The question.
 * @returns The statement.
 */
export function ionPrompt(ion: Ion): ReactNode {
  return (
    <p>
      How many electrons has {ion.name},{' '}
      <MF mf={normalizeFormula(ion.formula)} />?
    </p>
  );
}

/**
 * A store kept in memory, so every story opens on the same attempts.
 * @param records - What the student is said to have done already.
 * @returns The store.
 */
export function storyStore(
  records: ProgressRecords<Attempt> = {},
): AttemptStore {
  return createAttemptStore({
    key: 'story',
    binding: { name: 'this story', load: () => records, save: () => undefined },
  });
}
