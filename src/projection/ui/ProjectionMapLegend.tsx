import type { ReactElement } from 'react';

import { useChartFrame } from '../../chart/ui/chartFrameContext.ts';
import type { OverlayLegendEntry } from '../../overlay/ui/OverlayLegend.tsx';
import { OverlayLegend } from '../../overlay/ui/OverlayLegend.tsx';

import { projectionMapCorner } from './projectionMapCorner.ts';
import type { ProjectionMapCloud } from './projectionMapModel.ts';
import {
  projectionPlotArea,
  projectionPlotAreaStyle,
} from './projectionTabStyles.ts';

/** What {@link ProjectionMapLegend} needs. */
interface ProjectionMapLegendProps {
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
  /**
   * Width of the whole figure, in pixels: where its plot is taken to fall when
   * it is not a frame, which says where it put it.
   */
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
 * cluster the reader came for. Over a frame, the plot is the one the frame
 * drew, so a column of wide labels moves the key with the plot.
 * @param props - See {@link ProjectionMapLegendProps}.
 * @returns The key.
 */
export function ProjectionMapLegend(
  props: ProjectionMapLegendProps,
): ReactElement {
  const { title, entries, cloud, xDomain, yDomain, width, height } = props;
  const frame = useChartFrame();

  const plot = frame?.plot ?? projectionPlotArea(width, height);
  const corner = projectionMapCorner(
    cloud,
    xDomain,
    yDomain,
    plot.width,
    plot.height,
  );

  return (
    <div style={projectionPlotAreaStyle(plot)}>
      <OverlayLegend placement={corner} title={title} entries={entries} />
    </div>
  );
}
