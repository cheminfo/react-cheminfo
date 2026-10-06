/**
 * Two figures side by side, with a splitter between them and the share each
 * takes written into the address.
 *
 * How much room the tool deserves beside the figure it feeds is not ours to
 * decide: somebody embedding the chart wants it nearly whole, somebody
 * teaching off the picker wants the picker nearly whole, and both want the
 * link they hand out to open the way they left it. So the splitter is dragged,
 * the share it comes to rest at goes into `?split=`, and the address is the
 * figure.
 *
 * Two things it cannot do, and must not pretend to: on a narrow screen there
 * is no room for two columns at all, so the panes stack and no splitter is
 * drawn; and a link that hid everything one pane holds leaves the other the
 * whole width rather than a share of it.
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

/** Props of {@link SplitRow}. */
export interface SplitRowProps extends SplitRange {
  /**
   * Share of the row the first pane takes, as a whole percentage, or `null`
   * while the page sits at {@link SplitRowProps.defaultRatio}.
   */
  ratio: number | null;
  /** The share the row opens at when the address names none. */
  defaultRatio: number;
  /**
   * Take the share a drag came to rest at, or `null` when the splitter was
   * double-clicked back to the default.
   */
  onRatio: (ratio: number | null) => void;
  /** The left-hand pane, or `null` when a link left nothing in it. */
  start: ReactNode;
  /** The right-hand pane, or `null` when a link left nothing in it. */
  end: ReactNode;
  /**
   * The narrowest row that is still split; under it the two panes stack.
   * @default 860
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

/**
 * Two panes sharing a row, divided where the address says.
 * @param props - See {@link SplitRowProps}.
 * @returns The two panes with the splitter between them, the two stacked on a
 * narrow screen, or whichever one a link left on the page, alone.
 */
export function SplitRow(props: SplitRowProps): ReactElement | null {
  const {
    ratio,
    defaultRatio,
    onRatio,
    start,
    end,
    min,
    max,
    stackBelow = STACK_BELOW,
    gutter = GUTTER,
    stackedGap = STACKED_GAP,
  } = props;
  const row = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(windowWidth);
  // The share under the pointer, which is not the one in the address: a drag
  // reports every pixel it crosses, and the address is rewritten once, where
  // the splitter is let go.
  const [dragged, setDragged] = useState<number | null>(null);

  useResizeObserver(row, (size) => {
    setWidth(size.width);
  });

  if (start === null && end === null) return null;

  const stacked = start === null || end === null || width < stackBelow;
  const startPane =
    start === null ? null : (
      <div
        data-testid="split-start"
        style={stacked ? STACKED_PANE : paneStyle('start', gutter)}
      >
        {start}
      </div>
    );
  const endPane =
    end === null ? null : (
      <div
        data-testid="split-end"
        style={stacked ? STACKED_PANE : paneStyle('end', gutter)}
      >
        {end}
      </div>
    );

  if (stacked) {
    return (
      <div ref={row} style={{ ...STACK, gap: stackedGap }}>
        {startPane}
        {endPane}
      </div>
    );
  }

  const share = clampSplit(dragged ?? ratio ?? defaultRatio, { min, max });

  return (
    // `split-row` is what `chrome.css` reaches the bar through: it is
    // react-science's own element and carries no class of ours.
    <div ref={row} className="split-row">
      <SplitPane
        direction="horizontal"
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
 * @param asked - What it reported, a percentage because that is what it was
 * given.
 * @param current - The share in force, kept when the report is not a number.
 * @param range - The range this row is divided in.
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
 * How wide the window is, which is what the row is taken to be until it has
 * been measured. Reading it rather than starting at zero is what keeps a wide
 * page from laying itself out stacked and splitting a frame later, which would
 * build both figures twice on every load.
 * @returns The width in pixels, or the threshold itself where there is no
 * window to read — a test, or a page rendered to a string — which is the
 * narrowest a row is still split at.
 */
function windowWidth(): number {
  const { innerWidth } = globalThis;
  return typeof innerWidth === 'number' && innerWidth > 0
    ? innerWidth
    : STACK_BELOW;
}

/** The narrowest row that is still split, in pixels. */
const STACK_BELOW = 860;

/** The gutter a pane keeps beside the splitter, in pixels. */
const GUTTER = 6;

/** The gap between the panes once they have stacked, in pixels. */
const STACKED_GAP = 16;

const STACK = {
  display: 'flex',
  flexDirection: 'column',
} as const satisfies CSSProperties;

const STACKED_PANE = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
} as const satisfies CSSProperties;

function paneStyle(side: 'start' | 'end', gutter: number): CSSProperties {
  return {
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column',
    minWidth: 0,
    [side === 'start' ? 'paddingRight' : 'paddingLeft']: gutter,
  };
}
