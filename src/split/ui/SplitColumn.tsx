/**
 * Two figures one above the other, with a splitter between them and the share
 * each takes written into the address.
 *
 * The body is `splitPanes.tsx`, which `<SplitRow>` shares; its header is where
 * the design is written down.
 */

import type { ReactElement } from 'react';

import type { SplitPanesProps } from './splitPanes.tsx';
import { SplitPanes } from './splitPanes.tsx';

/**
 * Props of {@link SplitColumn}. `start` is the top pane, `end` the bottom one,
 * and `stackBelow` a height.
 */
export type SplitColumnProps = SplitPanesProps;

/**
 * Two panes sharing a column, divided where the address says.
 *
 * **A share needs a height to be a share of.** Put this inside a box that has
 * one — a workbench pane, a page that fills the viewport — not inside an
 * ordinary page column, whose height is whatever its content comes to. Given
 * no height to divide, it measures nothing, says nothing about it, and simply
 * stacks the two panes with no splitter, which is what an ordinary page wanted
 * anyway.
 *
 * @param props - See {@link SplitColumnProps}.
 * @returns The two panes with the splitter between them, the two stacked where
 * there is no height to divide, or whichever one a link left, alone.
 */
export function SplitColumn(props: SplitColumnProps): ReactElement | null {
  return <SplitPanes direction="vertical" {...props} />;
}
