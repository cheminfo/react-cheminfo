/**
 * The radial distribution of one orbital: how far from the nucleus its
 * electron is, with every radial node ruled.
 *
 * What has to be legible is not the curve but its `n − ℓ − 1` zeros, so each
 * is marked with a rule that sits exactly on the crossing. With the amplitude
 * overlaid the picture also says why they are nodes: `R` crosses zero and
 * changes colour there, while `r²R²` only touches it.
 *
 * ```tsx
 * import { RadialPlot } from 'react-cheminfo/orbital';
 *
 * <RadialPlot parameters={{ n: 3, l: 0, charge: 2.2 }} name="3s" showAmplitude />;
 * ```
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useMemo, useRef } from 'react';

import { ChartFrame } from '../../chart/ui/ChartFrame.tsx';
import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { HydrogenicParameters } from '../core/hydrogenic.ts';
import type { PhasePalette } from '../core/palette.ts';
import { PHASE_PALETTES } from '../core/palette.ts';
import type { RadialDistribution } from '../core/radialDistribution.ts';
import { radialDistribution } from '../core/radialDistribution.ts';

import { RadialPlotMarks } from './RadialPlotMarks.tsx';

/** The unit distances are written in. */
export type RadialPlotUnit = 'pm' | 'angstrom';

/** Props of {@link RadialPlot}. */
export interface RadialPlotProps {
  /** Which orbital, and how strongly it is bound. */
  parameters: HydrogenicParameters;
  /**
   * What the curve belongs to, e.g. `3d`, for the label a screen reader reads.
   * @default undefined
   */
  name?: string;
  /**
   * Whether the amplitude `R` is overlaid, dashed and coloured by phase.
   * @default false
   */
  showAmplitude?: boolean;
  /**
   * The colours the two phases of the amplitude are drawn in.
   * @default PHASE_PALETTES.textbook
   */
  palette?: PhasePalette;
  /**
   * Whether the distance the electron is most likely at is ruled.
   * @default true
   */
  showPeak?: boolean;
  /**
   * The unit the distance axis is written in.
   * @default 'pm'
   */
  unit?: RadialPlotUnit;
  /**
   * Width of the plot, in pixels.
   * @default the width of the element it is placed in
   */
  width?: number;
  /**
   * Height of the plot, in pixels.
   * @default 220
   */
  height?: number;
  /**
   * What is written under the plot, from the same samples the curve was drawn
   * from — so a sentence quoting the peak quotes the plotted one.
   * @default undefined
   */
  renderCaption?: (distribution: RadialDistribution) => ReactNode;
  /**
   * Class of the outermost element.
   * @default undefined
   */
  className?: string;
}

/**
 * The radial distribution plot.
 * @param props - See {@link RadialPlotProps}.
 * @returns A figure holding the plot and its optional caption.
 */
export function RadialPlot(props: RadialPlotProps): ReactElement {
  const {
    parameters,
    name,
    showAmplitude = false,
    palette = PHASE_PALETTES.textbook,
    showPeak = true,
    unit = 'pm',
    width,
    height = 220,
    renderCaption,
    className,
  } = props;
  const { n, l, charge } = parameters;

  const figureRef = useRef<HTMLElement>(null);
  const measured = useContainerSize(figureRef);
  const distribution = useMemo(
    () => radialDistribution({ n, l, charge }),
    [n, l, charge],
  );
  const unitFactor = UNIT_FACTORS[unit];
  const curves = showAmplitude ? 'r²R² and R' : 'r²R²';

  return (
    <figure ref={figureRef} className={className} style={FIGURE_STYLE}>
      <ChartFrame
        width={width ?? measured.width}
        height={height}
        x={{
          domain: [0, distribution.limit * unitFactor],
          label: `Distance from the nucleus (${UNIT_LABELS[unit]})`,
          showGrid: false,
        }}
        y={{
          domain: showAmplitude ? [-1, 1] : [0, 1],
          label: `${curves} (relative)`,
          showGrid: false,
          showTicks: false,
          nice: false,
        }}
        label={accessibleLabel(name, distribution.nodeRadii.length)}
        testId="radial-plot"
      >
        {(frame) => (
          <RadialPlotMarks
            frame={frame}
            distribution={distribution}
            unitFactor={unitFactor}
            showAmplitude={showAmplitude}
            showPeak={showPeak}
            palette={palette}
          />
        )}
      </ChartFrame>
      {renderCaption === undefined ? null : (
        <figcaption style={CAPTION_STYLE}>
          {renderCaption(distribution)}
        </figcaption>
      )}
    </figure>
  );
}

function accessibleLabel(name: string | undefined, nodes: number): string {
  const subject = name === undefined ? 'an orbital' : `the ${name} orbital`;
  const count = `${nodes} radial node${nodes === 1 ? '' : 's'}`;
  return `Radial distribution of ${subject}, ${count}`;
}

const UNIT_FACTORS: Record<RadialPlotUnit, number> = {
  pm: 100,
  angstrom: 1,
};

const UNIT_LABELS: Record<RadialPlotUnit, string> = {
  pm: 'pm',
  angstrom: 'Å',
};

const FIGURE_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  margin: 0,
  minWidth: 0,
};

const CAPTION_STYLE: CSSProperties = {
  color: TOKEN.textMuted,
  fontSize: 12,
  lineHeight: 1.4,
};
