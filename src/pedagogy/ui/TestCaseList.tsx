import { Icon } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { TestCaseResult } from '../core/validation.ts';

export interface TestCaseListProps<
  TCase extends TestCaseResult = TestCaseResult,
> {
  /** The graded cases, in the order the validator returned them. */
  results: readonly TCase[];
  /**
   * What names a case: the input it was run on, the atom it asked about. A
   * tool that carries no such name lets the sentence speak for itself.
   * @default undefined — the row shows only the reason
   */
  label?: (result: TCase, position: number) => ReactNode;
  /**
   * Whether the answer could not be graded at all — it does not compile, or
   * there is nothing to mark yet. Every case is then drawn neutral rather than
   * red, since none of them actually failed.
   * @default false
   */
  pending?: boolean;
  /**
   * Class the list carries, so a site can reach it from its stylesheet.
   * @default undefined
   */
  className?: string;
}

/**
 * One row per graded case: whether it passes, and the sentence saying why not.
 *
 * The sentence is the validator's own — `match was "cat", expected "cats"` —
 * and is never rewritten here: the explanation is the teaching, and a
 * paraphrase would drop the value the student has to compare.
 * @param props - The cases, and whether they could be graded at all.
 * @returns The list, or nothing when there is no case to show.
 */
export function TestCaseList<TCase extends TestCaseResult>(
  props: TestCaseListProps<TCase>,
): ReactElement | null {
  const { results, label, pending = false, className } = props;
  if (results.length === 0) return null;

  const rows: ReactNode[] = [];
  for (let position = 0; position < results.length; position++) {
    const result = results[position] as TCase;
    rows.push(
      <li key={`case-${position}`} style={itemStyle(result.passed, pending)}>
        <Icon
          icon={caseIcon(result.passed, pending)}
          intent={caseIntent(result.passed, pending)}
        />
        <span>
          {label !== undefined && (
            <strong style={LABEL_STYLE}>{label(result, position)}</strong>
          )}
          {result.reason !== '' && (
            <span style={REASON_STYLE}>{result.reason}</span>
          )}
        </span>
      </li>,
    );
  }

  return (
    <ul className={className} style={LIST_STYLE}>
      {rows}
    </ul>
  );
}

function caseIcon(
  passed: boolean,
  pending: boolean,
): 'tick-circle' | 'circle' | 'cross-circle' {
  if (passed) return 'tick-circle';
  return pending ? 'circle' : 'cross-circle';
}

function caseIntent(
  passed: boolean,
  pending: boolean,
): 'success' | 'danger' | 'none' {
  if (passed) return 'success';
  return pending ? 'none' : 'danger';
}

function itemStyle(passed: boolean, pending: boolean): CSSProperties {
  const failed = !passed && !pending;
  return {
    display: 'flex',
    alignItems: 'start',
    gap: 8,
    padding: '4px 8px',
    borderRadius: 3,
    borderLeft: `3px solid ${passed ? '#1c6e42' : failed ? '#cd4246' : '#c5cbd3'}`,
    background: passed
      ? 'rgb(236 253 245)'
      : failed
        ? 'rgb(254 243 242)'
        : 'rgb(245 248 250)',
  };
}

const LIST_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const LABEL_STYLE: CSSProperties = { marginRight: 6 };

const REASON_STYLE: CSSProperties = {
  display: 'block',
  color: 'rgb(65 75 90)',
  lineHeight: 1.4,
};
