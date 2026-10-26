import { Toolbar } from 'react-science/ui';

import type { FigureDownloadState } from '../../download/ui/useFigureDownload.tsx';

import { useMassCommandProps } from './massCommandContext.tsx';
import { useMassEditorState } from './massStateContext.ts';

/** What {@link MassToolbar} needs. */
export interface MassToolbarProps {
  /**
   * The "Save figure" panel the picture button opens.
   * @default undefined — the button only runs the `exportImage` command
   */
  figure?: FigureDownloadState;
}

/**
 * The tools, down the left of the chart.
 *
 * Only what is done to the spectra: what is asked of the viewer itself — the
 * mark, help, full screen — is in the header. Opening files comes first,
 * because nothing else does anything until a spectrum is open; then the
 * **tools**, read and square zoom, which say what a drag is running; then the
 * zoom commands that act at once; then what the chart writes over the peaks.
 * Closing every spectrum is last and alone, being the only one that throws
 * something away.
 * @param props - Component props.
 * @returns The toolbar.
 */
export function MassToolbar(props: MassToolbarProps) {
  const { figure } = props;
  const { state, selectedSpectrum } = useMassEditorState();
  const command = useMassCommandProps();
  const { spectra } = state.data;
  const { domain, tool } = state.view;
  const { showLabels, showCharges } = state.settings;

  const isEmpty = spectra.length === 0;
  // The popover opens the panel itself, so the command's own click is left out.
  const exportCommand = command('exportImage');

  return (
    // `collapse`, not the default `wrap`: a wrapping vertical toolbar measures
    // itself and writes the result back as an inline width, so in a row short of
    // space it settles at half an icon and stays there.
    <Toolbar vertical overflow="collapse" aria-label="Mass spectrum tools">
      <Toolbar.Item icon="folder-open" {...command('openFiles')} />

      <Toolbar.Item
        icon="arrows-horizontal"
        active={tool === 'read'}
        {...command('readTool')}
        disabled={isEmpty}
      />
      <Toolbar.Item
        icon="select"
        active={tool === 'box'}
        {...command('boxTool')}
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
        icon="label"
        active={showLabels}
        {...command('toggleLabels')}
        disabled={selectedSpectrum === null}
      />
      <Toolbar.Item
        icon="numerical"
        active={showCharges}
        {...command('toggleCharges')}
        disabled={!showLabels || selectedSpectrum === null}
      />

      {/* What the chart looks like right now is what a figure is of — the
          window it was dragged to and the labels written over its peaks — so
          the picture is taken here rather than rebuilt from the spectra. */}
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

      <Toolbar.Item
        icon="trash"
        intent="danger"
        {...command('clear')}
        disabled={isEmpty}
      />
    </Toolbar>
  );
}
