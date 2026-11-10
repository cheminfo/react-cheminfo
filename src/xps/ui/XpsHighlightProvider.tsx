import type { ReactNode } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { XpsHighlight } from '../core/xpsHighlight.ts';
import { NO_HIGHLIGHT, sameXpsHighlight } from '../core/xpsHighlight.ts';

import type { LookAtEnergy } from './xpsHighlightContext.ts';
import {
  lookAtEnergyContext,
  xpsHighlightContext,
} from './xpsHighlightContext.ts';

/** The views that light the same spectra up, and whoever drives them. */
export interface XpsHighlightProviderProps {
  /**
   * What is being looked at, when something outside decides it. Supplying it
   * makes the provider controlled: it stops holding a highlight of its own and
   * shows what it is given, so a table of reference energies drawn beside the
   * chart can light a peak by resting on the element that explains it.
   *
   * Left out — which is not the same as `NO_HIGHLIGHT`, a value meaning that
   * nothing is looked at — the provider holds its own, which is what a
   * spectrum viewer standing alone needs.
   * @default undefined
   */
  highlight?: XpsHighlight;
  /**
   * Called whenever something is looked at, `NO_HIGHLIGHT` when the pointer
   * leaves. Fires in both modes, and only on a real change, so a parent may
   * listen without taking charge and take charge later without listening
   * twice.
   * @default undefined
   */
  onHighlight?: (highlight: XpsHighlight) => void;
  /** Everything that lights the same spectra up. */
  children: ReactNode;
}

/**
 * Hold what is being looked at, for one spectrum view.
 *
 * The provider is controlled or uncontrolled according to whether it was given
 * a `highlight`, and that is the whole of what makes a two-way link possible: a
 * provider that always owned its state would shadow the outer one wrapping it,
 * so the chart would light its own peaks and nothing else would hear about it.
 *
 * The pointer says the same thing again on every move it makes — and a guide
 * drawn at 284.803 eV rather than 284.800 eV is the same guide — so a highlight
 * `sameXpsHighlight` calls unchanged is dropped rather than set and announced
 * afresh. That is the check which keeps two linked viewers from bouncing a
 * highlight back and forth until neither answers.
 * @param props - Component props.
 * @returns The shell, with what is looked at reachable inside it.
 */
export function XpsHighlightProvider(props: XpsHighlightProviderProps) {
  const { highlight, onHighlight, children } = props;
  const [ownHighlight, setOwnHighlight] = useState<XpsHighlight>(NO_HIGHLIGHT);

  const isControlled = highlight !== undefined;
  const current = highlight ?? ownHighlight;

  // `lookAt` is promised to be stable for the life of the view, so what it
  // reads is mirrored after each render rather than closed over — a `lookAt`
  // that changed identity would re-render every component that only reports
  // hovers, on every hover.
  //
  // What is remembered is the last highlight *reported*, not the one shown: a
  // controlled parent is free to hear a hover and decline to show it, and it
  // must not then be told the same thing again on every pixel the pointer
  // travels. The mirror puts the two back in step whenever the shown highlight
  // moves on its own, so a peak the pointer is still resting on is reported
  // afresh once something else has taken the light.
  const reportedRef = useRef(current);
  const controlledRef = useRef(isControlled);
  const notifyRef = useRef(onHighlight);
  useLayoutEffect(() => {
    reportedRef.current = heldOrNext(reportedRef.current, current);
    controlledRef.current = isControlled;
    notifyRef.current = onHighlight;
  });

  const lookAt = useCallback<LookAtEnergy>((next) => {
    if (sameXpsHighlight(reportedRef.current, next)) return;
    reportedRef.current = next;
    if (!controlledRef.current) {
      setOwnHighlight((held) => heldOrNext(held, next));
    }
    notifyRef.current?.(next);
  }, []);

  return (
    <lookAtEnergyContext.Provider value={lookAt}>
      <xpsHighlightContext.Provider value={current}>
        {children}
      </xpsHighlightContext.Provider>
    </lookAtEnergyContext.Provider>
  );
}

/**
 * What to hold once a highlight has been reported.
 *
 * The same object comes back when nothing has changed, so React bails the
 * update out rather than re-rendering every consumer: a pointer crossing a peak
 * reports the same highlight on every pixel, and a fresh object each time would
 * redraw the chart at the pointer's sampling rate.
 * @param held - What is being held.
 * @param next - What has just been reported.
 * @returns `held` itself when the two say the same thing, `next` otherwise.
 */
function heldOrNext(held: XpsHighlight, next: XpsHighlight): XpsHighlight {
  return sameXpsHighlight(held, next) ? held : next;
}
