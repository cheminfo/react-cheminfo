import type { ChangeEvent, Ref } from 'react';
import { useId, useMemo, useRef, useState } from 'react';
import { SplitPane, useFullscreen } from 'react-science/ui';

import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import { useFigureDownload } from '../../download/ui/useFigureDownload.tsx';
import { PanelRail } from '../../panel/ui/PanelRail.tsx';
import type { MassCommandHandlers } from '../core/massCommands.ts';
import type { MassEditorHandle, MassPlotClick } from '../core/massEditorApi.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';

import { MassAboutDialog } from './MassAboutDialog.tsx';
import { MassCanvas } from './MassCanvas.tsx';
import { MassCommandProvider } from './MassCommandProvider.tsx';
import { MassDocumentationDialog } from './MassDocumentationDialog.tsx';
import { MassHeader } from './MassHeader.tsx';
import { MassSidePanel } from './MassSidePanel.tsx';
import { MassToolbar } from './MassToolbar.tsx';
import type { MassHostPanel } from './massHostPanels.ts';
import { useMassActions, useMassEditorState } from './massStateContext.ts';
import { useIntensityZoom } from './useIntensityZoom.ts';
import { useMassFiles } from './useMassFiles.ts';
import { useMassHandle } from './useMassHandle.ts';
import { useMassShortcuts } from './useMassShortcuts.ts';
import { useMassSide } from './useMassSide.ts';

export interface MassShellProps {
  /**
   * The handle to fill in, once there is a state for it to act on.
   * @default undefined
   */
  handle?: Ref<MassEditorHandle>;
  /** The panels the host adds to the viewer's own, ahead of them. */
  panels: readonly MassHostPanel[];
  /**
   * Told of a click on the plot, with the spectrum selected at that moment.
   * @default undefined
   */
  onPlotClick?: (click: MassPlotClick) => void;
}

/**
 * The viewer's screen: a header, the rails, and the split between the chart and
 * the panels.
 *
 * Kept apart from `MassEditor` so that the handle, the commands and the
 * highlight — all of which need the state — sit below the providers rather than
 * beside them, and so the sealed component above is nothing but its props.
 * @param props - Component props.
 * @returns The screen.
 */
export function MassShell(props: MassShellProps) {
  const { handle, panels, onPlotClick } = props;

  const { state, visibleSpectra, selectedSpectrum } = useMassEditorState();
  const actions = useMassActions();
  const { toggle: toggleFullScreen } = useFullscreen();
  const { openPanelIds, tool } = state.view;
  const { showLabels, showCharges } = state.settings;
  const side = useMassSide(panels);
  const files = useMassFiles();
  const fileInput = useRef<HTMLInputElement>(null);
  const { zoomIn, zoomOut } = useIntensityZoom();

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  // What the pointer is resting on is not part of the document and changes on
  // every move across the chart, so it is held here rather than in the reducer,
  // where every panel's memo would run sixty times a second.
  const [highlightMz, setHighlightMz] = useState<number | null>(null);

  // The chart is the picture, so the box it is drawn in is what the figure
  // panel is pointed at: the viewer around it is full of SVG icons.
  const chartId = useId();
  const figure = useFigureDownload({
    targetId: chartId,
    fileName: pictureName(visibleSpectra, selectedSpectrum),
  });
  const { isOpen: isFigureOpen, setOpen: setFigureOpen } = figure;

  const commands = useMemo<MassCommandHandlers>(
    () => ({
      about: () => setIsAboutOpen(true),
      documentation: () => setIsDocumentationOpen(true),
      fullScreen: toggleFullScreen,
      openFiles: () => fileInput.current?.click(),
      readTool: () => actions.setTool('read'),
      boxTool: () => actions.setTool(tool === 'box' ? 'read' : 'box'),
      zoomIn,
      zoomOut,
      resetZoom: () => actions.resetDomain(),
      toggleLabels: () => actions.setSettings({ showLabels: !showLabels }),
      toggleCharges: () => actions.setSettings({ showCharges: !showCharges }),
      exportImage: () => setFigureOpen(!isFigureOpen),
      clear: () => actions.clear(),
    }),
    [
      actions,
      tool,
      showLabels,
      showCharges,
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
  useMassShortcuts(root, commands);
  useMassHandle(handle, files.readFiles);

  return (
    <MassCommandProvider handlers={commands}>
      {/* `tabIndex` so a click anywhere in the viewer makes this the target the
          shortcuts are heard on: keys are delivered to whatever holds the caret,
          and an SVG never does. */}
      <div ref={setRoot} tabIndex={-1} style={rootStyle}>
        <MassHeader />

        <div style={mainStyle}>
          <div style={railStyle}>
            <MassToolbar figure={figure} />
          </div>

          <SplitPane
            direction="horizontal"
            controlledSide="end"
            defaultSize="360px"
            open={side.isOpen}
            onOpenChange={side.setOpen}
          >
            <MassCanvas
              highlightMz={highlightMz}
              onHighlight={setHighlightMz}
              chartId={chartId}
              onDropFiles={(dropped) => void files.readFiles(dropped)}
              {...(onPlotClick === undefined ? {} : { onPlotClick })}
            />

            <MassSidePanel
              panels={panels}
              highlightMz={highlightMz}
              onHighlight={setHighlightMz}
            />
          </SplitPane>

          {/* Outside the split, so the icons stay put against the right edge
              while the panel beside them is resized or closed. */}
          <div style={railStyle}>
            <PanelRail
              panels={side.panels}
              openIds={openPanelIds}
              onToggle={actions.togglePanel}
            />
          </div>
        </div>

        <input
          ref={fileInput}
          type="file"
          multiple
          accept={ACCEPTED_FILES}
          style={hiddenStyle}
          aria-label="Open spectra"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const chosen = [...(event.currentTarget.files ?? [])];
            // Emptied so that choosing the same file again is still a change.
            event.currentTarget.value = '';
            if (chosen.length > 0) void files.readFiles(chosen);
          }}
        />
      </div>

      <MassAboutDialog
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
      <MassDocumentationDialog
        isOpen={isDocumentationOpen}
        onClose={() => setIsDocumentationOpen(false)}
      />
    </MassCommandProvider>
  );
}

/**
 * What a picture of the chart is called: the spectrum being looked at, since a
 * figure of the chart is a figure of that spectrum, and a chart holding several
 * and pointing at none of them is named after the lot.
 * @param spectra - What is drawn.
 * @param selected - The one being looked at, `null` when none is.
 * @returns The name, without its extension.
 */
function pictureName(
  spectra: readonly MassSpectrum[],
  selected: MassSpectrum | null,
): string {
  const named = selected ?? (spectra.length === 1 ? spectra[0] : undefined);
  return named === undefined
    ? 'spectra'
    : sanitizeFileName(named.name, 'spectrum');
}

/** What the file dialog offers, which is what the readers understand. */
const ACCEPTED_FILES = '.jdx,.dx,.jcamp,.txt,.csv,.tsv,.xy,.asc,.dat';

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

/**
 * The rails are chrome of a fixed width, and a flex child shrinks by default: in
 * a narrow viewer the row would take the width it is short of out of them.
 */
const railStyle = { flex: 'none' } as const;

/** The file input is opened by the toolbar, never clicked itself. */
const hiddenStyle = { display: 'none' } as const;
