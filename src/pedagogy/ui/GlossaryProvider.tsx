import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';

import type { Glossary, GlossaryExample } from '../core/glossary.ts';

import type { GlossaryContextValue } from './glossaryContext.ts';
import { GlossaryContext } from './glossaryContext.ts';

/** Props of {@link GlossaryProvider}. */
export interface GlossaryProviderProps<TExample = GlossaryExample> {
  /** Every term the site defines, keyed by the lowercased text of a marker. */
  glossary: Glossary<TExample>;
  /**
   * Draws the illustration of an example, wherever a definition below shows
   * one: a structure for a SMILES, a typeset formula for LaTeX. The note of the
   * example is still written under it. Needed whenever the examples are not
   * `{ code, input, note }`.
   * @default undefined — an example is its code, and the input it runs on
   */
  renderExample?: (example: TExample) => ReactNode;
  /**
   * Draws the code spans of the prose below.
   * @default undefined — a plain `<code>`
   */
  renderCode?: (code: string) => ReactNode;
  /** The part of the page whose prose resolves its markers against it. */
  children: ReactNode;
}

/**
 * Hand a glossary to every piece of prose below it.
 *
 * Wrap the whole tool once, high enough that a tutorial step, an exercise
 * description and a revealed hint all sit under it: they are the three places
 * jargon is linked, and they must define a term — and draw its examples — the
 * same way.
 * @param props - The terms, how their examples are drawn, and the tree that
 * uses them.
 * @returns The tree, with the glossary in reach.
 */
export function GlossaryProvider<TExample = GlossaryExample>(
  props: GlossaryProviderProps<TExample>,
): ReactElement {
  const { glossary, renderExample, renderCode, children } = props;
  const value = useMemo<GlossaryContextValue>(
    () => ({
      glossary,
      renderExample: renderExample as GlossaryContextValue['renderExample'],
      renderCode,
    }),
    [glossary, renderExample, renderCode],
  );

  return (
    <GlossaryContext.Provider value={value}>
      {children}
    </GlossaryContext.Provider>
  );
}
