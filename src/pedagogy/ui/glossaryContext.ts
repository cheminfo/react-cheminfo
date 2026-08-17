/**
 * Where the terms a site defines are kept while the page is open.
 *
 * Prose is rendered deep inside a card, a callout or a tooltip, and threading
 * the glossary down to each of those as a prop is what makes a site stop
 * linking its jargon. It is read from the surrounding provider instead.
 */

import { createContext, useContext } from 'react';

import type { Glossary } from '../core/glossary.ts';

/**
 * The glossary the surrounding provider holds.
 * @returns Every term the site defines, and no term at all when nothing wraps
 * the tree — prose then renders its markers as plain words.
 */
export function useGlossary(): Glossary {
  return useContext(GlossaryContext);
}

/** Holder of the glossary, written by `GlossaryProvider` and read by prose. */
export const GlossaryContext = createContext<Glossary>({});
