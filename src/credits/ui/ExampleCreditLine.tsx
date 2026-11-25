import type { ReactElement } from 'react';

import { Prose } from '../../i18n/ui/Prose.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { ExampleCredit } from '../core/exampleCredit.ts';
import { exampleCreditMessage } from '../core/exampleCredit.ts';

/** What {@link ExampleCreditLine} draws. */
export interface ExampleCreditLineProps {
  /** Who the example is owed to, and on what terms. */
  credit: ExampleCredit;
  /**
   * Class the line carries, in addition to `example-credit`.
   * @default undefined
   */
  className?: string;
}

/**
 * Who an example is owed to and on what terms, in one line: its author links
 * to the page it is published on, its licence to the licence's own text, and
 * Wikimedia Commons is named when the page is there, as Commons asks.
 * @param props - See {@link ExampleCreditLineProps}.
 * @returns The line.
 */
export function ExampleCreditLine(props: ExampleCreditLineProps): ReactElement {
  const { credit, className } = props;
  const t = useChromeT();

  return (
    <span className={joinClassNames('example-credit', className)}>
      <Prose
        text={t(exampleCreditMessage(credit))}
        nodes={{
          author: (
            <a href={credit.page} target="_blank" rel="noopener noreferrer">
              {credit.author}
            </a>
          ),
          licence:
            credit.licenceUrl === undefined ? (
              credit.licence
            ) : (
              <a
                href={credit.licenceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {credit.licence}
              </a>
            ),
        }}
      />
    </span>
  );
}
