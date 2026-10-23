import type { Ref } from 'react';
import { useId, useMemo, useState } from 'react';
import { SplitPane, useFullscreen } from 'react-science/ui';

import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import { useFigureDownload } from '../../download/ui/useFigureDownload.tsx';
import { PanelRail } from '../../panel/ui/PanelRail.tsx';
import type { IrBand } from '../core/irBand.ts';
import type { IrCommandHandlers } from '../core/irCommands.ts';
import type { IrEditorHandle } from '../core/irEditorApi.ts';
import { otherIrMode } from '../core/irMode.ts';
import { irSidePanels } from '../core/irSidePanels.ts';
import type { IrSpectrum } from '../core/irSpectrum.ts';
import { DEFAULT_SIDE_PANEL } from '../core/irState.ts';
import { irCommandOffered } from '../core/irTechniqueCommands.ts';

import { IrAboutDialog } from './IrAboutDialog.tsx';
import { IrCanvas } from './IrCanvas.tsx';
import { IrCommandProvider } from './IrCommandProvider.tsx';
import { IrDocumentationDialog } from './IrDocumentationDialog.tsx';
import { IrHeader } from './IrHeader.tsx';
import { IrSidePanel } from './IrSidePanel.tsx';
import { IrToolbar } from './IrToolbar.tsx';
import { useIrActions, useIrEditorState } from './irStateContext.ts';
import { useIrHandle } from './useIrHandle.ts';
import { useIrShortcuts } from './useIrShortcuts.ts';
import { useValueAxisZoom } from './useValueAxisZoom.ts';

export interface IrShellProps {
  /**
   * The handle to fill in, once there is a state for it to act on.
   * @default undefined
   */
  handle?: Ref<IrEditorHandle>;
}

/**
 * The viewer's screen: a header, the rails, and the split between the chart and
 * the panels.
 *
 * Kept apart from `IrEditor` so that the handle, the commands and the highlight —
 * all of which need the state — sit below the providers rather than beside them,
 * and so the sealed component above is nothing but its props.
 *
 * The panels run to the bottom edge while the status bar stops at the splitter,
 * which is what says the bar belongs to the chart and the panels are their own
 * column.
 * @param props - Component props.
 * @returns The screen.
 */
export function IrShell(props: IrShellProps) {
  const { handle } = props;

  const { state, visibleSpectra, selectedSpectrum } = useIrEditorState();
  const actions = useIrActions();
  const { toggle: toggleFullScreen } = useFullscreen();
  const { openPanelIds, tool } = state.view;
  const { mode, pickBands, showAssignments, technique } = state.settings;

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);

  // The chart is the picture, so the box it is drawn in is what the figure
  // panel is pointed at: the viewer around it is full of SVG — every icon in
  // every toolbar is one.
  const chartId = useId();
  const figure = useFigureDownload({
    targetId: chartId,
    fileName: pictureName(visibleSpectra, selectedSpectrum),
  });
  const { isOpen: isFigureOpen, setOpen: setFigureOpen } = figure;
  // The highlight is held here rather than in the reducer: what the pointer is
  // resting on is not part of the document and changes on every move across the
  // chart, so putting it through the reducer would run every panel's memo sixty
  // times a second.
  const [highlight, setHighlight] = useState<IrBand | null>(null);

  const { zoomIn, zoomOut } = useValueAxisZoom();

  const commands = useMemo<IrCommandHandlers>(
    () => ({
      about: () => setIsAboutOpen(true),
      documentation: () => setIsDocumentationOpen(true),
      fullScreen: toggleFullScreen,
      readTool: () => actions.setTool('read'),
      boxTool: () => actions.setTool(tool === 'box' ? 'read' : 'box'),
      zoomIn,
      zoomOut,
      resetZoom: () => actions.resetDomain(),
      // A command the technique does not offer has no handler, so its key
      // stays with the page.
      toggleMode: irCommandOffered(technique, 'toggleMode')
        ? () => actions.setSettings({ mode: otherIrMode(mode, technique) })
        : undefined,
      togglePicking: () => actions.setSettings({ pickBands: !pickBands }),
      toggleAssignments: irCommandOffered(technique, 'toggleAssignments')
        ? () => actions.setSettings({ showAssignments: !showAssignments })
        : undefined,
      exportImage: () => setFigureOpen(!isFigureOpen),
      clear: () => actions.clear(),
    }),
    [
      actions,
      tool,
      mode,
      technique,
      pickBands,
      showAssignments,
      zoomIn,
      zoomOut,
      toggleFullScreen,
      isFigureOpen,
      setFigureOpen,
    ],
  );

  // The root is held as state rather than in a ref because the keys are bound to
  // it from an effect: a ref filled in during the commit would leave the effect
  // with nothing to listen on for the first render, and no reason ever to run
  // again.
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useIrShortcuts(root, commands);
  useIrHandle(handle);

  /**
   * Open or close the side, as the splitter is dragged shut and back open.
   * @param open - Whether the side is now open.
   */
  function setSideOpen(open: boolean): void {
    if (!open) {
      for (const panelId of openPanelIds) actions.togglePanel(panelId);
      return;
    }
    // Dragging the splitter back open must land on something, or it opens on an
    // empty column and reads as broken.
    if (openPanelIds.length === 0) actions.togglePanel(DEFAULT_SIDE_PANEL);
  }

  return (
    <IrCommandProvider handlers={commands} technique={technique}>
      {/* `tabIndex` so a click anywhere in the viewer makes this the target the
          shortcuts are heard on: keys are delivered to whatever holds the caret,
          and an SVG never does. */}
      <div ref={setRoot} tabIndex={-1} style={rootStyle}>
        <IrHeader />

        <div style={mainStyle}>
          {/* The rails are chrome of a fixed width, and a flex child shrinks by
              default: in a narrow viewer the row would take the width it is
              short of out of them, and half an icon is what that looks like. */}
          <div style={railStyle}>
            <IrToolbar figure={figure} />
          </div>

          <SplitPane
            direction="horizontal"
            controlledSide="end"
            defaultSize="360px"
            open={openPanelIds.length > 0}
            onOpenChange={setSideOpen}
          >
            <IrCanvas
              highlight={highlight}
              onHighlight={setHighlight}
              chartId={chartId}
            />

            <IrSidePanel highlight={highlight} onHighlight={setHighlight} />
          </SplitPane>

          {/* Outside the split, so the icons stay put against the right edge
              while the panel beside them is resized or closed. */}
          <div style={railStyle}>
            <PanelRail
              panels={irSidePanels}
              openIds={openPanelIds}
              onToggle={actions.togglePanel}
            />
          </div>
        </div>
      </div>

      <IrAboutDialog
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        technique={technique}
      />
      <IrDocumentationDialog
        isOpen={isDocumentationOpen}
        onClose={() => setIsDocumentationOpen(false)}
        technique={technique}
      />
    </IrCommandProvider>
  );
}

/**
 * What a picture of the chart is called.
 *
 * The spectrum being looked at, since a figure of the chart is a figure of that
 * spectrum, and a chemist who has one run open should not have to work out
 * which of their downloads `spectra.png` was. A chart holding several and
 * pointing at none of them is named after the lot.
 * @param spectra - What is drawn.
 * @param selected - The one being looked at, `null` when none is.
 * @returns The name, without its extension.
 */
function pictureName(
  spectra: readonly IrSpectrum[],
  selected: IrSpectrum | null,
): string {
  const named = selected ?? (spectra.length === 1 ? spectra[0] : undefined);
  return named === undefined
    ? 'spectra'
    : sanitizeFileName(named.name, 'spectrum');
}

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 1px',
  width: '100%',
  height: '100%',
  minHeight: 0,
  outline: 'none',
} as const;

const mainStyle = {
  display: 'flex',
  flex: '1 1 1px',
  minWidth: 0,
  minHeight: 0,
} as const;

const railStyle = { flex: 'none' } as const;
