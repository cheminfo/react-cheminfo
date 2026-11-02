import type { ReactElement, ReactNode } from 'react';

import { PagePart } from '../../share/ui/PagePart.tsx';

import { GlossaryText } from './GlossaryText.tsx';

/** What {@link PracticePage} needs. */
export interface PracticePageProps {
  /** The page's heading. */
  title: string;
  /** One or two sentences under the title; may carry `[[term]]` markers. */
  lead: string;
  /**
   * The calculator: anything typed into it is worked out. A link hides it as
   * the part `playground`.
   * @default undefined — the page is its graded series alone
   */
  playground?: ReactNode;
  /** The graded series. A link hides it as the part `exercises`. */
  exercises: ReactNode;
}

/**
 * The layout every tool of a practice site shares: its title and lead, the
 * calculator when it has one, then the graded series. Its classes are styled
 * by `react-cheminfo/styles/practice.css`.
 * @param props - See {@link PracticePageProps}.
 * @returns The page.
 */
export function PracticePage(props: PracticePageProps): ReactElement {
  const { title, lead, playground, exercises } = props;
  return (
    <div className="tool-page">
      <header className="page-head">
        <h1 className="page__title">{title}</h1>
        <p className="page__lead">
          <GlossaryText text={lead} />
        </p>
      </header>
      {playground === undefined ? null : (
        <PagePart part="playground">
          <section className="panel" aria-labelledby="calculator-heading">
            <h2 className="panel__title" id="calculator-heading">
              Calculator
            </h2>
            {playground}
          </section>
        </PagePart>
      )}
      <PagePart part="exercises">
        <section className="panel" aria-labelledby="questions-heading">
          {exercises}
        </section>
      </PagePart>
    </div>
  );
}
