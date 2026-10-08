import { Slider } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useRef } from 'react';

import { formatPercent } from '../../format/core/numbers.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { ColorStop } from '../core/interpolate.ts';
import type { ScaleTone } from '../core/tone.ts';
import { scaleTone, setScaleTone } from '../core/tone.ts';

const STEP = 0.01;
// Above zero: a grey or a black anchor has no hue left to bring back.
const MINIMUM_SATURATION = 0.1;
const MINIMUM_VALUE = 0.2;

/** What {@link ColorScaleTone} edits. */
export interface ColorScaleToneProps {
  /** The anchors of the scale being edited. */
  stops: readonly ColorStop[];
  /** Called with the recoloured anchors on every move of either slider. */
  onChange: (stops: ColorStop[]) => void;
}

/**
 * Two sliders setting the saturation and the brightness of every anchor at
 * once, each anchor keeping its hue.
 * @param props - See {@link ColorScaleToneProps}.
 * @returns The two sliders, each with its value.
 */
export function ColorScaleTone(props: ColorScaleToneProps): ReactElement {
  const { stops, onChange } = props;
  const t = useChromeT();
  const tone = scaleTone(stops);
  // The anchors as a drag found them, so their hues are read once per drag
  // rather than off colours already rounded by the previous move.
  const base = useRef<readonly ColorStop[] | null>(null);

  function set(next: Partial<ScaleTone>): void {
    base.current ??= stops;
    onChange(setScaleTone(base.current, next));
  }

  function release(): void {
    base.current = null;
  }

  return (
    <div style={GRID_STYLE} title={t('color.toneHelp')}>
      <span style={LABEL_STYLE}>{t('color.saturation')}</span>
      <span style={SLIDER_STYLE}>
        <Slider
          min={MINIMUM_SATURATION}
          max={1}
          stepSize={STEP}
          labelRenderer={false}
          value={Math.max(MINIMUM_SATURATION, tone.saturation)}
          onChange={(saturation) => {
            set({ saturation });
          }}
          onRelease={release}
        />
      </span>
      <span style={VALUE_STYLE}>{formatPercent(tone.saturation, 0)}</span>
      <span style={LABEL_STYLE}>{t('color.brightness')}</span>
      <span style={SLIDER_STYLE}>
        <Slider
          min={MINIMUM_VALUE}
          max={1}
          stepSize={STEP}
          labelRenderer={false}
          value={Math.max(MINIMUM_VALUE, tone.value)}
          onChange={(value) => {
            set({ value });
          }}
          onRelease={release}
        />
      </span>
      <span style={VALUE_STYLE}>{formatPercent(tone.value, 0)}</span>
    </div>
  );
}

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'max-content minmax(0, 1fr) 3.5em',
  alignItems: 'center',
  columnGap: 10,
  rowGap: 4,
} as const satisfies CSSProperties;

const LABEL_STYLE = { fontSize: 12 } as const satisfies CSSProperties;

/** Room on both sides, so the handle is never clipped at either end. */
const SLIDER_STYLE = {
  display: 'block',
  paddingInline: 8,
} as const satisfies CSSProperties;

const VALUE_STYLE = {
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
} as const satisfies CSSProperties;
