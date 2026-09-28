/**
 * One level of a chart stack: the pane drawn at it, and everything under it.
 *
 * `SplitPane` takes exactly two children, so a stack is a recursion rather than
 * a list — the pane at each level is the controlled side and is given a height
 * in pixels, everything below it is the other side and takes what is left. It
 * stands beside `ChartStack.tsx` rather than inside it so that the component is
 * the state and this is the picture drawn from it. Why a height is held above a
 * floor, and why every pane is wrapped in a box of its own, is in that file's
 * header.
 *
 * The pane at the foot has nothing under it and so needs no split at all, and is
 * given one regardless. React rebuilds whatever sits at a position the moment
 * the element there changes type, so a pane drawn as a bare box while it is last
 * and as a split once something is appended under it would be torn down and
 * stood up again by the appending — and a chart stood up again is empty: it has
 * to be measured, fitted and drawn from its twenty thousand points before it is
 * a picture of anything. Every pane is therefore a split, the last one holding
 * nothing on its other side, which is exactly what makes it draw no splitter and
 * answer no drag.
 */

import type { ReactNode } from 'react';
import type { SplitPaneSize } from 'react-science/ui';
import { SplitPane } from 'react-science/ui';

/** One pane of the stack, and how tall it stands. */
export interface ChartStackPane {
  /**
   * Identity, which is what a height is remembered against.
   *
   * A pane leaves the stack whenever what it draws stops existing, and comes
   * back when it exists again. The height is held against this rather than
   * against the pane's place in the array, so a pane that returns returns the
   * size it was left at rather than at its default.
   */
  id: string;
  /** What is drawn in it — a chart, and whatever bar is drawn over it. */
  content: ReactNode;
  /**
   * How tall it stands the first time it is stacked, in pixels.
   *
   * A default rather than a controlled value: the stack holds the live height
   * from then on, so a viewer restoring a layout it saved hands it in here and
   * hears every later change back through `onHeightChange`. A change to this
   * number afterwards is ignored, the way a defaulted prop always is — what is
   * on screen is what a chemist dragged it to.
   * @default 220
   */
  defaultHeight?: number;
  /**
   * The shortest it may be dragged to, in pixels.
   *
   * A hundred and twenty is a plot that still reads: `MARGIN` spends 44 of them
   * on the tick row and the axis title, which leaves the trace the rest of it.
   * @default 120
   */
  minimumHeight?: number;
}

/** Everything one level of the nesting needs to draw itself and the rest. */
export interface StackLevel {
  /** Every pane of the stack, top to bottom. */
  panes: readonly ChartStackPane[];
  /**
   * How tall a pane stands.
   * @param pane - The pane to measure.
   * @returns Its height, in pixels.
   */
  heightOf: (pane: ChartStackPane) => number;
  /**
   * Take what a drag in progress is asking for.
   * @param pane - The pane being resized.
   * @param asked - The size its splitter asked for.
   */
  resize: (pane: ChartStackPane, asked: SplitPaneSize) => void;
  /**
   * Take where a drag came to rest.
   * @param pane - The pane that was resized.
   * @param asked - The size its splitter was let go at.
   */
  rest: (pane: ChartStackPane, asked: SplitPaneSize) => void;
}

/**
 * The pane at one level of the stack, and everything under it.
 *
 * The pane at the foot is given the whole of what it is handed rather than a
 * height, since there is nothing under it to leave room for, and it is given
 * neither a close threshold nor anywhere to report a drag: a split with nothing
 * on its other side draws no splitter, so there is no drag to report and nothing
 * to close it against — a threshold there would hide the only pane on a stack
 * squeezed short.
 * @param level - The panes and what is done with a drag on them.
 * @param index - Which pane this level draws.
 * @returns The pane split against the rest below it, the pane alone in a split
 * of its own at the foot of the stack, and nothing at all for a stack of no
 * panes.
 */
export function stackFrom(level: StackLevel, index: number): ReactNode {
  const { panes, heightOf, resize, rest } = level;
  const pane = panes[index];
  if (pane === undefined) return null;

  const under = stackFrom(level, index + 1);
  const isLast = under === null;

  return (
    <SplitPane
      key={pane.id}
      direction="vertical"
      controlledSide="start"
      size={isLast ? WHOLE_STACK : `${heightOf(pane)}px`}
      onSizeChange={isLast ? undefined : (asked) => resize(pane, asked)}
      onResize={isLast ? undefined : (asked) => rest(pane, asked)}
      closeThreshold={isLast ? undefined : CLOSE_THRESHOLD}
      unmountChildren={false}
    >
      <div key={pane.id} data-chart-pane={pane.id} style={paneStyle}>
        {pane.content}
      </div>
      {under}
    </SplitPane>
  );
}

/**
 * How tall a pane stands, given the height it was last left at.
 *
 * The floor is applied to the default as much as to a stored height: a pane
 * asking for 40 pixels against a minimum of 150 would otherwise draw the stub
 * with a full set of axes over it that the header of `ChartStack.tsx` describes,
 * on its first render and until somebody touched a splitter.
 * @param pane - The pane to measure.
 * @param stored - The height it was left at, absent until one is dragged.
 * @returns Its height, in pixels.
 */
export function paneHeight(
  pane: ChartStackPane,
  stored: number | undefined,
): number {
  return Math.max(
    stored ?? pane.defaultHeight ?? DEFAULT_PANE_HEIGHT,
    floorOf(pane),
  );
}

/**
 * The height to keep, given what a splitter asked for.
 * @param asked - The size the splitter reported, in the pixels it was handed.
 * @param pane - The pane it belongs to, for its minimum.
 * @returns The height to store, `null` for a size that is not a length at all.
 */
export function keptHeight(
  asked: SplitPaneSize,
  pane: ChartStackPane,
): number | null {
  const value = Number.parseFloat(asked);
  if (!Number.isFinite(value)) return null;
  return Math.max(value, floorOf(pane));
}

/**
 * The shortest a pane may stand, whether it said so itself or not.
 * @param pane - The pane being held up.
 * @returns Its floor, in pixels.
 */
function floorOf(pane: ChartStackPane): number {
  return pane.minimumHeight ?? MINIMUM_PANE_HEIGHT;
}

/** How tall a pane stands when nobody has said, in pixels. */
const DEFAULT_PANE_HEIGHT = 220;

/** The shortest a pane may be dragged to when nobody has said, in pixels. */
const MINIMUM_PANE_HEIGHT = 120;

/**
 * What the pane at the foot is given, having nothing under it to leave room for.
 *
 * A share rather than a length: handed a percentage, `SplitPane` lays its
 * controlled side out as a flexible share instead of at a fixed height, so the
 * pane takes whatever the panes above it left rather than standing at some
 * number and leaving a gap under itself.
 */
const WHOLE_STACK: SplitPaneSize = '100%';

/**
 * The height below which a split closes its pane rather than squeezing it.
 *
 * A stack squeezed to under ninety pixels has no room for a chart of any kind,
 * and that is under the shortest pane this stack will otherwise keep.
 * `SplitPane` stops doing this the moment a splitter is touched, so it settles
 * what a pane does before anyone has an opinion and nothing after that.
 */
const CLOSE_THRESHOLD = 90;

/**
 * The box one pane fills — `minHeight: 0` is the whole reason it exists rather
 * than the pane's content sitting in the split itself; see the header of
 * `ChartStack.tsx`.
 */
const paneStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 0%',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
} as const;
