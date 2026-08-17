import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';

import { HiddenPartsContext } from './hiddenParts.ts';

export interface HiddenPartsProviderProps {
  /**
   * The parts the link switches off — the `hidden` of the parsed
   * configuration.
   * @default [] — nothing is switched off
   */
  hidden?: readonly string[];
  /** The page, and everything in it that may ask what is hidden. */
  children: ReactNode;
}

/**
 * Put the configuration of the current link where every part of the page can
 * read it, so nothing has to be threaded through props.
 * @param props - The parts the link switches off, and the page.
 * @returns The page, under the configuration.
 */
export function HiddenPartsProvider(
  props: HiddenPartsProviderProps,
): ReactElement {
  const { hidden, children } = props;
  const parts = useMemo(() => new Set(hidden), [hidden]);

  return (
    <HiddenPartsContext.Provider value={parts}>
      {children}
    </HiddenPartsContext.Provider>
  );
}
