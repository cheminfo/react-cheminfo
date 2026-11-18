import type { ReactElement } from 'react';
import { Toolbar, TooltipHelpContent } from 'react-science/ui';

/**
 * The toolbar of an editor's page setup panel: the page grid shown or hidden,
 * and the whole of the pages brought into view.
 * @param props - Whether the lines are shown, and what the buttons do.
 * @param props.shown - Whether the page lines are on the canvas.
 * @param props.onToggle - Show the lines, or hide them.
 * @param props.onFrame - Bring every page that holds something into view.
 * @returns The toolbar.
 */
export function PageToolbar(props: {
  shown: boolean;
  onToggle: () => void;
  onFrame: () => void;
}): ReactElement {
  const { shown, onToggle, onFrame } = props;
  return (
    <div className="panel-toolbar">
      <Toolbar aria-label="Page setup">
        <Toolbar.Item
          icon="grid"
          active={shown}
          tooltip={
            <TooltipHelpContent
              title="Page grid"
              description="Shown, the lines mark the pages and printing follows them. Hidden, the whole drawing prints on one page."
            />
          }
          aria-label="Page grid"
          onClick={onToggle}
        />
        {shown ? (
          <Toolbar.Item
            icon="zoom-to-fit"
            tooltip="Show the whole page"
            aria-label="Show the whole page"
            onClick={onFrame}
          />
        ) : null}
      </Toolbar>
    </div>
  );
}
