/**
 * Two figures with a splitter between them, and the share each takes written
 * into the address. The body of `<SplitRow>` and `<SplitColumn>` both.
 *
 * How much room one half deserves beside the other is not ours to decide:
 * somebody embedding the chart wants it nearly whole, somebody teaching off the
 * picker wants the picker nearly whole, and both want the link they hand out to
 * open the way they left it. So the splitter is dragged, the share it comes to
 * rest at goes into `?split=`, and the address is the figure.
 *
 * Two things it cannot do, and must not pretend to: on a screen with no room
 * for two the panes stack and no splitter is drawn; and a link that hid
 * everything one pane holds leaves the other the whole of it rather than a
 * share.
 *
 * **Several bars on one page make a grid, and a grid has to read as one.** Three
 * panes are one of these nested inside the other, and the shares are numbered in
 * reading order — `split` for the first bar a reader meets going left to right
 * and then down, `split2` for the next. Two rules keep that from coming apart:
 * **at most two bars on a page**, because a third is a window manager rather
 * than a tool and every bar is one more thing to understand before the page can
 * be used; and **never a bar across two columns of the same row**, because two
 * of them at independent heights do not read as a grid, they read as a page that
 * has come apart. Divide the column that holds the figures and leave its
 * neighbours whole — or, where both genuinely want the same line, give them one
 * share and one parameter so it runs straight across.
 *
 * The bar itself is react-science's `SplitPane`, and it keeps react-science's
 * look — barely visible on purpose, found by the pointer that changes over it
 * rather than by the eye. All `chrome.css` says about it is that eleven pixels
 * is more gutter than two figures need.
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useRef, useState } from 'react';
import type { SplitPaneSize } from 'react-science/ui';
import { SplitPane } from 'react-science/ui';

import { useResizeObserver } from '../../hooks/ui/useResizeObserver.ts';
import type { SplitRange } from '../core/split.ts';
import { clampSplit } from '../core/split.ts';

/** What both splitters take. */
export interface SplitPanesProps extends SplitRange {
  /**
   * Share of the box the first pane takes, as a whole percentage, or `null`
   * while the page sits at {@link SplitPanesProps.defaultRatio}.
   */
  ratio: number | null;
  /** The share it opens at when the address names none. */
  defaultRatio: number;
  /**
   * Take the share a drag came to rest at, or `null` when the splitter was
   * double-clicked back to the default.
   */
  onRatio: (ratio: number | null) => void;
  /** The first pane — left, or top — or `null` when a link left nothing in it. */
  start: ReactNode;
  /** The second pane, or `null` when a link left nothing in it. */
  end: ReactNode;
  /**
   * The smallest box that is still split, in pixels — a width for a row, a
   * height for a column. Under it the two panes stack and no splitter is drawn.
   * @default 860 across, 420 down
   */
  stackBelow?: number;
  /**
   * The gutter each pane keeps beside the splitter, in pixels, so neither
   * figure is read against its edge.
   * @default 6
   */
  gutter?: number;
  /**
   * The gap between the two panes once they have stacked, in pixels.
   * @default 16
   */
  stackedGap?: number;
}

/** What {@link SplitPanes} takes on top of the public props. */
interface InternalProps extends SplitPanesProps {
  /** Across the box, or down it. */
  direction: 'horizontal' | 'vertical';
}

/**
 * The two panes, divided where the address says.
 *
 * @param props - See {@link SplitPanesProps}.
 * @returns The panes with the splitter between them, the two stacked where
 * there is no room for both, or whichever one a link left, alone.
 */
export function SplitPanes(props: InternalProps): ReactElement | null {
  const {
    direction,
    ratio,
    defaultRatio,
    onRatio,
    start,
    end,
    min,
    max,
    stackBelow = direction === 'horizontal' ? STACK_ACROSS : STACK_DOWN,
    gutter = GUTTER,
    stackedGap = STACKED_GAP,
  } = props;
  const across = direction === 'horizontal';
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(() => viewportSize(across, stackBelow));
  // The share under the pointer, which is not the one in the address: a drag
  // reports every pixel it crosses, and the address is rewritten once, where
  // the splitter is let go.
  const [dragged, setDragged] = useState<number | null>(null);

  useResizeObserver(box, (measured) => {
    setSize(across ? measured.width : measured.height);
  });

  if (start === null && end === null) return null;

  // A column divided by a share needs a box of a definite height to take a
  // share of; in an ordinary page-height one it would measure zero and both
  // panes would collapse, so it stacks instead and says nothing about it.
  const stacked = start === null || end === null || size < stackBelow;
  const startPane =
    start === null ? null : (
      <div
        data-testid="split-start"
        style={stacked ? STACKED_PANE : paneStyle(across, 'start', gutter)}
      >
        {start}
      </div>
    );
  const endPane =
    end === null ? null : (
      <div
        data-testid="split-end"
        style={stacked ? STACKED_PANE : paneStyle(across, 'end', gutter)}
      >
        {end}
      </div>
    );

  if (stacked) {
    return (
      <div ref={box} style={{ ...STACK, gap: stackedGap }}>
        {startPane}
        {endPane}
      </div>
    );
  }

  const share = clampSplit(dragged ?? ratio ?? defaultRatio, { min, max });

  return (
    // `split-row` is what `chrome.css` reaches the bar through: it is
    // react-science's own element and carries no class of ours.
    <div ref={box} className="split-row" style={across ? undefined : FILL}>
      <SplitPane
        direction={direction}
        controlledSide="start"
        size={`${share}%`}
        // Held open, so the only layout a visitor can reach is one the address
        // describes: left to itself a double click collapses a pane, and a link
        // shared from there would open with the pane back. The double click is
        // answered here instead, by returning to the page's own share.
        open
        onOpenChange={() => {
          setDragged(null);
          onRatio(null);
        }}
        onSizeChange={(asked) => {
          setDragged(shareOf(asked, share, { min, max }));
        }}
        onResize={(asked) => {
          const rested = shareOf(asked, share, { min, max });
          setDragged(null);
          onRatio(rested);
        }}
      >
        {startPane}
        {endPane}
      </SplitPane>
    </div>
  );
}

/**
 * The share a splitter asked for.
 *
 * @param asked - What it reported, a percentage because that is what it was
 * given.
 * @param current - The share in force, kept when the report is not a number.
 * @param range - The range this box is divided in.
 * @returns A whole percentage inside it.
 */
function shareOf(
  asked: SplitPaneSize,
  current: number,
  range: SplitRange,
): number {
  const value = Number.parseFloat(asked);
  return Number.isFinite(value) ? clampSplit(value, range) : current;
}

/**
 * How big the window is, which is what the box is taken to be until it has been
 * measured. Reading it rather than starting at zero is what keeps a wide page
 * from laying itself out stacked and splitting a frame later, which would build
 * both figures twice on every load.
 *
 * @param across - Whether the box is divided across or down.
 * @param fallback - What to answer where there is no window to read — a test,
 * or a page rendered to a string.
 * @returns The size in pixels.
 */
function viewportSize(across: boolean, fallback: number): number {
  const measure = across ? globalThis.innerWidth : globalThis.innerHeight;
  return typeof measure === 'number' && measure > 0 ? measure : fallback;
}

/** The narrowest box still divided across, in pixels. */
const STACK_ACROSS = 860;

/**
 * The shortest box still divided down, in pixels. Two figures sharing less than
 * this have about two hundred pixels each, which is under what any of them
 * reads at.
 */
const STACK_DOWN = 420;

/** The gutter a pane keeps beside the splitter, in pixels. */
const GUTTER = 6;

/** The gap between the panes once they have stacked, in pixels. */
const STACKED_GAP = 16;

const STACK = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
} as const satisfies CSSProperties;

const STACKED_PANE = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
} as const satisfies CSSProperties;

/** A column takes the height it is given, so its share has something to divide. */
const FILL = {
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
  minHeight: 0,
} as const satisfies CSSProperties;

function paneStyle(
  across: boolean,
  side: 'start' | 'end',
  gutter: number,
): CSSProperties {
  const edge = across
    ? side === 'start'
      ? 'paddingRight'
      : 'paddingLeft'
    : side === 'start'
      ? 'paddingBottom'
      : 'paddingTop';
  return {
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    [edge]: gutter,
  };
}
