/**
 * Charts stacked one above another, each resized by the splitter under it.
 *
 * One measurement is often read on more than one chart at once — the separation
 * a sample was run through, the spectrum taken where the cursor stands, and what
 * that spectrum broke into — and those are windows over different axes rather
 * than traces on one. Stacking them is layout and nothing else, which is the
 * whole of what this component knows: N panes, one above another, sharing the
 * gutter their value axes are drawn in, the one at the foot writing the
 * horizontal axis under all of them. Which pane holds what, and what makes one
 * appear at all, is a fact about the measurement and stays in the viewer.
 *
 * How N panes become N nested splits is in `chartStackLevel.tsx`; what is held
 * here is the one thing that outlives a render, which is how tall each of them
 * was last left.
 *
 * Two things `SplitPane` does not do, and both of them draw a plausible wrong
 * picture rather than failing outright:
 *
 * - **It has no minimum.** `useSplitPaneSize` clamps a drag to
 *   `{ min: 0, max: parentDimension }`, so a splitter dragged to the top of the
 *   stack leaves the pane above it at nothing at all; `plotRect` then holds the
 *   plot at `MINIMUM_PLOT_SIDE` and what is left is a ten-pixel stub with a full
 *   set of axes over it. Every height is held above the pane's own minimum —
 *   the default it starts at as much as the one a drag arrives at — because
 *   nothing underneath will do it.
 * - **Its controlled side gets no `min-height: 0`.** `getItemStyle` resets that
 *   on the *other* side only, and a chart is an `<svg>` carrying a real `height`
 *   attribute, so the controlled pane's min-content height is whatever the
 *   chart was last measured at: the pane grows and then refuses to shrink back.
 *   Every pane is wrapped in a box that carries the reset itself.
 *
 * A pane keeps its children mounted whether it is open or shut — `unmountChildren`
 * stays false — so a closed pane measures 0 × 0 behind a `display: none`, its
 * `ResizeObserver` fires again the moment it is revealed, and it comes back
 * through the window it was being looked at through. A remounted chart is empty.
 */

import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { SplitPaneSize } from 'react-science/ui';

import type { ChartStackPane, StackLevel } from './chartStackLevel.tsx';
import { keptHeight, paneHeight, stackFrom } from './chartStackLevel.tsx';

export type { ChartStackPane } from './chartStackLevel.tsx';

/** What the stack is drawn from. */
export interface ChartStackProps {
  /**
   * The panes, in the order they are stacked, top to bottom.
   *
   * A pane with nothing to draw is left out of this array rather than handed in
   * empty — that is what makes its splitter go away with it. Appending a pane,
   * and dropping the one at the foot, cost nothing: every pane is a split
   * whether or not anything follows it, so no chart already stacked is stood up
   * again. Taking one out of the *middle* still is expensive — every split
   * below it takes on the identity of the one that was under it, and the charts
   * in them are all remounted, coming back fitted to what they draw rather than
   * through the window they were left at. So a pane is still better dropped
   * from the foot of the stack than out of its middle.
   */
  panes: readonly ChartStackPane[];
  /**
   * Told when a splitter is let go, with the height the pane came to rest at.
   *
   * On release rather than on every pixel of the drag, because a viewer that
   * hears this puts it in its own state, and a store per pointer move renders
   * every pane of the stack again on each one. The height reported is the one
   * that was kept, minimum already applied.
   * @default the height is remembered inside the stack and nowhere else
   * @param id - Which pane was resized.
   * @param height - How tall it now stands, in pixels.
   */
  onHeightChange?: (id: string, height: number) => void;
}

/**
 * Stack charts vertically, with a splitter between each pair.
 *
 * Everything a level of the nesting is handed is memoised, and for the reason
 * the release is told apart from the drag: `resize` fires on every pointer move,
 * and a `StackLevel` rebuilt there would recurse through every `SplitPane` of
 * the stack on each one, taking every chart in it with them.
 * @param props - Component props.
 * @returns The stack, filling the box it is given.
 */
export function ChartStack(props: ChartStackProps): ReactElement {
  const { panes, onHeightChange } = props;
  const [heights, setHeights] = useState<Readonly<Record<string, number>>>({});

  const heightOf = useCallback(
    (pane: ChartStackPane) => paneHeight(pane, heights[pane.id]),
    [heights],
  );

  const resize = useCallback((pane: ChartStackPane, asked: SplitPaneSize) => {
    const height = keptHeight(asked, pane);
    if (height === null) return;
    setHeights((current) =>
      current[pane.id] === height ? current : { ...current, [pane.id]: height },
    );
  }, []);

  const rest = useCallback(
    (pane: ChartStackPane, asked: SplitPaneSize) => {
      const height = keptHeight(asked, pane);
      if (height !== null) onHeightChange?.(pane.id, height);
    },
    [onHeightChange],
  );

  const level = useMemo<StackLevel>(
    () => ({ panes, heightOf, resize, rest }),
    [panes, heightOf, resize, rest],
  );

  return <div style={stackStyle}>{stackFrom(level, 0)}</div>;
}

/** The box the whole stack fills, whatever it was given by way of a parent. */
const stackStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
} as const;
