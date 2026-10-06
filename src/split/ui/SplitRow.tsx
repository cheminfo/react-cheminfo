/**
 * Two figures side by side, with a splitter between them and the share each
 * takes written into the address.
 *
 * The body is `splitPanes.tsx`, which `<SplitColumn>` shares; its header is
 * where the design is written down.
 */

import type { ReactElement } from 'react';

import type { SplitPanesProps } from './splitPanes.tsx';
import { SplitPanes } from './splitPanes.tsx';

/**
 * Props of {@link SplitRow}. `start` is the left-hand pane, `end` the
 * right-hand one, and `stackBelow` a width.
 */
export type SplitRowProps = SplitPanesProps;

/**
 * Two panes sharing a row, divided where the address says.
 *
 * **Set `max` where the first pane stops being able to use the room.** A pane
 * of forms dragged past about half the row does not grow: the labels stay put
 * and the fields stretch to a width nobody types into, so the room becomes
 * empty card. The figure beside it is what the drag exists to enlarge.
 *
 * @param props - See {@link SplitRowProps}.
 * @returns The two panes with the splitter between them, the two stacked on a
 * narrow screen, or whichever one a link left on the page, alone.
 */
export function SplitRow(props: SplitRowProps): ReactElement | null {
  return <SplitPanes direction="horizontal" {...props} />;
}
