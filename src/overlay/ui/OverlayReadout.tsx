import type { CSSProperties, ReactElement } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';
import type { OverlayCardPlacementOptions } from '../core/placeOverlayCard.ts';

import type { ReadoutCardRow } from './ReadoutCard.tsx';
import { ReadoutCard } from './ReadoutCard.tsx';
import { READOUT_PLACE_STYLE } from './overlayFigureStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';
import { useMeasuredPlacement } from './useMeasuredPlacement.ts';

/** One line of an {@link OverlayReadout}. */
export interface OverlayReadoutRow {
  /** What the value is. */
  label: string;
  /** The value, already written out — the readout never formats a number itself. */
  value: string;
  /**
   * A colour chip before the label, for a row belonging to one series.
   * @default undefined
   */
  color?: string;
}

/** What {@link OverlayReadout} shows, and where. */
export interface OverlayReadoutProps {
  /** Where the pointer is, in pixels from the figure's left. */
  x: number;
  /** Where the pointer is, in pixels from the figure's top. */
  y: number;
  /** Width of the figure, so the card can be flipped rather than clipped. */
  boxWidth: number;
  /** Height of the figure. */
  boxHeight: number;
  /**
   * Width of the mark's box from `x` rightwards, for a card anchored to a mark
   * rather than following the pointer: it opens beside the box and flips to
   * the box's other side (`placeOverlayCard`).
   * @default 0 — the card follows the pointer
   */
  anchorWidth?: number;
  /** The first line, in bold — normally what the reader pointed at. */
  title: string;
  /** Everything the caller knows about it, in the caller's own order. */
  rows: readonly OverlayReadoutRow[];
  /**
   * The most rows shown before a `+ 7 more — click to keep this open` footer.
   * A card taller than the figure is a fault, not a feature.
   * @default 12
   */
  maxRows?: number;
  /**
   * Whether the card stays until it is dismissed, in which case it scrolls its
   * own rows and lets the reader select their text.
   * @default false
   */
  pinned?: boolean;
  /**
   * Called when the reader dismisses a pinned card.
   * @default undefined
   */
  onUnpin?: () => void;
  /**
   * Value of the `data-testid` attribute of the card.
   * @default undefined
   */
  testId?: string;
  /**
   * Another card on the figure this one keeps clear of — a loupe beside the
   * pointer, say (`placeOverlayCard`'s `avoid`).
   * @default undefined — nothing to keep clear of
   */
  avoid?: OverlayCardPlacementOptions['avoid'];
}

/**
 * The card that follows the pointer and says everything known about the mark
 * under it: the family's designed card (`ReadoutCard`), placed by its size as
 * drawn (`useMeasuredPlacement`) — hidden until it has been measured once.
 *
 * It follows the pointer rather than anchoring to the mark, because a
 * nearest-within-radius hit test changes which mark it names while the pointer
 * keeps moving, and an anchored card would then teleport. Pinned, it stops
 * following and becomes readable and selectable.
 * @param props - See {@link OverlayReadoutProps}.
 * @returns The card.
 */
export function OverlayReadout(props: OverlayReadoutProps): ReactElement {
  const {
    x,
    y,
    boxWidth,
    boxHeight,
    anchorWidth = 0,
    title,
    rows,
    maxRows = 12,
    pinned = false,
    onUnpin,
    testId,
    avoid,
  } = props;
  const { metrics } = useOverlaySurface();
  const { attach, style } = useMeasuredPlacement({
    pointerX: x,
    pointerY: y,
    boxWidth,
    boxHeight,
    anchorWidth,
    avoid,
  });

  const room = Math.max(1, maxRows);
  const hidden = pinned ? 0 : Math.max(0, rows.length - room);
  const written = hidden === 0 ? rows : rows.slice(0, room);

  return (
    <ReadoutCard
      ref={attach}
      testId={testId}
      role={pinned ? 'group' : 'tooltip'}
      ariaLabel={pinned ? title : undefined}
      title={title}
      rows={readoutLines(written)}
      footer={
        hidden === 0 ? undefined : `+ ${hidden} more — click to keep this open`
      }
      onDismiss={pinned ? onUnpin : undefined}
      style={{
        ...READOUT_PLACE_STYLE,
        ...style,
        ...(pinned ? pinnedStyle(boxHeight, metrics) : null),
      }}
    />
  );
}

/**
 * The rows, each keyed by what it says rather than by where it sits, so a card
 * that gains a line above an existing one leaves the lines below it alone.
 *
 * A label can legitimately repeat — the same axis drawn on both sides of a map
 * writes its name twice — so a repeat is counted and carries that count.
 * @param rows - The lines to write, in the caller's order.
 * @returns The card's rows.
 */
function readoutLines(rows: readonly OverlayReadoutRow[]): ReadoutCardRow[] {
  const lines: ReadoutCardRow[] = [];
  const seen = new Map<string, number>();
  for (const row of rows) {
    const repeat = seen.get(row.label) ?? 0;
    seen.set(row.label, repeat + 1);
    lines.push({
      key: repeat === 0 ? row.label : `${row.label} ${String(repeat)}`,
      label: row.label,
      value: row.value,
      ...(row.color === undefined ? {} : { color: row.color }),
    });
  }
  return lines;
}

/**
 * A pinned card takes the pointer back, so its rows can be selected and its
 * dismiss button pressed, and it never grows past the figure it belongs to.
 * @param boxHeight - Height of the figure.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns What pinning changes.
 */
function pinnedStyle(
  boxHeight: number,
  metrics: OverlayMetrics,
): CSSProperties {
  return {
    pointerEvents: 'auto',
    userSelect: 'text',
    maxHeight: Math.max(MINIMUM_PINNED_HEIGHT, boxHeight - metrics.inset * 2),
    overflowY: 'auto',
  };
}

const MINIMUM_PINNED_HEIGHT = 80;
