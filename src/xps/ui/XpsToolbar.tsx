import { Toolbar } from 'react-science/ui';

import type { FigureDownloadState } from '../../download/ui/useFigureDownload.tsx';

import { useXpsCommandProps } from './xpsCommandContext.tsx';
import { useXpsEditorState } from './xpsStateContext.ts';

export interface XpsToolbarProps {
  /**
   * The picture of the chart, saved or copied from a panel the figure button
   * opens.
   * @default undefined — the button runs the command instead
   */
  figure?: FigureDownloadState;
}

/**
 * What can be done to the chart, down its left side, in the order the infrared
 * viewer puts its own: clearing first, then the window, then how every spectrum
 * is drawn, then the layers over the measurement, and the picture last.
 *
 * The two zooms work the counts axis, which is the axis a button is any good
 * for: a survey scan spans four decades, so a satellite is read by pulling the
 * top of the counts down rather than by choosing bounds. The energy axis is
 * zoomed by dragging across the range you want. The wheel does the same as the
 * two buttons and the double click does the same as the reset; each button says
 * so in its tooltip, because a gesture nobody has been told about is not a
 * feature.
 *
 * The axis and the scale act on every spectrum at once, and the three layers —
 * regions, components, labels — are what is turned off to see the trace
 * underneath and turned straight back on.
 * @param props - Component props.
 * @returns The toolbar.
 */
export function XpsToolbar(props: XpsToolbarProps) {
  const { figure } = props;
  const { state } = useXpsEditorState();
  const command = useXpsCommandProps();
  const { spectra } = state.data;
  const { domain } = state.view;
  const { energyAxis, normalise, showRegions, showComponents, showLabels } =
    state.settings;

  const isEmpty = spectra.length === 0;
  const exportCommand = command('exportImage');

  return (
    <Toolbar vertical overflow="collapse" aria-label="XPS chart tools">
      <Toolbar.Item
        icon="trash"
        intent="danger"
        {...command('clear')}
        disabled={isEmpty}
      />

      <Toolbar.Item icon="zoom-in" {...command('zoomIn')} disabled={isEmpty} />
      <Toolbar.Item
        icon="zoom-out"
        {...command('zoomOut')}
        disabled={isEmpty}
      />
      <Toolbar.Item
        icon="zoom-to-fit"
        {...command('resetZoom')}
        disabled={domain === null}
      />

      <Toolbar.Item
        icon="swap-horizontal"
        active={energyAxis === 'kinetic'}
        {...command('toggleAxis')}
        disabled={isEmpty}
      />
      <Toolbar.Item
        icon="percentage"
        active={normalise}
        {...command('toggleNormalise')}
        disabled={isEmpty}
      />

      <Toolbar.Item
        icon="highlight"
        active={showRegions}
        {...command('showRegions')}
        disabled={isEmpty}
      />
      <Toolbar.Item
        icon="layers"
        active={showComponents}
        {...command('showComponents')}
        disabled={isEmpty}
      />
      <Toolbar.Item
        icon="label"
        active={showLabels}
        {...command('showLabels')}
        disabled={isEmpty}
      />

      {/* What the chart looks like right now is what a figure is of — the
          window it was dragged to, the axis it is read on, the labels over the
          peaks — so the picture is taken here rather than rebuilt in a panel. */}
      {figure === undefined ? (
        <Toolbar.Item
          icon="media"
          {...command('exportImage')}
          disabled={isEmpty}
        />
      ) : (
        <Toolbar.PopoverItem
          isOpen={figure.isOpen}
          onInteraction={figure.setOpen}
          content={figure.panel}
          disabled={isEmpty}
          itemProps={{
            icon: 'media',
            tooltip: exportCommand.tooltip,
            'aria-label': exportCommand['aria-label'],
            active: figure.isOpen,
            disabled: isEmpty,
          }}
        />
      )}
    </Toolbar>
  );
}
