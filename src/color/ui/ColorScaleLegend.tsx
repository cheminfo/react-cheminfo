import type { CSSProperties, ReactElement } from 'react';
import { useId } from 'react';

import { formatTrimmed } from '../../format/core/numbers.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { ColorScale } from '../core/interpolate.ts';
import { evenScale, sampleScale } from '../core/interpolate.ts';

const BAR_HEIGHT = 12;
const BAR_WIDTH = 100;
const WHEEL_SAMPLES = 24;

/** What {@link ColorScaleLegend} needs to draw a scale. */
export interface ColorScaleLegendProps {
  /**
   * The scale: a `ColorScale` as the registry, the picker and the editor hand
   * it over, or a plain list of colours spread evenly from the low end to the
   * high end.
   */
  scale: ColorScale | readonly string[];
  /** The value the low end stands for. */
  min: number;
  /** The value the high end stands for. */
  max: number;
  /**
   * Unit written after each end value, e.g. `g/mol`.
   * @default '' — no unit is written
   */
  unit?: string;
  /**
   * What the scale measures, written before it.
   * @default '' — no label is written
   */
  label?: string;
  /**
   * How an end value is written.
   * @default a rounding to three decimals with the trailing zeros dropped
   */
  formatValue?: (value: number) => string;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * The key to a sequential colour scale: its two end values, and the ramp
 * between them.
 *
 * The ramp is a real gradient rather than a row of buckets, and both ends
 * carry their value, so a figure lifted out of the page still says what it is
 * measuring. It is drawn as an SVG, which keeps it crisp in a print and in an
 * exported image. A scale that turns around the colour wheel is sampled, since
 * an SVG gradient only mixes the straight line between two colours.
 * @param props - See {@link ColorScaleLegendProps}.
 * @returns The labelled gradient strip.
 */
export function ColorScaleLegend(props: ColorScaleLegendProps): ReactElement {
  const {
    className,
    scale,
    min,
    max,
    unit = '',
    label = '',
    formatValue = defaultFormatValue,
  } = props;
  const t = useChromeT();
  const gradientId = useId();

  const stops = gradientStops('stops' in scale ? scale : evenScale(scale));
  const low = withUnit(formatValue(min), unit);
  const high = withUnit(formatValue(max), unit);

  return (
    <div className={className} style={ROW_STYLE}>
      {label === '' ? null : <span style={LABEL_STYLE}>{label}</span>}
      <span style={VALUE_STYLE}>{low}</span>
      <svg
        style={BAR_STYLE}
        viewBox={`0 0 ${BAR_WIDTH} ${BAR_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={t('color.legendLabel', {
          what: label === '' ? t('color.colourScale') : label,
          low,
          high,
        })}
      >
        {stops.length === 0 ? null : (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              {stops.map((stop) => (
                <stop
                  key={stop.key}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
          </defs>
        )}
        <rect
          x="0"
          y="0"
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          rx="2"
          fill={stops.length === 0 ? undefined : `url(#${gradientId})`}
          style={stops.length === 0 ? EMPTY_BAR_STYLE : undefined}
        />
      </svg>
      <span style={VALUE_STYLE}>{high}</span>
    </div>
  );
}

interface GradientStop {
  /** Two anchors may share a position and a colour, so the rank is part of it. */
  key: string;
  offset: number;
  color: string;
}

function gradientStops(scale: ColorScale): GradientStop[] {
  if (scale.stops.length === 0) return [];
  if (scale.interpolation !== 'rgb') {
    const sampled = sampledStops(scale);
    if (sampled !== null) return sampled;
  }
  const rendered: GradientStop[] = [];
  let rank = 0;
  for (const stop of scale.stops) {
    rendered.push(gradientStop(rank, stop.position, stop.color));
    rank += 1;
  }
  if (rendered.length === 1) {
    const color = rendered[0]?.color ?? '';
    return [gradientStop(0, 0, color), gradientStop(1, 1, color)];
  }
  return rendered;
}

function gradientStop(
  rank: number,
  offset: number,
  color: string,
): GradientStop {
  return { key: `${rank}:${offset}:${color}`, offset, color };
}

function sampledStops(scale: ColorScale): GradientStop[] | null {
  let colors: string[];
  try {
    colors = sampleScale(scale, WHEEL_SAMPLES);
  } catch {
    // A colour that is not hex cannot be turned around the wheel; its anchors
    // are still drawn as written.
    return null;
  }
  const last = colors.length - 1;
  const stops: GradientStop[] = [];
  for (let index = 0; index < colors.length; index++) {
    stops.push(gradientStop(index, index / last, colors[index] ?? ''));
  }
  return stops;
}

function defaultFormatValue(value: number): string {
  return formatTrimmed(value, 3);
}

function withUnit(value: string, unit: string): string {
  return unit === '' ? value : `${value} ${unit}`;
}

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  color: TOKEN.textMuted,
  fontSize: 12,
} as const satisfies CSSProperties;

const VALUE_STYLE = {
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
} as const satisfies CSSProperties;

const BAR_STYLE = {
  display: 'inline-block',
  flex: '1 1 160px',
  maxWidth: 320,
  height: BAR_HEIGHT,
} as const satisfies CSSProperties;

const EMPTY_BAR_STYLE = {
  fill: TOKEN.border,
} as const satisfies CSSProperties;
