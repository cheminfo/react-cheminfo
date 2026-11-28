import type { ReactElement } from 'react';

import { GlossaryText } from './GlossaryText.tsx';
import { ReferenceGrid } from './ReferenceGrid.tsx';
import type { ReferenceSection } from './ReferenceSectionBlock.tsx';

/** Props of {@link PracticeCheatsheet}. */
export interface PracticeCheatsheetProps {
  /** The page's heading. */
  title: string;
  /**
   * One sentence under it: what the sheet holds, and that it prints. Written
   * in the prose marks, `[[term]]` and `{{C6H12O6}}` included.
   */
  lead: string;
  /** The blocks of the cheatsheet, in reading order. */
  sections: readonly ReferenceSection[];
}

/**
 * The cheatsheet of a practice site: a heading, its lead, then the rules on
 * one printable grid, in `practice.css`'s page heading.
 * @param props - See {@link PracticeCheatsheetProps}.
 * @returns The page.
 */
export function PracticeCheatsheet(
  props: PracticeCheatsheetProps,
): ReactElement {
  const { title, lead, sections } = props;
  return (
    <div className="cheatsheet">
      <header className="page-head">
        <h1 className="page__title">{title}</h1>
        <p className="page__lead">
          <GlossaryText text={lead} />
        </p>
      </header>
      <ReferenceGrid sections={sections} />
    </div>
  );
}
