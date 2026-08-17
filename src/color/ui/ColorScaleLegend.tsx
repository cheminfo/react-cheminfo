import type { CSSProperties, ReactElement } from 'react';
import { useId } from 'react';

import { formatTrimmed } from '../../format/core/numbers.ts';

const FALLBACK_STOPS: readonly string[] = ['#e4e8ee'];
const BAR_HEIGHT = 12;
const BAR_WIDTH = 100;

/** What {@link ColorScaleLegend} needs to draw a scale. */
export interface ColorScaleLegendProps {
  /** The scale's colours, from its low end to its high end. */
  stops: readonly string[];
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
}

/**
 * The key to a sequential colour scale: its two end values, and the ramp
 * between them.
 *
 * The ramp is a real gradient rather than a row of buckets, and both ends
 * carry their value, so a figure lifted out of the page still says what it is
 * measuring. It is drawn as an SVG, which keeps it crisp in a print and in an
 * exported image.
 * @param props - See {@link ColorScaleLegendProps}.
 * @returns The labelled gradient strip.
 */
export function ColorScaleLegend(props: ColorScaleLegendProps): ReactElement {
  const {
    stops,
    min,
    max,
    unit = '',
    label = '',
    formatValue = defaultFormatValue,
  } = props;
  const gradientId = useId();

  const scale = stops.length === 0 ? FALLBACK_STOPS : stops;
  const low = withUnit(formatValue(min), unit);
  const high = withUnit(formatValue(max), unit);

  return (
    <div style={ROW_STYLE}>
      {label === '' ? null : <span style={LABEL_STYLE}>{label}</span>}
      <span style={VALUE_STYLE}>{low}</span>
      <svg
        style={BAR_STYLE}
        viewBox={`0 0 ${BAR_WIDTH} ${BAR_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label === '' ? 'Colour scale' : label} from ${low} to ${high}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            {gradientStops(scale).map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          rx="2"
          fill={`url(#${gradientId})`}
        />
      </svg>
      <span style={VALUE_STYLE}>{high}</span>
    </div>
  );
}

function gradientStops(
  stops: readonly string[],
): Array<{ offset: number; color: string }> {
  const last = stops.length - 1;
  const rendered: Array<{ offset: number; color: string }> = [];
  for (let index = 0; index < stops.length; index++) {
    const color = stops[index];
    if (color === undefined) continue;
    rendered.push({ offset: last === 0 ? index : index / last, color });
  }
  if (rendered.length === 1) {
    const only = rendered[0];
    if (only !== undefined) rendered.push({ offset: 1, color: only.color });
  }
  return rendered;
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
  color: 'rgb(95 107 124)',
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
