/**
 * The picture button of a viewer's toolbar: it opens the "Save figure" panel,
 * or runs the viewer's own `exportImage` command where there is none.
 */

import type { ReactElement } from 'react';
import { Toolbar } from 'react-science/ui';

import type { EditorCommandItem } from '../../panel/ui/EditorHeader.tsx';

import type { FigureDownloadState } from './useFigureDownload.tsx';

/** Props of {@link FigureToolbarItem}. */
export interface FigureToolbarItemProps {
  /**
   * The "Save figure" panel the button opens.
   * @default undefined — the button only runs the command
   */
  figure?: FigureDownloadState | undefined;
  /** The `exportImage` command's item, from the viewer's own helper. */
  command: EditorCommandItem;
  /** Whether there is nothing to take a picture of. */
  disabled: boolean;
}

/**
 * What the chart looks like right now is what a figure is of — the window it
 * was dragged to and what is written over it — so the picture is taken from
 * the toolbar beside it rather than rebuilt in a panel.
 * @param props - See {@link FigureToolbarItemProps}.
 * @returns The item.
 */
export function FigureToolbarItem(props: FigureToolbarItemProps): ReactElement {
  const { figure, command, disabled } = props;
  if (figure === undefined) {
    return <Toolbar.Item icon="media" {...command} disabled={disabled} />;
  }
  // The popover opens the panel itself, so the command's own click is left out.
  return (
    <Toolbar.PopoverItem
      isOpen={figure.isOpen}
      onInteraction={figure.setOpen}
      content={figure.panel}
      disabled={disabled}
      itemProps={{
        icon: 'media',
        tooltip: command.tooltip,
        'aria-label': command['aria-label'],
        active: figure.isOpen,
        disabled,
      }}
    />
  );
}
