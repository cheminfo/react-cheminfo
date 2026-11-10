import { Slider } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Toolbar } from 'react-science/ui';

import { countLabel } from '../../panel/core/statusBar.ts';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import { buildElementRows, countIdentifiedPeaks } from '../core/elementRows.ts';
import { findSpectrum } from '../core/spectrumGroups.ts';
import type { XpsPeak } from '../core/xpsSpectrum.ts';
import { MAXIMUM_REFERENCE_TOLERANCE } from '../core/xpsState.ts';

import { ElementTable } from './ElementTable.tsx';
import { EnergyLookup } from './EnergyLookup.tsx';
import {
  labelStyle,
  panelBodyStyle as bodyStyle,
  panelFieldStyle as fieldStyle,
  panelStyle,
  panelSummaryStyle as summaryStyle,
  panelToolbarStyle as toolbarStyle,
} from './panelStyles.ts';
import { useLookAtEnergy } from './xpsHighlightContext.ts';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

/**
 * What the peaks of the selected spectrum say the sample is made of.
 *
 * An element is believed because several of its levels turn up at once — an
 * O 1s at 531 with its O 2s at 24, a Mo 3d doublet with the 3p above it — so the
 * rows here are elements and the energies that support each are listed beside
 * it. One peak accounted for by one level is a coincidence; three are a claim.
 *
 * The tolerance is the panel's real control, and it belongs here rather than in
 * a settings dialog because it is not a preference: it is the width of the
 * window every row above it was computed through, and the reader moves it while
 * watching the rows move. Half an eV is a charge correction, two is a chemical
 * shift, and past about three the answer stops being one element and the table
 * fills with everything.
 * @returns The panel.
 */
export function ElementsPanel(): ReactNode {
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const lookAt = useLookAtEnergy();
  const { spectra } = state.data;
  const { selectedId } = state.view;
  const { referenceTolerance } = state.settings;

  const [showLookup, setShowLookup] = useState(false);

  const spectrum = useMemo(
    () => findSpectrum(spectra, selectedId),
    [spectra, selectedId],
  );
  const peaks = spectrum?.peaks ?? NO_PEAKS;

  const rows = useMemo(
    () => buildElementRows(peaks, { tolerance: referenceTolerance }),
    [peaks, referenceTolerance],
  );
  const identified = useMemo(
    () => countIdentifiedPeaks(peaks, { tolerance: referenceTolerance }),
    [peaks, referenceTolerance],
  );

  // Stable across a pointer move, so the table below does not rebuild on one.
  const hover = useCallback(
    (bindingEnergy: number | null) => {
      lookAt({
        spectrumId: bindingEnergy === null ? null : (spectrum?.id ?? null),
        peakId: null,
        componentId: null,
        bindingEnergy,
      });
    },
    [lookAt, spectrum],
  );

  return (
    <div style={panelStyle}>
      <div style={toolbarStyle}>
        <Toolbar aria-label="Elements">
          <Toolbar.Item
            icon="locate"
            active={showLookup}
            tooltip="Ask what sits at one binding energy"
            aria-label="Look up a binding energy"
            onClick={() => setShowLookup(!showLookup)}
          />
        </Toolbar>
      </div>

      <div style={bodyStyle}>
        <div style={fieldStyle}>
          <span style={labelStyle}>
            Tolerance — {referenceTolerance.toFixed(1)} eV
          </span>
          <Slider
            min={SLIDER_MINIMUM}
            max={MAXIMUM_REFERENCE_TOLERANCE}
            stepSize={0.1}
            labelStepSize={SLIDER_LABEL_STEP}
            value={referenceTolerance}
            onChange={(tolerance) =>
              actions.setSettings({ referenceTolerance: tolerance })
            }
          />
        </div>

        {showLookup ? (
          <EnergyLookup tolerance={referenceTolerance} onHover={hover} />
        ) : null}

        {spectrum === null ? (
          <PanelEmpty>
            Select a spectrum in the list and the elements its peaks could
            belong to appear here.
          </PanelEmpty>
        ) : null}

        {spectrum !== null && rows.length === 0 ? (
          <PanelEmpty>
            {peaks.length === 0
              ? 'This spectrum has no picked peak yet, so there is nothing to identify. Run the detection from the Peaks panel.'
              : `Nothing published sits within ${referenceTolerance.toFixed(1)} eV of any of these ${countLabel(peaks.length, 'peak', 'peaks')}. A charging sample shifts every line to higher binding energy — widen the tolerance, or reference the spectrum to adventitious carbon first.`}
          </PanelEmpty>
        ) : null}

        {rows.length > 0 ? (
          <>
            <div style={summaryStyle}>
              {identified} of {countLabel(peaks.length, 'peak', 'peaks')}{' '}
              identified, {countLabel(rows.length, 'element', 'elements')}{' '}
              offered
            </div>
            <ElementTable rows={rows} onHover={hover} />
          </>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The narrowest window the slider offers.
 *
 * Not zero: a tolerance of zero is not a narrow window but one no measurement
 * can fall in, so every peak would quietly stop being identified while the
 * panel went on looking like a lookup that found nothing.
 */
const SLIDER_MINIMUM = 0.1;

/** How often the slider writes a number under itself, in eV. */
const SLIDER_LABEL_STEP = 5;

/** The peaks of no spectrum, kept stable so the memos survive a re-render. */
const NO_PEAKS: readonly XpsPeak[] = [];
