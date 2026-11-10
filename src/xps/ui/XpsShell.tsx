import type { ReactNode, Ref } from 'react';
import { useCallback, useId, useMemo, useState } from 'react';

import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import { useFigureDownload } from '../../download/ui/useFigureDownload.tsx';
import { FixedPanelRow } from '../../panel/ui/FixedPanelRow.tsx';
import { PanelRail } from '../../panel/ui/PanelRail.tsx';
import type { XpsEditorHandle } from '../core/xpsEditorApi.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';

import { XpsAboutDialog } from './XpsAboutDialog.tsx';
import { XpsCanvas } from './XpsCanvas.tsx';
import { XpsCommandProvider } from './XpsCommandProvider.tsx';
import { XpsDocumentationDialog } from './XpsDocumentationDialog.tsx';
import { XpsHeader } from './XpsHeader.tsx';
import { XpsSidePanel } from './XpsSidePanel.tsx';
import { XpsToolbar } from './XpsToolbar.tsx';
import { useSpectrumDrop } from './useSpectrumDrop.ts';
import { useXpsCommandHandlers } from './useXpsCommandHandlers.ts';
import { useXpsEditorHandle } from './useXpsEditorHandle.ts';
import { useXpsSide } from './useXpsSide.ts';
import type { XpsHostPanel } from './xpsHostPanels.ts';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

export interface XpsShellProps {
  /** Whether a paste made anywhere on the page is taken as a spectrum. */
  pasteFromPage: boolean;
  /**
   * The handle to fill in, once there is a state for it to act on.
   * @default undefined
   */
  handle?: Ref<XpsEditorHandle>;
  /** The panels the host adds to the viewer's own, ahead of them. */
  panels: readonly XpsHostPanel[];
  /**
   * The host's own actions — open an example, save a document — as
   * `Toolbar.Item`s of `react-science/ui`, drawn in the header after the
   * viewer's mark.
   * @default undefined
   */
  actions?: ReactNode;
}

/**
 * The viewer's screen: a header, the rails, and the split between the chart and
 * the panels.
 *
 * Kept apart from `XpsEditor` so that the drop and the handle — both of which
 * need the state — sit below the providers rather than beside them, and so the
 * sealed component above is nothing but its props and what it opens on.
 * @param props - Component props.
 * @returns The screen.
 */
export function XpsShell(props: XpsShellProps) {
  const { pasteFromPage, handle, panels, actions: hostActions } = props;

  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const { spectra } = state.data;
  const side = useXpsSide(panels);

  useXpsEditorHandle(handle);

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);

  const taken = useMemo(
    () => spectra.map((spectrum) => spectrum.color),
    [spectra],
  );
  const [attachDrop, drop] = useSpectrumDrop({
    onSpectra: actions.addSpectra,
    taken,
    onError: actions.setError,
    pasteFromPage,
  });

  // The root is held as state rather than in a ref because the keys are bound
  // to it from an effect: a ref filled in during the commit would leave the
  // effect with nothing to listen on for the first render, and no reason ever
  // to run again.
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const attachRoot = useCallback(
    (element: HTMLElement | null) => {
      attachDrop(element);
      setRoot(element);
    },
    [attachDrop],
  );

  // The chart is the picture, so the box it is drawn in is what the figure
  // panel is pointed at: the viewer around it is full of SVG — every icon in
  // every toolbar is one.
  const chartId = useId();
  const figure = useFigureDownload({
    targetId: chartId,
    fileName: pictureName(spectra),
  });
  const { isOpen: isFigureOpen, setOpen: setFigureOpen } = figure;

  const commands = useXpsCommandHandlers({
    onAbout: () => setIsAboutOpen(true),
    onDocumentation: () => setIsDocumentationOpen(true),
    onExportImage: () => setFigureOpen(!isFigureOpen),
  });

  return (
    <XpsCommandProvider handlers={commands} root={root}>
      {/* `tabIndex` so a click anywhere in the viewer makes this the paste
          target, and the one the shortcuts are heard on: both are delivered to
          whatever holds the caret, and an SVG never does. */}
      <div ref={attachRoot} tabIndex={-1} style={rootStyle}>
        <XpsHeader actions={hostActions} />

        <div style={mainStyle}>
          {/* The rails are chrome of a fixed width, and a flex child shrinks by
              default: in a narrow viewer the row would take the width it is
              short of out of them, and half an icon is what that looks like. */}
          <div style={railStyle}>
            <XpsToolbar figure={figure} />
          </div>

          <FixedPanelRow
            collapsed={side.collapsed}
            isOpen={side.isOpen}
            onOpenChange={side.setOpen}
            view={
              <XpsCanvas
                chartId={chartId}
                isOver={drop.isOver}
                isReading={drop.isReading}
              />
            }
            panels={<XpsSidePanel panels={panels} side={side} />}
          />

          {/* Outside the split, so the icons stay put against the right edge
              while the panel beside them is resized or closed. */}
          <div style={railStyle}>
            <PanelRail
              panels={side.panels}
              openIds={side.shownIds}
              onToggle={side.toggle}
            />
          </div>
        </div>
      </div>

      <XpsAboutDialog
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <XpsDocumentationDialog
        isOpen={isDocumentationOpen}
        onClose={() => setIsDocumentationOpen(false)}
      />
    </XpsCommandProvider>
  );
}

/**
 * What a picture of the chart is saved as: the spectrum's name when one is open,
 * the technique otherwise.
 * @param spectra - The spectra on the chart.
 * @returns The file name, without its extension.
 */
function pictureName(spectra: readonly XpsSpectrum[]): string {
  const [first] = spectra;
  if (first === undefined || spectra.length > 1) return 'xps-spectra';
  return sanitizeFileName(first.name) || 'xps-spectrum';
}

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
  // The root only holds the caret so that a paste reaches it; it is not a
  // control, and outlining it as one would say otherwise.
  outline: 'none',
} as const;

const mainStyle = {
  display: 'flex',
  flexDirection: 'row',
  flex: '1 1 1px',
  minHeight: 0,
} as const;

/** A rail is as wide as its icons: it is chrome, and the chart takes the rest. */
const railStyle = {
  display: 'flex',
  flex: 'none',
} as const;
