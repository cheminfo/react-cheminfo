/**
 * What is being looked at, reachable from everything drawing the same spectra.
 *
 * The chart, the peak table, the elements panel and the fit are four views of
 * one measurement, so resting on a row in any of them has to light the same
 * energy up in all four. That made the highlight travel down one side of the
 * shell and up the other as a pair of props; it belongs to no single component,
 * and it is kept here instead.
 *
 * Two contexts rather than one, because the two halves are read by different
 * components: a peak row that only ever reports a hover subscribes to the way
 * of saying so and re-renders on nothing, while the chart subscribes to what is
 * said and redraws the guide on every pixel the pointer travels.
 *
 * Deliberately not part of the state the reducer holds — nothing about the
 * spectra changes with it, and a highlight in a document written to a file
 * would be a guide drawn wherever somebody's mouse happened to be.
 */

import { createContext, useContext } from 'react';

import type { XpsHighlight } from '../core/xpsHighlight.ts';
import { NO_HIGHLIGHT } from '../core/xpsHighlight.ts';

/** Say what is being looked at, `NO_HIGHLIGHT` for nothing. */
export type LookAtEnergy = (highlight: XpsHighlight) => void;

/** What the pointer rests on, as the provider holds it. */
export const xpsHighlightContext = createContext<XpsHighlight>(NO_HIGHLIGHT);

/** The way to light something up, as the provider holds it. */
export const lookAtEnergyContext = createContext<LookAtEnergy | null>(null);

/**
 * What the pointer is resting on, wherever it came to rest.
 *
 * `NO_HIGHLIGHT` outside a provider rather than an error: a chart mounted on
 * its own draws nothing lit, which is a perfectly good spectrum viewer.
 * @returns The spectrum, the peak, the component and the energy being looked
 * at, each of them `null` when nothing is.
 */
export function useXpsHighlight(): XpsHighlight {
  return useContext(xpsHighlightContext);
}

/**
 * Light an energy up, without subscribing to what is already lit.
 *
 * This one throws outside a provider, where the read does not: reporting a
 * hover that reaches nobody is a wiring mistake, and it is one that shows up as
 * a viewer which quietly refuses to link rather than as anything visible.
 * @returns The way to say what is being looked at, stable for the life of the
 * view.
 */
export function useLookAtEnergy(): LookAtEnergy {
  const lookAt = useContext(lookAtEnergyContext);
  if (lookAt === null) {
    throw new Error(
      'This view reports what is looked at, but there is no XpsHighlightProvider above it — wrap the spectrum view in one so a hover can reach whatever is drawn beside it',
    );
  }
  return lookAt;
}
