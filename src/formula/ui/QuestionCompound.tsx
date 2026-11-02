import type { ReactElement } from 'react';

import { CopyableFormula } from './CopyableFormula.tsx';

/** What {@link QuestionCompound} needs. */
export interface QuestionCompoundProps {
  /** The formula, as the data writes it. */
  formula: string;
  /**
   * The compound's name, written before the formula.
   * @default undefined
   */
  name?: string;
}

/**
 * The compound a question is about, as the line the question opens with: its
 * name, then its formula with subscripts and charge.
 * @param props - See {@link QuestionCompoundProps}.
 * @returns The line.
 */
export function QuestionCompound(props: QuestionCompoundProps): ReactElement {
  const { formula, name } = props;
  return (
    <p className="question-compound">
      {name === undefined ? null : (
        <span className="question-compound__name">{name}</span>
      )}
      <CopyableFormula formula={formula} />
    </p>
  );
}
