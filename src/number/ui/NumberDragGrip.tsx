import { Icon } from '@blueprintjs/core';
import type { CSSProperties, PointerEvent, ReactElement } from 'react';
import { useRef } from 'react';

import { clamp } from '../../format/core/clamp.ts';
import { HelpTooltip } from '../../help/ui/HelpTooltip.tsx';
import { snapToStep } from '../core/numberText.ts';

/** What {@link NumberDragGrip} takes. */
export interface NumberDragGripProps {
  /**
   * The number a drag starts from: the one the box stands for, at its full
   * precision rather than as the box rounds it.
   * @default undefined — an empty box, from which a drag starts at 0
   */
  value?: number;
  /** What one CSS pixel of the drag adds. */
  step: number;
  /**
   * What a pixel adds while Shift is held.
   * @default step × 10
   */
  majorStep?: number;
  /**
   * What a pixel adds while Alt is held.
   * @default step ÷ 10
   */
  minorStep?: number;
  /**
   * Smallest value the drag reaches.
   * @default undefined — unbounded below
   */
  min?: number;
  /**
   * Largest value the drag reaches.
   * @default undefined — unbounded above
   */
  max?: number;
  /** Called with each number the drag reaches, on the grid of its step. */
  onChange: (value: number) => void;
  /**
   * Called once the drag is let go.
   * @default undefined
   */
  onDragEnd?: () => void;
  /** What dragging it does, as its card says it: `Drag sideways to change the value`. */
  label: string;
  /** @default false */
  disabled?: boolean;
}

/**
 * A grip that changes a number when dragged sideways, worn at the left of
 * its box (`NumberInput`'s or a Blueprint `InputGroup`'s `leftElement`): a
 * fixed 24 px, so it never shrinks over what the box holds at its right — a
 * unit, a button — however narrow the box gets, and a card saying what it
 * does. The number is read from where the drag was pressed, so a drag let
 * go where it started gives the number back exactly as it was. The box's own keys and its text stay the way to set a value
 * exactly; the grip is the pointer's quick way, so it is not a stop for the
 * keyboard.
 * @param props - See {@link NumberDragGripProps}.
 * @returns The grip.
 */
export function NumberDragGrip(props: NumberDragGripProps): ReactElement {
  const { value, step, min, max, onChange, onDragEnd, label } = props;
  const { majorStep = step * 10, minorStep = step / 10 } = props;
  const { disabled = false } = props;
  const drag = useRef<Stretch | null>(null);

  function press(event: PointerEvent<HTMLSpanElement>): void {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const from = value ?? 0;
    const x = event.clientX;
    drag.current = { x, from, by: step, last: from, lastX: x };
  }

  function move(event: PointerEvent<HTMLSpanElement>): void {
    const held = drag.current;
    if (held === null) return;
    const by = event.shiftKey ? majorStep : event.altKey ? minorStep : step;
    // A key pressed or let go starts a new stretch where the drag is, so the
    // number never jumps; within a stretch it is read from where the stretch
    // began, so the pointer back there gives that number back exactly.
    const stretch =
      by === held.by
        ? held
        : {
            x: held.lastX,
            from: held.last,
            by,
            last: held.last,
            lastX: held.lastX,
          };
    const pixels = Math.round(event.clientX - stretch.x);
    const next =
      pixels === 0
        ? stretch.from
        : clamp(
            snapToStep(stretch.from + pixels * by, by, stretch.from),
            min ?? Number.NEGATIVE_INFINITY,
            max ?? Number.POSITIVE_INFINITY,
            stretch.from,
          );
    drag.current = { ...stretch, last: next, lastX: event.clientX };
    if (next !== stretch.last) onChange(next);
  }

  function release(): void {
    if (drag.current === null) return;
    drag.current = null;
    onDragEnd?.();
  }

  return (
    <HelpTooltip content={{ title: label }}>
      <span
        aria-hidden="true"
        className="number-drag-grip"
        style={disabled ? DISABLED_STYLE : GRIP_STYLE}
        onPointerDown={press}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <Icon icon="arrows-horizontal" size={14} />
      </span>
    </HelpTooltip>
  );
}

/** A drag at one step a pixel: where it began, the number there, and where it is. */
interface Stretch {
  /** Where the stretch began, CSS pixels. */
  x: number;
  /** The number there. */
  from: number;
  /** What a pixel adds over it. */
  by: number;
  /** The number reached last. */
  last: number;
  /** Where the pointer was then. */
  lastX: number;
}

const GRIP_STYLE: CSSProperties = {
  display: 'inline-flex',
  width: 24,
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  cursor: 'ew-resize',
  touchAction: 'none',
  userSelect: 'none',
};

const DISABLED_STYLE: CSSProperties = {
  ...GRIP_STYLE,
  color: 'var(--text-faint)',
  cursor: 'default',
};
