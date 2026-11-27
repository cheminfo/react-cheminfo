/**
 * The zoom commands of a viewer's toolbar, which act at once: in, out, and
 * back to the whole of what is drawn.
 */

import type { ReactElement } from 'react';
import { Toolbar } from 'react-science/ui';

import type { EditorCommandItem } from './EditorHeader.tsx';

/** The commands the three items run. */
export type ZoomCommand = 'zoomIn' | 'zoomOut' | 'resetZoom';

/** Props of {@link ZoomToolbarItems}. */
export interface ZoomToolbarItemsProps {
  /**
   * The props of the item running a command, from the viewer's own helper.
   * @param id - The command.
   * @returns The item's props.
   */
  command: (id: ZoomCommand) => EditorCommandItem;
  /** Whether nothing is open to zoom. */
  isEmpty: boolean;
  /** Whether the chart already shows the whole of what is drawn. */
  fitted: boolean;
}

/**
 * The three zoom items.
 * @param props - See {@link ZoomToolbarItemsProps}.
 * @returns The items.
 */
export function ZoomToolbarItems(props: ZoomToolbarItemsProps): ReactElement {
  const { command, isEmpty, fitted } = props;
  return (
    <>
      <Toolbar.Item icon="zoom-in" {...command('zoomIn')} disabled={isEmpty} />
      <Toolbar.Item
        icon="zoom-out"
        {...command('zoomOut')}
        disabled={isEmpty}
      />
      <Toolbar.Item
        icon="zoom-to-fit"
        {...command('resetZoom')}
        disabled={fitted}
      />
    </>
  );
}
