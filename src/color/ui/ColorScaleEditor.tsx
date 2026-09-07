import { Button, HTMLSelect } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { parseHexColor, toHexColor } from '../core/hex.ts';
import type {
  ColorInterpolation,
  ColorScale,
  ColorStop,
} from '../core/interpolate.ts';
import { colorAt } from '../core/interpolate.ts';
import { MAXIMUM_CUSTOM_STOPS } from '../core/scaleText.ts';

import { ColorScaleBar } from './ColorScaleBar.tsx';

const MINIMUM_STOPS = 2;
const POSITION_STEP = 0.01;
const PREVIEW_HEIGHT = 16;
const PREVIEW_SAMPLES = 48;

/** What each path between two anchors is called. */
const INTERPOLATION_LABELS: Array<{
  value: ColorInterpolation;
  label: string;
}> = [
  { value: 'rgb', label: 'RGB — mix the channels' },
  { value: 'hsv', label: 'HSV — turn the short way' },
  { value: 'hsv-long', label: 'HSV — turn the long way' },
];

/** What {@link ColorScaleEditor} edits. */
export interface ColorScaleEditorProps {
  /** The scale being edited; every anchor is a `#rgb` or `#rrggbb` colour. */
  value: ColorScale;
  /** Called with the edited scale on every change. */
  onChange: (scale: ColorScale) => void;
}

/**
 * A colour scale of the reader's own: the colours it passes through, where
 * each one sits, and the path it takes between them.
 *
 * A colour is anchored rather than typed into a list, so two anchors and the
 * HSV path already describe a whole rainbow, and an anchor never crosses its
 * neighbours — the scale it draws is always the one the strip above shows.
 * @param props - See {@link ColorScaleEditorProps}.
 * @returns The preview, the anchors, and the picker of the path between them.
 */
export function ColorScaleEditor(props: ColorScaleEditorProps): ReactElement {
  const { value, onChange } = props;
  const stops = value.stops;

  function write(next: readonly ColorStop[]): void {
    onChange({ stops: next, interpolation: value.interpolation });
  }

  return (
    <div style={PANEL_STYLE}>
      <ColorScaleBar
        scale={value}
        height={PREVIEW_HEIGHT}
        samples={PREVIEW_SAMPLES}
        label="The scale being edited"
      />

      <div style={ROWS_STYLE}>
        {stops.map((stop, index) => (
          <div key={`${String(index)}-${stop.color}`} style={ROW_STYLE}>
            <input
              type="color"
              aria-label={`Colour of anchor ${String(index + 1)}`}
              value={normalizeColor(stop.color)}
              style={SWATCH_STYLE}
              onChange={(event) => {
                write(replace(stops, index, { color: event.target.value }));
              }}
            />
            <input
              type="range"
              aria-label={`Position of anchor ${String(index + 1)}`}
              min={0}
              max={1}
              step={POSITION_STEP}
              value={stop.position}
              style={SLIDER_STYLE}
              onChange={(event) => {
                write(
                  replace(stops, index, {
                    position: hold(stops, index, event.target.valueAsNumber),
                  }),
                );
              }}
            />
            <span style={POSITION_STYLE}>{stop.position.toFixed(2)}</span>
            <Button
              icon="cross"
              variant="minimal"
              size="small"
              aria-label={`Remove anchor ${String(index + 1)}`}
              disabled={stops.length <= MINIMUM_STOPS}
              onClick={() => {
                write(stops.filter((_, at) => at !== index));
              }}
            />
          </div>
        ))}
      </div>

      <div style={FOOTER_STYLE}>
        <Button
          icon="plus"
          size="small"
          text="Add a colour"
          disabled={stops.length >= MAXIMUM_CUSTOM_STOPS}
          onClick={() => {
            write(withAddedStop(value));
          }}
        />
        <HTMLSelect
          aria-label="Path between two anchors"
          value={value.interpolation}
          options={INTERPOLATION_LABELS}
          onChange={(event) => {
            onChange({
              stops,
              interpolation: event.currentTarget.value as ColorInterpolation,
            });
          }}
        />
      </div>
    </div>
  );
}

function replace(
  stops: readonly ColorStop[],
  index: number,
  patch: Partial<ColorStop>,
): ColorStop[] {
  return stops.map((stop, at) => (at === index ? { ...stop, ...patch } : stop));
}

/**
 * A position an anchor may take: never past either of its neighbours, so the
 * rows never reorder under a dragging finger.
 * @param stops - The anchors as they stand.
 * @param index - Which of them is being moved.
 * @param position - Where it is being moved to.
 * @returns The position it is allowed to take.
 */
function hold(
  stops: readonly ColorStop[],
  index: number,
  position: number,
): number {
  if (!Number.isFinite(position)) return stops[index]?.position ?? 0;
  const low = stops[index - 1]?.position ?? 0;
  const high = stops[index + 1]?.position ?? 1;
  return Math.min(high, Math.max(low, position));
}

/**
 * The anchors with one more, dropped in the widest gap and taking the colour
 * the scale already has there — so adding one changes nothing until it is moved.
 * @param scale - The scale being edited.
 * @returns Its anchors, with the new one among them.
 */
function withAddedStop(scale: ColorScale): ColorStop[] {
  const stops = [...scale.stops];
  let widest = 0;
  let at = 1;
  for (let index = 1; index < stops.length; index++) {
    const span =
      (stops[index]?.position ?? 0) - (stops[index - 1]?.position ?? 0);
    if (span > widest) {
      widest = span;
      at = index;
    }
  }
  const position =
    ((stops[at]?.position ?? 1) + (stops[at - 1]?.position ?? 0)) / 2;
  stops.splice(at, 0, { position, color: colorAt(scale, position) });
  return stops;
}

/**
 * A colour a `type="color"` input reads: it takes six digits and nothing else,
 * so a short hex is spelled out first.
 * @param color - The anchor's colour, `#rgb` or `#rrggbb`.
 * @returns The same colour, in six digits.
 */
function normalizeColor(color: string): string {
  return toHexColor(parseHexColor(color));
}

const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 12,
  minWidth: 280,
} as const satisfies CSSProperties;

const ROWS_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
} as const satisfies CSSProperties;

const SWATCH_STYLE = {
  width: 32,
  height: 24,
  padding: 0,
  border: 0,
  background: 'none',
  cursor: 'pointer',
} as const satisfies CSSProperties;

const SLIDER_STYLE = {
  flex: '1 1 auto',
  minWidth: 90,
  accentColor: 'var(--accent, currentColor)',
} as const satisfies CSSProperties;

const POSITION_STYLE = {
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
  width: 30,
  textAlign: 'right',
} as const satisfies CSSProperties;

const FOOTER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  justifyContent: 'space-between',
} as const satisfies CSSProperties;
