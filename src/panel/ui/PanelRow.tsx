import type { ReactElement, ReactNode } from 'react';

import { SplitRow } from '../../split/ui/SplitRow.tsx';
import type { SplitPanesProps } from '../../split/ui/splitPanes.tsx';

/** Props of {@link PanelRow}. */
export interface PanelRowProps extends Pick<
  SplitPanesProps,
  'ratio' | 'defaultRatio' | 'onRatio' | 'min' | 'max' | 'open' | 'onOpenChange'
> {
  /**
   * Whether the window has no room for the panels beside the figure, as
   * `readPanelsCollapsed` and `watchPanelsCollapsed` say.
   */
  collapsed: boolean;
  /** The figure the row is for. */
  view: ReactNode;
  /**
   * The panels to show: every open one with room, and without room the one
   * panel the rail asked for. `null` when there is none.
   */
  panels: ReactNode;
}

/**
 * The figure of an editor and the panels that drive it.
 *
 * With room they sit side by side, with the splitter between them. Without
 * room the figure keeps the whole row, because a figure is what an editor is
 * for and a stack of forms left in its place is a tool nothing can be drawn in.
 * A panel then takes the whole row from the rail, is used, and is sent away
 * again, and the figure, still mounted underneath, comes back as it was. A strip
 * of figure left beside it would be too narrow to draw in, and would take the
 * room from the fields the panel was opened for.
 *
 * The editor keeps to three rules this row cannot keep for it, since it is
 * handed what it shows and reads no store:
 * - **One panel at a time.** A rail press shows that panel and sends the other
 *   away, and the header's fold sends it away too. Several would share a height
 *   none of them reads at.
 * - **What is open in the workspace stays as it was.** The panel over the figure
 *   is not written to it, so a wider window finds the panels it left. The rail
 *   lights the panel on show rather than the panels in the workspace, or an icon
 *   would be lit with nothing to see and its first press would seem to do
 *   nothing.
 * - **Only somebody asking opens one.** A press on the rail or a link naming the
 *   panel does; a gesture on the figure that opens a panel beside it with room
 *   must not, or selecting an atom covers the atom.
 *
 * With room, an editor passing `open` and `onOpenChange` has the double click on
 * the bar hide the panels and bring them back. The figure takes the row, and the
 * panels stay mounted beside it, so nothing typed into them is lost.
 * @param props - See {@link PanelRowProps}.
 * @returns The split row, or the figure with the panels over it.
 */
export function PanelRow(props: PanelRowProps): ReactElement {
  const { collapsed, view, panels, ratio, defaultRatio, onRatio } = props;
  const { min, max, open, onOpenChange } = props;

  if (!collapsed && panels !== null) {
    return (
      <SplitRow
        ratio={ratio}
        defaultRatio={defaultRatio}
        onRatio={onRatio}
        {...(min === undefined ? {} : { min })}
        {...(max === undefined ? {} : { max })}
        {...(open === undefined ? {} : { open })}
        {...(onOpenChange === undefined ? {} : { onOpenChange })}
        // Collapsing is what a narrow window does here, so this never stacks.
        stackBelow={0}
        start={view}
        end={panels}
      />
    );
  }

  return <CollapsedPanelRow view={view} panels={panels} />;
}

/**
 * The figure alone in the row, with the panels over the whole of it when there
 * are any. The figure stays mounted underneath, so sending a panel away brings
 * it back as it was.
 * @param props - The figure, and the panels or `null`.
 * @returns The row.
 */
export function CollapsedPanelRow(
  props: Pick<PanelRowProps, 'view' | 'panels'>,
): ReactElement {
  const { view, panels } = props;
  return (
    <div className="panel-row">
      <div className="panel-row__view">{view}</div>
      {panels === null ? null : (
        <div className="panel-row__drawer">{panels}</div>
      )}
    </div>
  );
}
