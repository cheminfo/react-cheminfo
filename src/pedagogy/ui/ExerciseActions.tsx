import { Button } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

export interface ExerciseActionsProps {
  /**
   * Records the attempt. Grading itself runs on every keystroke, so this
   * button commits the verdict rather than producing it.
   * @default undefined — no Check button
   */
  onCheck?: () => void;
  /**
   * Text of the Check button.
   * @default 'Check'
   */
  checkLabel?: string;
  /**
   * Whether checking is impossible yet — nothing typed, nothing drawn.
   * @default false
   */
  checkDisabled?: boolean;
  /**
   * Opens the next hint.
   * @default undefined — no hint button; the ladder may carry its own
   */
  onRevealHint?: () => void;
  /**
   * How many hints are already open, for the button's count.
   * @default 0
   */
  hintsRevealed?: number;
  /**
   * How many hints the exercise has, for the button's count.
   * @default 0
   */
  hintCount?: number;
  /**
   * Shows or hides the sample answer. Never gated behind anything: getting
   * stuck and reading the answer is part of how the intuition is built.
   * @default undefined — no solution button
   */
  onToggleSolution?: () => void;
  /**
   * Whether the sample answer is on screen, which is what the button offers to
   * undo.
   * @default false
   */
  showSolution?: boolean;
  /**
   * Puts the exercise back to a blank answer, no hints and no solution.
   * @default undefined — no Reset button
   */
  onReset?: () => void;
  /**
   * The buttons this tool adds — show the diagram, show the 3D view — rendered
   * after the four standard ones.
   * @default undefined
   */
  children?: ReactNode;
  /**
   * Class the row carries, so a site can reach it from its stylesheet.
   * @default undefined
   */
  className?: string;
}

/**
 * The row of controls under an exercise: Check, Reveal hint, the solution, and
 * Reset.
 *
 * Every one of them is optional, because a tool that grades live has no Check
 * and a tool with a single-field answer has no Reset — what matters is that the
 * ones a tool does offer read the same and sit in the same order everywhere.
 * @param props - The actions the exercise offers.
 * @returns The row.
 */
export function ExerciseActions(props: ExerciseActionsProps): ReactElement {
  const {
    onCheck,
    checkLabel = 'Check',
    checkDisabled = false,
    onRevealHint,
    hintsRevealed = 0,
    hintCount = 0,
    onToggleSolution,
    showSolution = false,
    onReset,
    children,
    className,
  } = props;

  return (
    <div className={className} style={ROW_STYLE}>
      {onCheck !== undefined && (
        <Button
          intent="primary"
          icon="tick"
          text={checkLabel}
          disabled={checkDisabled}
          onClick={onCheck}
        />
      )}
      {onRevealHint !== undefined && (
        <Button
          icon="lightbulb"
          text={`Reveal hint (${Math.min(hintsRevealed, hintCount)}/${hintCount})`}
          disabled={hintsRevealed >= hintCount}
          onClick={onRevealHint}
        />
      )}
      {onToggleSolution !== undefined && (
        <Button
          icon={showSolution ? 'eye-off' : 'key'}
          text={showSolution ? 'Hide solution' : 'Reveal solution'}
          onClick={onToggleSolution}
        />
      )}
      {onReset !== undefined && (
        <Button icon="reset" text="Reset" onClick={onReset} />
      )}
      {children}
    </div>
  );
}

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
};
