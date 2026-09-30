import type { CSSProperties, KeyboardEvent, ReactElement } from 'react';
import { useState } from 'react';

import type { OverlayMetrics } from '../../overlay/core/overlayMetrics.ts';
import { OverlayRow } from '../../overlay/ui/OverlayRow.tsx';
import { useOverlaySurface } from '../../overlay/ui/overlaySurface.ts';
import { overlayFocusRing } from '../../overlay/ui/overlayValueStyles.ts';
import { figureLayoutSide } from '../core/figureLayout.ts';
import type { FigurePixels } from '../core/figureScale.ts';

/** What {@link FigureSizeField} needs. */
export interface FigureSizeFieldProps {
  /** What the row is called. */
  label: string;
  /** What the first box is called, for a screen reader. */
  widthLabel: string;
  /** What the second box is called. */
  heightLabel: string;
  /** The size typed so far. */
  value: FigurePixels;
  /** Called with the size, each side already held to the range. */
  onChange: (size: FigurePixels) => void;
}

/**
 * The two sides of a figure, typed in pixels.
 *
 * These are typed rather than stepped: a reader asking for 1920 × 1080 knows
 * the numbers, and a stepper would take a hundred presses to reach them. A side
 * is taken when the reader leaves its box or presses Enter, never on each key,
 * since the `1` of a `1200` on its way in is not a width anybody asked for.
 * @param props - See {@link FigureSizeFieldProps}.
 * @returns The row.
 */
export function FigureSizeField(props: FigureSizeFieldProps): ReactElement {
  const { label, widthLabel, heightLabel, value, onChange } = props;
  const { metrics } = useOverlaySurface();

  return (
    <OverlayRow label={label}>
      <span style={{ ...FIELD_STYLE, fontSize: metrics.fontSize }}>
        <SideInput
          label={widthLabel}
          value={value.width}
          metrics={metrics}
          onCommit={(width) => onChange({ ...value, width })}
        />
        <span aria-hidden="true">×</span>
        <SideInput
          label={heightLabel}
          value={value.height}
          metrics={metrics}
          onCommit={(height) => onChange({ ...value, height })}
        />
        <span style={UNIT_STYLE}>px</span>
      </span>
    </OverlayRow>
  );
}

interface SideInputProps {
  /** What the box is called. */
  label: string;
  /** The side as last taken. */
  value: number;
  /** The measurements the panel is drawn from. */
  metrics: OverlayMetrics;
  /** Called with the side once it is taken. */
  onCommit: (side: number) => void;
}

/**
 * One side, typed.
 * @param props - See {@link SideInputProps}.
 * @returns The box.
 */
function SideInput(props: SideInputProps): ReactElement {
  const { label, value, metrics, onCommit } = props;
  const [draft, setDraft] = useState(String(value));
  const [taken, setTaken] = useState(value);
  const [focused, setFocused] = useState(false);

  // A side changed from outside — another shape picked, a clamp — replaces
  // whatever was being typed.
  if (taken !== value) {
    setTaken(value);
    setDraft(String(value));
  }

  function commit(): void {
    const typed = Number.parseFloat(draft);
    const side = Number.isFinite(typed) ? figureLayoutSide(typed) : value;
    setDraft(String(side));
    if (side !== value) onCommit(side);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    commit();
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={draft}
      style={{ ...sideStyle(metrics), ...overlayFocusRing(focused) }}
      onChange={(event) => setDraft(event.currentTarget.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
      onKeyDown={onKeyDown}
    />
  );
}

/**
 * A box as tall as every other control of the panel, and wide enough for four
 * digits.
 * @param metrics - The measurements the panel is drawn from.
 * @returns The box's rules.
 */
function sideStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    boxSizing: 'border-box',
    width: '5em',
    height: metrics.controlHeight,
    padding: '0 6px',
    border: '1px solid var(--border)',
    borderRadius: metrics.controlRadius,
    background: 'var(--surface)',
    color: 'var(--text)',
    font: 'inherit',
    fontSize: metrics.fontSize,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
  };
}

const FIELD_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: 'var(--text-muted)',
} as const satisfies CSSProperties;

const UNIT_STYLE = {
  color: 'var(--text-faint)',
} as const satisfies CSSProperties;
