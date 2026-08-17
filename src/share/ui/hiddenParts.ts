import { createContext, useCallback, useContext } from 'react';

/**
 * The parts the link switched off, so a component that can be left out of an
 * embedded page reads the configuration instead of taking it as a prop.
 *
 * A page with no provider above it hides nothing, which is what a site that
 * hands out no links wants.
 */
export const HiddenPartsContext = createContext<ReadonlySet<string>>(new Set());

/**
 * Ask whether the link the page was opened with switches a part off.
 *
 * Hidden means hidden, not disabled: the value a hidden control carries still
 * applies, so an embedder can preset what a visitor may not change.
 * @returns A predicate over the part keys of the site's vocabulary.
 */
export function useIsHidden(): (part: string) => boolean {
  const hidden = useContext(HiddenPartsContext);
  return useCallback((part: string) => hidden.has(part), [hidden]);
}
