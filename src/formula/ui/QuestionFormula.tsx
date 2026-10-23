import type { ReactElement } from 'react';
import { MF } from 'react-mf';

import { normalizeFormula } from '../core/normalizeFormula.ts';

/** What {@link QuestionFormula} draws. */
export interface QuestionFormulaProps {
  /** The formula, as the data writes it, in whatever notation it gives a charge. */
  formula: string;
}

/**
 * A formula as the list of a series names its question: subscripts and charge
 * drawn, whatever notation the data writes the charge in.
 * @param props - The formula.
 * @returns The formula.
 */
export function QuestionFormula(props: QuestionFormulaProps): ReactElement {
  return <MF mf={normalizeFormula(props.formula)} />;
}
