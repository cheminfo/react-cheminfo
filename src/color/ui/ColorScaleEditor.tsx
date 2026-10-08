import { Button, HTMLSelect } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { NumberInput } from '../../number/ui/NumberInput.tsx';
import { normalizeHexColor } from '../core/hex.ts';
import type {
  ColorInterpolation,
  ColorScale,
  ColorStop,
} from '../core/interpolate.ts';
import {
  MINIMUM_CUSTOM_STOPS,
  moveColorStop,
  recolorColorStop,
  removeColorStop,
} from '../core/stops.ts';

import { ColorScaleTone } from './ColorScaleTone.tsx';
import { ColorScaleTrack } from './ColorScaleTrack.tsx';

const POSITION_STEP = 0.01;
// A `type="color"` input only takes six hex digits; an anchor that is not a
// hex colour is shown as black until it is picked again.
const UNREADABLE_COLOR = '#000000';

/** The paths between two anchors, in the order the picker lists them. */
const INTERPOLATIONS: readonly ColorInterpolation[] = [
  'rgb',
  'hsv',
  'hsv-long',
];

/** What {@link ColorScaleEditor} edits. */
export interface ColorScaleEditorProps {
  /** The scale being edited; every anchor is a `#rgb` or `#rrggbb` colour. */
  value: ColorScale;
  /** Called with the edited scale on every change. */
  onChange: (scale: ColorScale) => void;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * A colour scale of the reader's own, edited on the strip it draws.
 *
 * A click on the strip adds an anchor in the colour already there, an anchor
 * is dragged along it, and an anchor pointed at goes with Backspace. The
 * anchor last touched shows its colour and position below, to set exactly.
 * @param props - See {@link ColorScaleEditorProps}.
 * @returns The strip, the selected anchor, and the picker of the path between anchors.
 */
export function ColorScaleEditor(props: ColorScaleEditorProps): ReactElement {
  const { className, value, onChange } = props;
  const t = useChromeT();
  const stops = value.stops;
  const [picked, setPicked] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const colorInput = useRef<HTMLInputElement>(null);
  const selected = Math.min(picked, stops.length - 1);
  const stop = stops[selected];
  const removable = stops.length > MINIMUM_CUSTOM_STOPS;

  function write(next: ColorStop[]): void {
    onChange({ stops: next, interpolation: value.interpolation });
  }

  function remove(index: number): void {
    if (!removable) return;
    write(removeColorStop(stops, index));
    setHovered(null);
    setPicked(Math.max(0, index - 1));
  }

  useEffect(() => {
    if (hovered === null || !removable) return;
    const index = hovered;
    function onKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key !== 'Backspace' && event.key !== 'Delete') return;
      if (isEditable(event.target)) return;
      event.preventDefault();
      onChange({
        stops: removeColorStop(stops, index),
        interpolation: value.interpolation,
      });
      setHovered(null);
      setPicked(Math.max(0, index - 1));
    }
    globalThis.addEventListener('keydown', onKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
    };
  }, [hovered, removable, stops, value.interpolation, onChange]);

  return (
    <div className={className} style={PANEL_STYLE}>
      <ColorScaleTrack
        scale={value}
        selected={selected}
        hovered={hovered}
        onSelect={setPicked}
        onHover={setHovered}
        onChange={write}
        onRemove={remove}
        onPick={() => {
          colorInput.current?.showPicker();
        }}
      />

      <div style={ROW_STYLE}>
        <input
          ref={colorInput}
          type="color"
          aria-label={t('color.anchorColour', { index: selected + 1 })}
          value={normalizeHexColor(stop?.color ?? '') ?? UNREADABLE_COLOR}
          style={SWATCH_STYLE}
          onChange={(event) => {
            write(recolorColorStop(stops, selected, event.target.value));
          }}
        />
        <NumberInput
          ariaLabel={t('color.anchorPosition', { index: selected + 1 })}
          value={stop?.position ?? 0}
          min={0}
          max={1}
          step={POSITION_STEP}
          size="small"
          buttons={false}
          style={POSITION_STYLE}
          onChange={(position) => {
            const moved = moveColorStop(stops, selected, position);
            write(moved.stops);
            setPicked(moved.index);
          }}
        />
        <Button
          icon="trash"
          variant="minimal"
          size="small"
          aria-label={t('color.removeAnchor', { index: selected + 1 })}
          disabled={!removable}
          onClick={() => {
            remove(selected);
          }}
        />
        <span style={SPACER_STYLE} />
        <HTMLSelect
          aria-label={t('color.path')}
          value={value.interpolation}
          options={INTERPOLATIONS.map((interpolation) => ({
            value: interpolation,
            label: t(`color.interpolation.${interpolation}`),
          }))}
          onChange={(event) => {
            onChange({
              stops,
              interpolation: event.currentTarget.value as ColorInterpolation,
            });
          }}
        />
      </div>

      <ColorScaleTone stops={stops} onChange={write} />

      <p style={HINT_STYLE}>{t('color.editorHint')}</p>
    </div>
  );
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 12,
  minWidth: 320,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
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

const POSITION_STYLE = {
  width: 64,
} as const satisfies CSSProperties;

const SPACER_STYLE = {
  flex: '1 1 auto',
} as const satisfies CSSProperties;

const HINT_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 12,
  lineHeight: 1.4,
} as const satisfies CSSProperties;
