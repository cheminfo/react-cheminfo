import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useId } from 'react';

import { OverlayLayer } from '../../overlay/ui/OverlayLayer.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import { ChartAxis } from './ChartAxis.tsx';
import { ChartFrameContext } from './chartFrameContext.ts';
import { chartFrameGeometry } from './chartFrameGeometry.ts';
import type {
  ChartAxisSpec,
  ChartFrameRender,
  ChartFrameSvgProps,
  ChartMargins,
} from './chartFrameTypes.ts';
import { CHART_SVG_STYLE, chartFrameStyle } from './chartStyles.ts';

export type {
  ChartAxisSpec,
  ChartFrameRender,
  ChartFrameSvgProps,
  ChartMargins,
  ChartPlotArea,
} from './chartFrameTypes.ts';

/** What {@link ChartFrame} needs. */
export interface ChartFrameProps {
  /** Total width, in pixels, normally from `useContainerSize`. */
  width: number;
  /** Total height. */
  height: number;
  /** The horizontal axis. */
  x: ChartAxisSpec;
  /** The vertical axis. */
  y: ChartAxisSpec;
  /**
   * What is drawn inside the plot, clipped to it: marks, outlines, a tracking
   * rectangle, in the order they should stack.
   */
  children: (frame: ChartFrameRender) => ReactNode;
  /**
   * What floats over the chart in HTML rather than SVG — an `OverlayBar`, a
   * legend, a readout. It is wrapped in an `OverlayLayer`, so it is not
   * clipped, not scaled, and lets every pointer event through except on the
   * cards themselves; and it reads the frame it floats over with
   * `useChartFrame`, so a key held inside the plot follows the plot.
   * @default undefined
   */
  overlay?: ReactNode;
  /**
   * Whether the figure is repainting, which the overlay reads to drop its
   * backdrop blur for a flat fill while a lasso is being dragged.
   * @default false
   */
  busy?: boolean;
  /**
   * What a screen reader is told the chart shows. Without it the chart is
   * decoration and is hidden from the reader.
   * @default '' — the chart is hidden from a screen reader
   */
  label?: string;
  /**
   * Room left around the plot, merged over the defaults — which already shrink
   * when an axis carries no title.
   * @default {}
   */
  margins?: Partial<ChartMargins>;
  /**
   * The plot rectangle and mappings, already worked out by
   * `chartFrameGeometry` from the same size, axes and margins — for a figure
   * that needed them before it rendered.
   * @default undefined — the frame works them out itself
   */
  geometry?: ChartFrameRender;
  /**
   * The SVG's handlers and ref, for a chart that answers gestures — a drag
   * that zooms or selects, a wheel, a double click.
   * @default undefined — the frame answers none
   */
  svgProps?: ChartFrameSvgProps;
  /**
   * Whether a still chart scales down with the box it is placed in — a
   * document read on a phone: its drawing keeps its proportions, its text
   * with it, and is never wider than `width`.
   * @default false — drawn at its width and height
   */
  scalable?: boolean;
  /**
   * A class added to the wrapper, for a site placing the figure.
   * @default undefined
   */
  className?: string;
  /**
   * Value of the `data-testid` attribute of the wrapper, for the end-to-end
   * tests.
   * @default undefined
   */
  testId?: string;
}

/**
 * The frame every chart in the family is drawn in: a plot rectangle, two
 * niced axes, a clip, and a layer of floating chrome over the top.
 *
 * The grid goes down before the caller's marks and the axes go over them, so
 * a rule never crosses a point and a tick is never buried under one. The clip
 * is keyed on a generated id: two frames on a page would otherwise share one,
 * and the second would silently steal the first's.
 * @param props - See {@link ChartFrameProps}.
 * @returns The chart.
 */
export function ChartFrame(props: ChartFrameProps): ReactElement {
  const {
    width,
    height,
    x,
    y,
    children,
    overlay,
    busy = false,
    label = '',
    margins = {},
    geometry,
    svgProps,
    scalable = false,
    className,
    testId,
  } = props;
  const clipId = useId();

  const frame = geometry ?? chartFrameGeometry(width, height, x, y, margins);
  const { plot, xAxis, yAxis, x: xPixels, y: yPixels } = frame;

  const horizontal = {
    orientation: 'bottom',
    scale: xAxis,
    pixels: xPixels,
    plot,
    label: x.label,
    showGrid: x.showGrid,
    showTicks: x.showTicks ?? true,
  } as const;
  const vertical = {
    orientation: 'left',
    scale: yAxis,
    pixels: yPixels,
    plot,
    label: y.label,
    showGrid: y.showGrid,
    showTicks: y.showTicks ?? true,
  } as const;

  return (
    <div
      className={joinClassNames('chart-frame', className)}
      style={
        scalable
          ? scalableFrameStyle(width, height)
          : chartFrameStyle(width, height)
      }
      data-testid={testId}
    >
      <svg
        {...svgProps}
        width={scalable ? '100%' : Math.max(0, width)}
        height={scalable ? '100%' : Math.max(0, height)}
        viewBox={
          scalable
            ? `0 0 ${Math.max(0, width)} ${Math.max(0, height)}`
            : undefined
        }
        style={CHART_SVG_STYLE}
        role={label === '' ? undefined : 'img'}
        aria-label={label === '' ? undefined : label}
        aria-hidden={label === '' ? true : undefined}
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={plot.left}
              y={plot.top}
              width={plot.width}
              height={plot.height}
            />
          </clipPath>
        </defs>
        <ChartAxis {...horizontal} layer="grid" />
        <ChartAxis {...vertical} layer="grid" />
        <g clipPath={`url(#${clipId})`}>{children(frame)}</g>
        <ChartAxis {...horizontal} layer="axis" />
        <ChartAxis {...vertical} layer="axis" />
      </svg>
      {overlay === undefined ? null : (
        <OverlayLayer width={width} busy={busy}>
          <ChartFrameContext.Provider value={frame}>
            {overlay}
          </ChartFrameContext.Provider>
        </OverlayLayer>
      )}
    </div>
  );
}

/**
 * The block of a still chart that scales down with its box: as wide as the
 * box allows up to its own width, its height kept in proportion.
 * @param width - Its width, in pixels.
 * @param height - Its height, in pixels.
 * @returns The block's style.
 */
function scalableFrameStyle(width: number, height: number): CSSProperties {
  return {
    position: 'relative',
    width: '100%',
    maxWidth: Math.max(0, width),
    aspectRatio: `${Math.max(1, width)} / ${Math.max(1, height)}`,
  };
}
