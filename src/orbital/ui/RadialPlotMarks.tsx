/**
 * What a radial plot draws inside its frame: the distribution, the amplitude
 * when it is asked for, a rule on every node and one on the peak.
 */

import type { ReactElement } from 'react';

import type { ChartFrameRender } from '../../chart/ui/ChartFrame.tsx';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { PhasePalette } from '../core/palette.ts';
import type { RadialDistribution } from '../core/radialDistribution.ts';

import { radialPlotGeometry } from './radialPlotGeometry.ts';

/** Props of {@link RadialPlotMarks}. */
interface RadialPlotMarksProps {
  /** The frame the marks are drawn in. */
  frame: ChartFrameRender;
  /** The sampled orbital. */
  distribution: RadialDistribution;
  /** Displayed units per ångström. */
  unitFactor: number;
  /** Whether `R` is overlaid, coloured by phase. */
  showAmplitude: boolean;
  /** Whether the most probable distance is ruled. */
  showPeak: boolean;
  /** The colours of the two phases. */
  palette: PhasePalette;
}

/**
 * The marks of a radial plot.
 * @param props - See {@link RadialPlotMarksProps}.
 * @returns An SVG group.
 */
export function RadialPlotMarks(props: RadialPlotMarksProps): ReactElement {
  const { frame, distribution, unitFactor, showAmplitude, showPeak, palette } =
    props;
  const geometry = radialPlotGeometry(
    distribution,
    frame.x,
    frame.y,
    unitFactor,
    showAmplitude,
  );

  return (
    <g>
      <path d={geometry.densityArea} fill={INK} fillOpacity={0.1} />
      <path
        d={geometry.densityLine}
        fill="none"
        stroke={INK}
        strokeWidth={1.6}
        data-mark="density"
      />
      {geometry.amplitudeRuns.map((run) => (
        <path
          key={run.path}
          d={run.path}
          fill="none"
          stroke={run.positive ? palette.positive : palette.negative}
          strokeWidth={1.6}
          strokeDasharray="5 3"
          data-mark={run.positive ? 'amplitude-positive' : 'amplitude-negative'}
        />
      ))}
      {distribution.nodeRadii.map((radius) => (
        <VerticalRule
          key={radius}
          frame={frame}
          value={radius * unitFactor}
          label="node"
          color={INK}
          dashed
        />
      ))}
      {showPeak ? (
        <VerticalRule
          frame={frame}
          value={distribution.peakDistance * unitFactor}
          label="peak"
          color={FAINT_INK}
          dashed={false}
        />
      ) : null}
    </g>
  );
}

interface VerticalRuleProps {
  frame: ChartFrameRender;
  value: number;
  label: 'node' | 'peak';
  color: string;
  dashed: boolean;
}

function VerticalRule(props: VerticalRuleProps): ReactElement {
  const { frame, value, label, color, dashed } = props;
  const x = frame.x.offset + value * frame.x.factor;
  return (
    <g data-mark={label}>
      <line
        x1={x}
        x2={x}
        y1={frame.plot.top + 12}
        y2={frame.plot.bottom}
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashed ? '3 3' : undefined}
        opacity={0.6}
      />
      <text
        x={x}
        y={frame.plot.top + 9}
        textAnchor="middle"
        fontSize={10}
        fill={MUTED_INK}
      >
        {label}
      </text>
    </g>
  );
}

const INK = TOKEN.text;
const MUTED_INK = TOKEN.textMuted;
const FAINT_INK = TOKEN.textFaint;
