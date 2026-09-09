import { Callout } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { SettingsProblem } from '../core/problems.ts';

/** What {@link ProblemList} reports. */
export interface ProblemListProps {
  /** The problems of one part of the settings, errors and advice together. */
  problems: readonly SettingsProblem[];
  /**
   * What the errors are headed with; the advice is always headed `Worth a look`.
   * @default 'The processor would fail on this' — what an error always means
   */
  title?: string;
}

/**
 * What is wrong, or probably wrong, with one part of the settings.
 *
 * Errors and advice are kept apart because they ask for different things: an
 * error is a value the processor throws on and has to be fixed before anything
 * runs, while a warning is a chain that runs and most likely does not mean what
 * the reader thinks. Nothing here blocks — the editor reports, it does not gate.
 * @param props - See {@link ProblemListProps}.
 * @returns The two callouts, or nothing at all when there is nothing to say.
 */
export function ProblemList(props: ProblemListProps): ReactElement | null {
  const { problems, title = 'The processor would fail on this' } = props;
  const errors = problems.filter((entry) => entry.severity === 'error');
  const warnings = problems.filter((entry) => entry.severity !== 'error');
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div style={LIST_STYLE}>
      {errors.length === 0 ? null : (
        <Callout intent="danger" compact title={title}>
          <Lines problems={errors} />
        </Callout>
      )}
      {warnings.length === 0 ? null : (
        <Callout intent="warning" compact title="Worth a look">
          <Lines problems={warnings} />
        </Callout>
      )}
    </div>
  );
}

/**
 * One line per problem, naming the part before saying what is wrong.
 * @param props - What the lines are made of.
 * @param props.problems - The problems to list.
 * @returns The list.
 */
function Lines(props: { problems: readonly SettingsProblem[] }): ReactElement {
  return (
    <ul style={LINES_STYLE}>
      {props.problems.map((entry) => (
        <li key={`${entry.severity} ${entry.where} ${entry.message}`}>
          {`${entry.where} — ${entry.message}`}
        </li>
      ))}
    </ul>
  );
}

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
} as const satisfies CSSProperties;

const LINES_STYLE = {
  margin: 0,
  paddingLeft: 18,
  fontSize: 12,
} as const satisfies CSSProperties;
