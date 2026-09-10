import type { CSSProperties, ReactElement } from 'react';
import { useId } from 'react';

import type { OverlayMarkShape } from '../core/overlayMarks.ts';
import type { OverlayMetrics } from '../core/overlayMetrics.ts';
import type { OverlayPlacement } from '../core/overlayPlacement.ts';

import { OverlayLegendMark } from './OverlayLegendMark.tsx';
import {
  OVERLAY_LEGEND_ENTRY_STYLE,
  overlayLegendStyle,
  overlayLegendTitleStyle,
} from './overlayFigureStyles.ts';
import { overlayCardStyle, overlayGroundStyle } from './overlayStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** One entry of an {@link OverlayLegend}. */
export interface OverlayLegendEntry {
  /** A stable id, used as the key and handed back by `onToggle`. */
  id: string;
  /** What the mark means, in the reader's own words. */
  label: string;
  /** The colour the mark carries on the figure. */
  color: string;
  /**
   * Which mark it is. The shape channel is what lets one figure carry two
   * meanings at once — filled dots for the samples, lines for the components.
   * @default 'dot'
   */
  shape?: OverlayMarkShape;
  /**
   * How many samples it covers, written after the label.
   * @default undefined — no count is written
   */
  count?: number;
  /**
   * Whether it is currently drawn faint on the figure, which is what a
   * switched-off entry looks like.
   * @default false
   */
  muted?: boolean;
  /**
   * One line saying why this entry is not drawn in full — a group with too few
   * samples to outline, say.
   * @default undefined
   */
  note?: string;
}

/** What {@link OverlayLegend} needs. */
export interface OverlayLegendProps {
  /**
   * The sentence over the entries, naming what the colour means on this
   * figure: `Colour = species`, `Colour = component`. It has no default on
   * purpose — a legend that does not name its encoding is how a reader carries
   * the wrong meaning from one tab to the next.
   */
  title: string;
  /** The entries, in the order they are drawn. */
  entries: readonly OverlayLegendEntry[];
  /**
   * Where it sits.
   * @default 'bottom-left'
   */
  placement?: OverlayPlacement;
  /**
   * Called with an entry's id when it is pressed, which is what makes the
   * legend a filter. Left out, the entries are text rather than buttons.
   * @default undefined
   */
  onToggle?: (id: string) => void;
  /**
   * The most entries written before the rest fold into `+ 7 more`.
   * @default 8
   */
  maxEntries?: number;
  /**
   * Value of the `data-testid` attribute of the card.
   * @default undefined
   */
  testId?: string;
}

/**
 * The card that says what colour and shape mean on a figure.
 * @param props - See {@link OverlayLegendProps}.
 * @returns The legend.
 */
export function OverlayLegend(props: OverlayLegendProps): ReactElement {
  const {
    title,
    entries,
    placement = 'bottom-left',
    onToggle,
    maxEntries = 8,
    testId,
  } = props;
  const { metrics, awake, busy } = useOverlaySurface();
  const titleId = useId();

  const room = Math.max(1, maxEntries);
  const folded = entries.length > room ? entries.length - (room - 1) : 0;
  const written = folded === 0 ? entries : entries.slice(0, room - 1);

  return (
    <div
      style={overlayCardStyle(placement, metrics)}
      // The key is chrome, since its entries are pressed, but it is part of
      // the picture all the same: the export redraws it into the saved file.
      data-figure="legend"
      data-testid={testId}
    >
      <div style={overlayGroundStyle(awake ? 1 : RESTING_OPACITY, busy)} />
      <div
        role="group"
        aria-labelledby={titleId}
        style={overlayLegendStyle(metrics)}
      >
        <div id={titleId} style={overlayLegendTitleStyle(metrics)}>
          {title}
        </div>
        {written.map((entry) => (
          <LegendEntry key={entry.id} entry={entry} onToggle={onToggle} />
        ))}
        {folded === 0 ? null : (
          <span style={foldStyle(metrics)}>{`+ ${folded} more`}</span>
        )}
      </div>
    </div>
  );
}

interface LegendEntryProps {
  entry: OverlayLegendEntry;
  onToggle: ((id: string) => void) | undefined;
}

/**
 * A legend with no `onToggle` is a key: making its entries buttons would put
 * every one of them in the tab order on the way to nothing.
 * @param props - The entry, and what pressing it does.
 * @returns The entry.
 */
function LegendEntry(props: LegendEntryProps): ReactElement {
  const { entry, onToggle } = props;
  const muted = entry.muted ?? false;
  const style: CSSProperties = {
    ...OVERLAY_LEGEND_ENTRY_STYLE,
    alignItems: entry.note === undefined ? 'center' : 'flex-start',
  };
  const body = (
    <>
      <OverlayLegendMark
        color={entry.color}
        shape={entry.shape}
        muted={muted}
      />
      <span style={TEXT_STYLE}>
        <span style={muted ? MUTED_LABEL_STYLE : LABEL_STYLE}>
          {entryLabel(entry)}
        </span>
        {entry.note === undefined ? null : (
          <span style={NOTE_STYLE}>{entry.note}</span>
        )}
      </span>
    </>
  );

  if (onToggle === undefined) return <span style={style}>{body}</span>;
  return (
    <button
      type="button"
      aria-pressed={!muted}
      style={{ ...style, cursor: 'pointer' }}
      onClick={() => {
        onToggle(entry.id);
      }}
    >
      {body}
    </button>
  );
}

function entryLabel(entry: OverlayLegendEntry): string {
  if (entry.count === undefined) return entry.label;
  return `${entry.label} (${entry.count.toLocaleString()})`;
}

function foldStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    color: 'var(--text-muted)',
    paddingLeft: metrics.gap + 12,
  };
}

/**
 * Only the ground fades while nothing is pointing at the figure. A legend
 * whose words fade with it stops being readable exactly when the reader is
 * looking at the picture rather than at the chrome.
 */
const RESTING_OPACITY = 0.74;

const TEXT_STYLE = {
  display: 'inline-flex',
  flexDirection: 'column',
  gap: 1,
  minWidth: 0,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  color: 'var(--text)',
} as const satisfies CSSProperties;

/**
 * A switched-off entry has to be legible as switched off in a screenshot, in a
 * greyscale print and to a reader who does not separate two of the colours, so
 * the state is written into the shape of the words as well as into their
 * strength.
 */
const MUTED_LABEL_STYLE = {
  color: 'var(--text-faint)',
  textDecoration: 'line-through',
} as const satisfies CSSProperties;

const NOTE_STYLE = {
  color: 'var(--text-faint)',
  fontSize: '0.9em',
} as const satisfies CSSProperties;
