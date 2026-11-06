import type { ReactElement, ReactNode } from 'react';
import { SplitPane } from 'react-science/ui';

import { CollapsedPanelRow } from './PanelRow.tsx';

/** Props of {@link FixedPanelRow}. */
export interface FixedPanelRowProps {
  /** Whether the window has no room for the panels beside the figure. */
  collapsed: boolean;
  /** Whether a panel is on show. */
  isOpen: boolean;
  /**
   * Told when the splitter is dragged shut or back open.
   * @param open - Whether the side is now open.
   */
  onOpenChange: (open: boolean) => void;
  /** The figure the row is for. */
  view: ReactNode;
  /** The panels to show. */
  panels: ReactNode;
}

/**
 * The figure of a viewer and a side of a fixed width, which a viewer framed in
 * somebody else's page keeps however wide that page is; with no room for it the
 * figure keeps the row, as under `<PanelRow>`.
 * @param props - See {@link FixedPanelRowProps}.
 * @returns The split, or the figure with the panels over it.
 */
export function FixedPanelRow(props: FixedPanelRowProps): ReactElement {
  const { collapsed, isOpen, onOpenChange, view, panels } = props;
  if (collapsed) {
    return <CollapsedPanelRow view={view} panels={isOpen ? panels : null} />;
  }
  return (
    <SplitPane
      direction="horizontal"
      controlledSide="end"
      defaultSize="360px"
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      {view}
      {panels}
    </SplitPane>
  );
}
