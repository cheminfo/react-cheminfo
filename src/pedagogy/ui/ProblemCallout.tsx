import { Callout } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { errorMessage } from '../../error/core/toError.ts';

/** Props of {@link ProblemCallout}. */
export interface ProblemCalloutProps {
  /** What was thrown while the input was worked out. */
  error: unknown;
}

/**
 * Why a calculator could not work out what was typed, in the words the
 * chemistry gave: a warning, never an apology.
 * @param props - See {@link ProblemCalloutProps}.
 * @returns The callout.
 */
export function ProblemCallout(props: ProblemCalloutProps): ReactElement {
  return (
    <Callout intent="warning" icon="issue" className="formula-problem">
      {errorMessage(props.error)}
    </Callout>
  );
}
