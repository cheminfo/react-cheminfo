import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { OverlayCaption } from '../../overlay/ui/OverlayCaption.tsx';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';

/** What a gesture just picked out, and when. */
export interface SelectionReport {
  /** The sentence to show, already written out. */
  text: string;
  /** A number that rises with every gesture, so two identical reports are still two reports. */
  at: number;
}

/** What {@link ProjectionMapCaption} needs. */
export interface ProjectionMapCaptionProps {
  /** What the last gesture picked out, or `null` before there was one. */
  report: SelectionReport | null;
  /** The words the map writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** What a plain drag does, which is what a drag under way is promised to do. */
  mode: ScatterSelectionMode;
  /**
   * Whether a lasso is being drawn right now.
   * @default false
   */
  drawing?: boolean;
}

/**
 * The one sentence on this figure that is not behind the question mark.
 *
 * Everything the map has to say about itself standing still — what a dot is,
 * what an outline holds — waits behind the `?` in the bar, because an embedded
 * figure cannot spend three lines of somebody else's page on a paragraph most
 * readers will not read twice. This sentence is the exception, and it is a
 * different kind of thing: it says what is happening *now*, and a reader half
 * way through a lasso cannot open a popover to find out whether letting go
 * will replace what they had already picked or add to it.
 *
 * So it appears only while a gesture is under way, and for a few seconds after
 * one, and it takes no room at all in between. That is also what lets it sit
 * across the strip the horizontal axis is titled in: a standing caption there
 * would cost the reader the axis name for good, while this one hands it back
 * on its own a moment later, and during a drag the reader is watching the loop
 * rather than the axis.
 * @param props - See {@link ProjectionMapCaptionProps}.
 * @returns The line, or nothing at all when nothing is happening.
 */
export function ProjectionMapCaption(
  props: ProjectionMapCaptionProps,
): ReactElement | null {
  const { report, copy, mode, drawing = false } = props;
  const [faded, setFaded] = useState(0);

  useEffect(() => {
    if (report === null) return undefined;
    const { at } = report;
    const timer = setTimeout(() => setFaded(at), ANNOUNCEMENT_MS);
    return () => clearTimeout(timer);
  }, [report]);

  if (drawing) {
    return (
      <OverlayCaption tone="strong" live>
        {copy.sentence[LASSO_SENTENCES[mode]]}
      </OverlayCaption>
    );
  }
  if (report !== null && faded !== report.at) {
    return (
      <OverlayCaption tone="strong" live>
        {report.text}
      </OverlayCaption>
    );
  }
  return null;
}

/** Which sentence describes a drag under way, per mode. */
const LASSO_SENTENCES = {
  replace: 'lassoReplace',
  add: 'lassoAdd',
  remove: 'lassoRemove',
} as const satisfies Record<
  ScatterSelectionMode,
  keyof ProjectionCopy['sentence']
>;

/**
 * How long a report holds the line. Long enough to read a short sentence
 * twice, short enough that a reader who has moved on is not still being told
 * what they did.
 */
const ANNOUNCEMENT_MS = 4000;
