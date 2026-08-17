import type { ReactElement, ReactNode } from 'react';

import type { Glossary } from '../core/glossary.ts';

import { GlossaryContext } from './glossaryContext.ts';

export interface GlossaryProviderProps {
  /** Every term the site defines, keyed by the lowercased text of a marker. */
  glossary: Glossary;
  /** The part of the page whose prose resolves its markers against it. */
  children: ReactNode;
}

/**
 * Hand a glossary to every piece of prose below it.
 *
 * Wrap the whole tool once, high enough that a tutorial step, an exercise
 * description and a revealed hint all sit under it: they are the three places
 * jargon is linked, and they must define a term the same way.
 * @param props - The terms, and the tree that uses them.
 * @returns The tree, with the glossary in reach.
 */
export function GlossaryProvider(props: GlossaryProviderProps): ReactElement {
  const { glossary, children } = props;

  return (
    <GlossaryContext.Provider value={glossary}>
      {children}
    </GlossaryContext.Provider>
  );
}
