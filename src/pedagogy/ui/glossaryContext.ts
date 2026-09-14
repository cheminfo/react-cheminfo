/**
 * Where the terms a site defines are kept while the page is open.
 *
 * Prose is rendered deep inside a card, a callout or a tooltip, and threading
 * the glossary down to each of those as a prop is what makes a site stop
 * linking its jargon. It is read from the surrounding provider instead, with
 * the way the site draws an example and a code span alongside it.
 */

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { Glossary } from '../core/glossary.ts';

/** What the surrounding `GlossaryProvider` hands to the prose below it. */
export interface GlossaryContextValue {
  /** Every term the site defines. */
  glossary: Glossary<unknown>;
  /**
   * Draws the illustration of one example of the glossary.
   * @default undefined — an example is drawn as its code and its input
   */
  renderExample?: (example: unknown) => ReactNode;
  /**
   * Draws a code span of the prose.
   * @default undefined — a plain `<code>`
   */
  renderCode?: (code: string) => ReactNode;
}

/**
 * The glossary the surrounding provider holds, and how it draws what it shows.
 * @returns The provider's value, and an empty glossary when nothing wraps the
 * tree — prose then renders its markers as plain words.
 */
export function useGlossary(): GlossaryContextValue {
  return useContext(GlossaryContext);
}

/** Holder of the glossary, written by `GlossaryProvider` and read by prose. */
export const GlossaryContext = createContext<GlossaryContextValue>({
  glossary: {},
});
