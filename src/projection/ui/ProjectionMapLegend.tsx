import type { ReactElement } from 'react';

import type { OverlayLegendEntry } from '../../overlay/ui/OverlayLegend.tsx';
import { OverlayLegend } from '../../overlay/ui/OverlayLegend.tsx';

import type { ProjectionMapCloud } from './projectionMapModel.ts';
import { projectionMapCorner } from './projectionMapModel.ts';
import {
  PROJECTION_PLOT_AREA_STYLE,
  PROJECTION_PLOT_ROOM,
} from './projectionTabStyles.ts';

/** What {@link ProjectionMapLegend} needs. */
export interface ProjectionMapLegendProps {
  /** The one short sentence naming what the colour means here. */
  title: string;
  /** What each mark on the map means, in the order they are written. */
  entries: readonly OverlayLegendEntry[];
  /** Where every sample sits, in the embedding's own units. */
  cloud: ProjectionMapCloud;
  /** The range the horizontal axis covers. */
  xDomain: readonly [number, number];
  /** The range the vertical axis covers. */
  yDomain: readonly [number, number];
  /** Width of the whole figure, in pixels. */
  width: number;
  /** Its height. */
  height: number;
}

/**
 * The key, floating in the emptiest corner of the plot itself.
 *
 * It floats because an embedded figure cannot spend a block of somebody else's
 * page on a card that says three words, and it is held inside the plot
 * rectangle rather than inside the figure's own box because the strips outside
 * that rectangle are where the axes are written: a key in the bottom left
 * corner of the *figure* covers the vertical axis' labels and the name under
 * the horizontal one, which is a worse trade than covering a few pixels of
 * empty plot.
 *
 * Inside the plot every corner is honest, so the corner is chosen by counting
 * the dots under each — a key in a fixed corner eventually sits on the one
 * cluster the reader came for.
 * @param props - See {@link ProjectionMapLegendProps}.
 * @returns The key.
 */
export function ProjectionMapLegend(
  props: ProjectionMapLegendProps,
): ReactElement {
  const { title, entries, cloud, xDomain, yDomain, width, height } = props;

  const plotWidth =
    width - PROJECTION_PLOT_ROOM.left - PROJECTION_PLOT_ROOM.right;
  const plotHeight =
    height - PROJECTION_PLOT_ROOM.top - PROJECTION_PLOT_ROOM.bottom;
  const corner = projectionMapCorner(
    cloud,
    xDomain,
    yDomain,
    Math.max(0, plotWidth),
    Math.max(0, plotHeight),
  );

  return (
    <div style={PROJECTION_PLOT_AREA_STYLE}>
      <OverlayLegend placement={corner} title={title} entries={entries} />
    </div>
  );
}
