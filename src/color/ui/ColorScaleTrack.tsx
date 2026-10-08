import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from 'react';
import { useRef } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { ColorScale, ColorStop } from '../core/interpolate.ts';
import { addColorStop, moveColorStop } from '../core/stops.ts';

import { ColorScaleBar } from './ColorScaleBar.tsx';

const STRIP_HEIGHT = 28;
const STRIP_SAMPLES = 64;
const SWATCH_SIZE = 14;
const KEY_STEP = 0.01;
const KEY_STEP_LARGE = 0.1;

/** What {@link ColorScaleTrack} draws and hands back. */
export interface ColorScaleTrackProps {
  /** The scale being edited. */
  scale: ColorScale;
  /** The anchor whose colour and position the editor shows. */
  selected: number;
  /** The anchor pointed at, which Backspace would remove. */
  hovered: number | null;
  /** Called when an anchor is clicked, focused, dragged or added. */
  onSelect: (index: number) => void;
  /** Called when an anchor is pointed at, and with `null` when it is left. */
  onHover: (index: number | null) => void;
  /** Called with the anchors after every add or move. */
  onChange: (stops: ColorStop[]) => void;
  /** Called when an anchor asks to be removed, from the keyboard. */
  onRemove: (index: number) => void;
  /** Called when an anchor is double-clicked, to recolour it. */
  onPick: () => void;
}

/**
 * The scale as one strip with its anchors on it: a click on the strip adds an
 * anchor there, and an anchor is dragged along it.
 * @param props - See {@link ColorScaleTrackProps}.
 * @returns The strip and its anchors.
 */
export function ColorScaleTrack(props: ColorScaleTrackProps): ReactElement {
  const {
    scale,
    selected,
    hovered,
    onSelect,
    onHover,
    onChange,
    onRemove,
    onPick,
  } = props;
  const t = useChromeT();
  // The anchors as the drag left them: a pointer can move twice before the
  // page renders the first move, and the second must not undo it.
  const drag = useRef<{ index: number; stops: ColorStop[] } | null>(null);

  function start(event: PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0) return;
    const anchor = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-anchor]',
    );
    let index = Number(anchor?.dataset.anchor);
    let stops = [...scale.stops];
    if (anchor === null) {
      const added = addColorStop(scale, positionOf(event));
      if (added === null) return;
      ({ index, stops } = added);
      onChange(stops);
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    anchor?.focus({ focusVisible: false });
    drag.current = { index, stops };
    onSelect(index);
  }

  function move(event: PointerEvent<HTMLDivElement>): void {
    if (drag.current === null) return;
    const moved = moveColorStop(
      drag.current.stops,
      drag.current.index,
      positionOf(event),
    );
    drag.current = moved;
    onChange(moved.stops);
    onSelect(moved.index);
    onHover(moved.index);
  }

  function stop(): void {
    drag.current = null;
  }

  function nudge(event: KeyboardEvent<HTMLSpanElement>, index: number): void {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();
      onRemove(index);
      return;
    }
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? step
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? -step
          : 0;
    if (delta === 0) return;
    event.preventDefault();
    // From the keyboard an anchor stops at its neighbours, so focus stays on
    // the anchor being moved.
    const low = scale.stops[index - 1]?.position ?? 0;
    const high = scale.stops[index + 1]?.position ?? 1;
    const position = (scale.stops[index]?.position ?? 0) + delta;
    const moved = moveColorStop(
      scale.stops,
      index,
      Math.min(high, Math.max(low, position)),
    );
    onChange(moved.stops);
  }

  return (
    <div
      style={TRACK_STYLE}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <ColorScaleBar
        scale={scale}
        height={STRIP_HEIGHT}
        samples={STRIP_SAMPLES}
        label={t('color.scaleBeingEdited')}
      />
      {scale.stops.map((anchor, index) => (
        <span
          // An anchor has no identity but its rank, and keeping the element
          // keeps the focus on it while it is dragged past a neighbour.
          key={`anchor-${String(index)}`}
          data-anchor={index}
          role="slider"
          tabIndex={0}
          aria-label={t('color.anchorPosition', { index: index + 1 })}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={anchor.position}
          title={anchor.color}
          style={{
            ...ANCHOR_STYLE,
            left: `${String(anchor.position * 100)}%`,
            zIndex: index === selected ? 2 : 1,
          }}
          onFocus={() => {
            onSelect(index);
          }}
          onKeyDown={(event) => {
            nudge(event, index);
          }}
          onPointerEnter={() => {
            if (drag.current === null) onHover(index);
          }}
          onPointerLeave={() => {
            if (drag.current === null) onHover(null);
          }}
          onDoubleClick={onPick}
        >
          <span style={NEEDLE_STYLE} />
          <span
            style={{
              ...SWATCH_STYLE,
              background: anchor.color,
              boxShadow:
                index === selected
                  ? SELECTED_RING
                  : index === hovered
                    ? HOVERED_RING
                    : SWATCH_STYLE.boxShadow,
            }}
          />
        </span>
      ))}
    </div>
  );
}

function positionOf(event: PointerEvent<HTMLDivElement>): number {
  const box = event.currentTarget.getBoundingClientRect();
  return box.width === 0 ? 0 : (event.clientX - box.left) / box.width;
}

const SELECTED_RING = '0 0 0 2px var(--accent)';
const HOVERED_RING = '0 0 0 2px var(--text-muted)';

const TRACK_STYLE = {
  position: 'relative',
  margin: `0 ${String(SWATCH_SIZE / 2 + 2)}px`,
  paddingBottom: SWATCH_SIZE + 4,
  cursor: 'copy',
  touchAction: 'none',
  userSelect: 'none',
} as const satisfies CSSProperties;

const ANCHOR_STYLE = {
  position: 'absolute',
  top: -3,
  bottom: 0,
  display: 'flex',
  width: SWATCH_SIZE + 4,
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'ew-resize',
  outline: 'none',
  transform: 'translateX(-50%)',
} as const satisfies CSSProperties;

const NEEDLE_STYLE = {
  width: 3,
  height: STRIP_HEIGHT + 6,
  border: '1px solid var(--text)',
  borderRadius: 2,
  background: 'var(--surface)',
} as const satisfies CSSProperties;

const SWATCH_STYLE = {
  width: SWATCH_SIZE,
  height: SWATCH_SIZE,
  marginTop: -2,
  border: '2px solid var(--surface)',
  borderRadius: 4,
  boxShadow: '0 0 0 1px var(--border-strong)',
} as const satisfies CSSProperties;
