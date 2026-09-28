/**
 * Pane content that keeps a record of being stood up and taken down.
 *
 * A chart is expensive to mount and empty until it has been measured, fitted
 * and drawn again, so whether a pane survives a change to the stack around it
 * is worth asserting directly rather than inferring from what is on screen —
 * a remounted chart looks exactly like the one it replaced.
 */

import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { noteMounted, noteUnmounted } from './mountLog.ts';

/** What a probe is told to call itself. */
export interface MountProbeProps {
  /** The name it writes, and the name it reports itself under. */
  id: string;
}

/**
 * A pane's content, standing in for the chart that would be there.
 * @param props - What it calls itself.
 * @returns Its name, so the stack still reads as prose.
 */
export function MountProbe(props: MountProbeProps): ReactElement {
  const { id } = props;

  useEffect(() => {
    noteMounted(id);
    return () => {
      noteUnmounted(id);
    };
  }, [id]);

  return <p>{id}</p>;
}
