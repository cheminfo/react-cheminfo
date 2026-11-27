import type { ReactElement } from 'react';

import { OverlayAction } from '../../overlay/ui/OverlayAction.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';

/** What {@link ProjectionViewActions} is drawn from. */
export interface ProjectionViewActionsProps {
  /** The words the buttons write. */
  copy: ProjectionCopy;
  /** Whether no sample is selected, which greys the selection's actions. */
  nothingPicked: boolean;
  /** Puts the view back where it was first seen. */
  onResetView: () => void;
  /** Empties the selection. */
  onClearSelection: () => void;
  /**
   * Draws the frame around the selected samples; without it there is no button.
   * @default undefined
   */
  onZoomToSelection?: () => void;
}

/**
 * The buttons at the foot of a figure's panel, which act rather than change.
 * @param props - See {@link ProjectionViewActionsProps}.
 * @returns The buttons.
 */
export function ProjectionViewActions(
  props: ProjectionViewActionsProps,
): ReactElement {
  const { copy, nothingPicked, onResetView, onClearSelection } = props;
  const { onZoomToSelection } = props;
  const { action } = copy;
  return (
    <>
      {onZoomToSelection === undefined ? null : (
        <OverlayAction
          text={action.zoomToSelection}
          icon="zoom-to-fit"
          disabled={nothingPicked}
          onClick={onZoomToSelection}
        />
      )}
      <OverlayAction
        text={action.resetView}
        icon="reset"
        onClick={onResetView}
      />
      <OverlayAction
        text={action.clearSelection}
        icon="cross"
        disabled={nothingPicked}
        onClick={onClearSelection}
      />
    </>
  );
}
