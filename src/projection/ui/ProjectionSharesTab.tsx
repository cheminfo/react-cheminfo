import type { ReactElement } from 'react';

import { chartBand } from '../../chart/core/chartBand.ts';
import type { ChartAxisSpec } from '../../chart/ui/ChartFrame.tsx';
import { ChartFrame } from '../../chart/ui/ChartFrame.tsx';
import { chartFrameGeometry } from '../../chart/ui/chartFrameGeometry.ts';
import type { ExplainedShares } from '../core/explainedShares.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import { PROJECTION_COPY } from '../core/projectionCopy.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';

import { SharesAxis } from './ProjectionSharesAxis.tsx';
import { SharesMarks } from './ProjectionSharesMarks.tsx';
import {
  PROJECTION_TAB_HEIGHT,
  SHARES_BOTTOM_ROOM,
  WHOLE_SHARE,
} from './projectionTabStyles.ts';

/** What {@link ProjectionSharesTab} needs. */
interface ProjectionSharesTabProps {
  /** What the run produced; every axis must carry a share. */
  result: ProjectionResult;
  /** The bars, worked out once by the viewer and explained in its bar. */
  shares: ExplainedShares;
  /**
   * The words the tab writes.
   * @default PROJECTION_COPY
   */
  copy?: ProjectionCopy;
  /**
   * Width of the figure, in pixels, from the viewer's measurement.
   * @default 0 — nothing is drawn until the figure has been measured
   */
  width?: number;
  /**
   * Height of the figure, in pixels.
   * @default 420
   */
  height?: number;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}

/**
 * One bar per component, each in its own component's colour, with the running
 * total drawn over them.
 *
 * The colour is the whole point of this tab. On most charts of explained
 * shares the bars are one colour, or a gradient, and a reader who asks what it
 * means is right to ask, because it means nothing. Here every bar carries the
 * colour its component carries on every other tab, so the reader learns one
 * colour language rather than two.
 *
 * It is the one figure of the viewer with no key at all: every bar is named
 * under itself in its own colour, and the running total writes its name at its
 * right-hand end, so a key would be a second place to look for something both
 * marks already say about themselves.
 * @param props - See {@link ProjectionSharesTabProps}.
 * @returns The figure.
 */
export function ProjectionSharesTab(
  props: ProjectionSharesTabProps,
): ReactElement {
  const { result, shares, copy = PROJECTION_COPY, testId } = props;
  const { width = 0, height = PROJECTION_TAB_HEIGHT } = props;

  const slots = shares.components.length;
  const x: ChartAxisSpec = {
    domain: [0, slots],
    showTicks: false,
    showGrid: false,
    nice: false,
  };
  // The names under the bars are written in HTML, so they read the plot the
  // frame lays out rather than working out its edges a second time.
  const geometry = chartFrameGeometry(width, height, x, SHARE_AXIS, MARGINS);

  return (
    <div data-testid={testId}>
      <ChartFrame
        width={width}
        height={height}
        margins={MARGINS}
        x={x}
        y={SHARE_AXIS}
        geometry={geometry}
        label={`${result.method}. ${copy.intro.shares}`}
        overlay={
          <SharesAxis
            shares={shares}
            plot={geometry.plot}
            caption={HORIZONTAL_CAPTION}
          />
        }
      >
        {(frame) => (
          <SharesMarks
            shares={shares}
            copy={copy}
            frame={frame}
            band={chartBand(slots, frame.plot.left, frame.plot.right, {
              padding: BAR_GAP,
            })}
          />
        )}
      </ChartFrame>
    </div>
  );
}

/** Share of a slot left empty between two bars. */
const BAR_GAP = 0.3;

/** Room under the plot for the names and the caption the tab writes there. */
const MARGINS = { bottom: SHARES_BOTTOM_ROOM };

/**
 * The two axis captions, in words the reader already has.
 *
 * They are constants rather than copy because {@link ProjectionCopy} carries
 * no slot for an axis, and adding one for two strings would put a translation
 * seam in the middle of a figure.
 */
const HORIZONTAL_CAPTION = 'Components, strongest first';
const VERTICAL_CAPTION = 'Share of the differences explained';

/** The vertical axis: every share, as a percentage. */
const SHARE_AXIS: ChartAxisSpec = {
  domain: [0, WHOLE_SHARE],
  label: VERTICAL_CAPTION,
  tickCount: 5,
};
