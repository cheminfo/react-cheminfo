import { Toolbar } from 'react-science/ui';

import type { FigureDownloadState } from '../../download/ui/useFigureDownload.tsx';
import { boxZoomOnly } from '../core/irMode.ts';

import { useIrCommandProps } from './irCommandContext.tsx';
import { useIrEditorState } from './irStateContext.ts';

/** What {@link IrToolbar} needs. */
export interface IrToolbarProps {
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
 * mark, help, full screen — is in the header. The two **tools** — read and
 * square zoom — come first and show which of the two a drag is currently
 * running, then the zoom commands that act at once, then what is being read: the
 * value axis, the picking, the assignments. Closing every spectrum is last and
 * alone, being the only one that throws something away.
 *
 * Reading percent transmittance, the pair is settled rather than chosen: every
 * drag on that axis is a rectangle, so both buttons go dead with the square zoom
 * lit. Showing `read` as available there would offer a gesture the chart does not
 * make, and showing it as *active* would name the wrong one.
 * @param props - Component props.
 * @returns The toolbar.
 */
export function IrToolbar(props: IrToolbarProps) {
  const { figure } = props;
  const { state, selectedSpectrum } = useIrEditorState();
  const command = useIrCommandProps();
  const { spectra } = state.data;
  const { domain, tool } = state.view;
  const { mode, pickBands, showAssignments } = state.settings;

  const isEmpty = spectra.length === 0;
  // The popover opens the panel itself, so the command's own click is left out.
  const exportCommand = command('exportImage');
  const settled = boxZoomOnly(mode);

  return (
    // `collapse`, not the default `wrap`: a wrapping vertical toolbar measures
    // itself and writes the result back as an inline width, so in a row short of
    // space it settles at half an icon and stays there.
    <Toolbar vertical overflow="collapse" aria-label="Infrared spectrum tools">
      <Toolbar.Item
        icon="trash"
        intent="danger"
        {...command('clear')}
        disabled={isEmpty}
      />
      {/* The read tool drags along one axis, so it is drawn as that; the box
          tool sweeps a rectangle, which is what a marquee icon means. */}
      <Toolbar.Item
        icon="arrows-horizontal"
        active={!settled && tool === 'read'}
        {...command('readTool')}
        disabled={isEmpty || settled}
      />
      <Toolbar.Item
        icon="select"
        active={settled || tool === 'box'}
        {...command('boxTool')}
        disabled={isEmpty || settled}
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
        icon={mode === 'absorbance' ? 'arrow-up' : 'arrow-down'}
        active={mode === 'absorbance'}
        {...command('toggleMode')}
        disabled={isEmpty}
      />
      <Toolbar.Item
        icon="locate"
        active={pickBands}
        {...command('togglePicking')}
        disabled={selectedSpectrum === null}
      />
      <Toolbar.Item
        icon="label"
        active={showAssignments}
        {...command('toggleAssignments')}
        disabled={!pickBands || selectedSpectrum === null}
      />

      {/* What the chart looks like right now is what a figure is of — the
          window it was dragged to, the way up it is being read, the
          assignments written under the bands — so the picture is taken here
          rather than rebuilt from the spectra in a panel. */}
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
