import type { CSSProperties, ReactElement } from 'react';
import { useRef } from 'react';
import { Button } from 'react-science/ui';

import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import type { OverlayMetrics } from '../core/overlayMetrics.ts';
import { placeOverlayCard } from '../core/placeOverlayCard.ts';

import { overlayReadoutStyle } from './overlayFigureStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

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
}

/**
 * The card that follows the pointer and says everything known about the mark
 * under it.
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
    title,
    rows,
    maxRows = 12,
    pinned = false,
    onUnpin,
    testId,
  } = props;
  const { metrics } = useOverlaySurface();
  const card = useRef<HTMLDivElement>(null);
  const measured = useContainerSize(card);

  const room = Math.max(1, maxRows);
  const hidden = pinned ? 0 : Math.max(0, rows.length - room);
  const written = hidden === 0 ? rows : rows.slice(0, room);
  const lines = written.length + (hidden === 0 ? 1 : 2);
  const place = placeOverlayCard({
    pointerX: x,
    pointerY: y,
    cardWidth: measured.width > 0 ? measured.width : ESTIMATED_WIDTH,
    cardHeight: measured.height > 0 ? measured.height : estimatedHeight(lines),
    boxWidth,
    boxHeight,
  });

  return (
    <div
      ref={card}
      data-testid={testId}
      role={pinned ? 'group' : 'tooltip'}
      aria-label={pinned ? title : undefined}
      style={{
        ...overlayReadoutStyle(metrics),
        left: place.left,
        top: place.top,
        ...(pinned ? pinnedStyle(boxHeight, metrics) : null),
      }}
    >
      <div style={TITLE_STYLE}>
        <span>{title}</span>
        {pinned && onUnpin !== undefined ? (
          <Button
            variant="minimal"
            size="small"
            icon="cross"
            aria-label="Dismiss"
            onClick={onUnpin}
          />
        ) : null}
      </div>
      {readoutLines(written)}
      {hidden === 0 ? null : (
        <div style={FOOTER_STYLE}>
          {`+ ${hidden} more — click to keep this open`}
        </div>
      )}
    </div>
  );
}

/**
 * The rows, each keyed by what it says rather than by where it sits, so a card
 * that gains a line above an existing one leaves the lines below it alone.
 *
 * A label can legitimately repeat — the same axis drawn on both sides of a map
 * writes its name twice — so a repeat is counted and carries that count.
 * @param rows - The lines to write, in the caller's order.
 * @returns One element per row.
 */
function readoutLines(rows: readonly OverlayReadoutRow[]): ReactElement[] {
  const lines: ReactElement[] = [];
  const seen = new Map<string, number>();
  for (const row of rows) {
    const repeat = seen.get(row.label) ?? 0;
    seen.set(row.label, repeat + 1);
    lines.push(
      <div
        key={repeat === 0 ? row.label : `${row.label} ${String(repeat)}`}
        style={ROW_STYLE}
      >
        {row.color === undefined ? null : (
          <span style={{ ...CHIP_STYLE, background: row.color }} />
        )}
        <span style={LABEL_STYLE}>{row.label}</span>
        <span style={VALUE_STYLE}>{row.value}</span>
      </div>,
    );
  }
  return lines;
}

/**
 * The card is placed from an estimate until it has been measured once, and the
 * estimate errs wide on purpose: a card that flips a few pixels early is still
 * read where the reader is looking, while one that flips late is cut off by
 * the edge of the figure.
 * @param lines - How many lines the card is about to hold, its title included.
 * @returns Its likely height in pixels.
 */
function estimatedHeight(lines: number): number {
  return ESTIMATED_PADDING + lines * ESTIMATED_LINE_HEIGHT;
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

const ESTIMATED_WIDTH = 220;
const ESTIMATED_LINE_HEIGHT = 18;
const ESTIMATED_PADDING = 16;
const MINIMUM_PINNED_HEIGHT = 80;

const TITLE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  fontWeight: 600,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 6,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  color: 'var(--text-muted)',
} as const satisfies CSSProperties;

/**
 * The values line up on their own column and share one digit width, so a
 * column of numbers can be compared down the card rather than read one by one.
 */
const VALUE_STYLE = {
  marginLeft: 'auto',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;

const CHIP_STYLE = {
  alignSelf: 'center',
  flex: 'none',
  width: 8,
  height: 8,
  borderRadius: 2,
} as const satisfies CSSProperties;

const FOOTER_STYLE = {
  marginTop: 2,
  paddingTop: 2,
  borderTop: '1px solid var(--border)',
  color: 'var(--text-faint)',
} as const satisfies CSSProperties;
