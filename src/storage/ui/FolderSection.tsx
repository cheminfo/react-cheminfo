import { Icon } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { usePanelNeedle } from '../../panel/ui/panelSearchContext.ts';
import { persistBucket } from '../../state/core/persistBucket.ts';

/** The sections of a folder panel, each opened and closed on its own. */
export type FolderSectionName = 'drafts' | 'documents' | 'folder' | 'examples';

/** Props of {@link FolderSection}. */
export interface FolderSectionProps {
  /** Which section it is: whether it is open is kept under this name. */
  name: FolderSectionName;
  /** What it is called: its heading, and the name of its toggle. */
  title: string;
  /**
   * A heading of its own in place of the title, given the toggle to draw
   * first: a folder's crumbs, whose links must stay links.
   * @default undefined — the title, which is itself the toggle
   */
  heading?: (toggle: ReactElement) => ReactNode;
  /**
   * How many rows it holds, said beside the title while it is closed.
   * @default undefined — nothing is said
   */
  count?: number;
  /** What it holds. */
  children: ReactNode;
}

/**
 * One section of a folder panel, opened and closed from its heading.
 *
 * Drafts start closed, since they are kept in case rather than to be read,
 * and the other sections open; what the visitor chose last is kept in this
 * browser. While a search is typed every section is open, so a match is never
 * hidden in a closed one.
 * @param props - See {@link FolderSectionProps}.
 * @returns The section.
 */
export function FolderSection(props: FolderSectionProps): ReactElement {
  const { name, title, heading, count, children } = props;
  const needle = usePanelNeedle();
  const [chosen, setChosen] = useState(() => SECTIONS.read().value[name]);
  const open = chosen || needle !== '';

  function toggle(): void {
    const next = !chosen;
    setChosen(next);
    SECTIONS.write({ ...SECTIONS.read().value, [name]: next });
  }

  const chevron = (
    <Icon icon={open ? 'chevron-down' : 'chevron-right'} size={12} />
  );
  return (
    <section className="folder-panel__section" aria-label={title}>
      {heading === undefined ? (
        <h3 className="folder-panel__heading">
          <button
            type="button"
            className="folder-panel__toggle"
            aria-expanded={open}
            onClick={toggle}
          >
            {chevron}
            {title}
            {!open && count ? (
              <span className="folder-panel__count">{count}</span>
            ) : null}
          </button>
        </h3>
      ) : (
        heading(
          <button
            type="button"
            className="folder-panel__toggle"
            aria-expanded={open}
            aria-label={title}
            onClick={toggle}
          >
            {chevron}
          </button>,
        )
      )}
      {open ? children : null}
    </section>
  );
}

const SECTIONS = persistBucket<Record<FolderSectionName, boolean>>({
  key: 'cheminfo:folder-sections',
  defaults: { drafts: false, documents: true, folder: true, examples: true },
});
