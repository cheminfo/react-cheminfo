import { HTMLSelect } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Toolbar } from 'react-science/ui';

import { PanelEmpty, PanelMessage } from '../../panel/ui/PanelMessage.tsx';
import { hasBindingAxis } from '../core/energyAxis.ts';
import type { SurveyBackground } from '../core/quantifySurvey.ts';
import { quantifySurvey, surveyComposition } from '../core/quantifySurvey.ts';
import { findSpectrum } from '../core/spectrumGroups.ts';
import { spectrumExtent, surveyLinesOf } from '../core/surveyElements.ts';
import type { XpsSurveyLine } from '../core/surveyLines.ts';
import { findInstrument, xpsInstruments } from '../core/xpsInstrument.ts';

import { FormulaProposals } from './FormulaProposals.tsx';
import { SurveyElementsField } from './SurveyElementsField.tsx';
import { SurveyTable } from './SurveyTable.tsx';
import {
  labelStyle,
  panelBodyStyle as bodyStyle,
  panelFieldStyle as fieldStyle,
  panelStyle,
  panelSummaryStyle as summaryStyle,
  panelToolbarStyle as toolbarStyle,
} from './panelStyles.ts';
import { useXpsCommandProps } from './xpsCommandContext.tsx';
import { useLookAtEnergy } from './xpsHighlightContext.ts';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

/**
 * How much of each element the selected survey says the surface holds, and the
 * formulas that ratio could be.
 *
 * Every number the composition rests on is on the panel, because each of them
 * moves it: the instrument whose factors the areas are divided by, the
 * background they are taken over, the line each element is read on and the
 * window around it — which is also shaded on the chart while the panel is open.
 * The elements start as those of the narrow scans of the same sample, and the
 * field above the table is where one is added or taken away.
 * @returns The panel.
 */
export function QuantificationPanel(): ReactNode {
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const command = useXpsCommandProps();
  const lookAt = useLookAtEnergy();
  const { spectra } = state.data;
  const { selectedId } = state.view;
  const { instrumentId, instruments, surveyBackground } = state.settings;

  // Bumped by the reset, so the elements field shows the list it went back to.
  const [resets, setResets] = useState(0);

  const spectrum = useMemo(
    () => findSpectrum(spectra, selectedId),
    [spectra, selectedId],
  );
  const instrument = useMemo(
    () => findInstrument(instruments, instrumentId),
    [instruments, instrumentId],
  );
  const lines = useMemo(
    () =>
      spectrum === null
        ? NO_LINES
        : surveyLinesOf(spectrum, spectra, instrument),
    [spectrum, spectra, instrument],
  );
  const rows = useMemo(
    () =>
      spectrum === null
        ? []
        : quantifySurvey(spectrum.energy, lines, instrument, {
            background: surveyBackground,
          }),
    [spectrum, lines, instrument, surveyBackground],
  );
  const composition = useMemo(() => surveyComposition(rows), [rows]);
  const extent = spectrum === null ? null : spectrumExtent(spectrum);

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

  const changeLines = useCallback(
    (next: XpsSurveyLine[] | null) => {
      if (spectrum !== null) actions.setSurveyLines(spectrum.id, next);
    },
    [actions, spectrum],
  );

  const usable = spectrum !== null && hasBindingAxis(spectrum);

  return (
    <div style={panelStyle}>
      <div style={toolbarStyle}>
        <Toolbar aria-label="Quantification">
          <Toolbar.Item
            icon="reset"
            tooltip="Go back to the elements of the narrow scans, each on its usual line and window"
            aria-label="Reset the quantified lines"
            disabled={spectrum?.surveyLines === undefined}
            onClick={() => {
              changeLines(null);
              setResets(resets + 1);
            }}
          />
        </Toolbar>
        <div style={gearStyle}>
          <Toolbar aria-label="Quantification settings">
            <Toolbar.Item icon="cog" {...command('settings')} />
          </Toolbar>
        </div>
      </div>

      <div style={bodyStyle}>
        <div style={pickersStyle}>
          <label style={{ ...fieldStyle, flex: '1 1 auto' }}>
            <span style={labelStyle}>Instrument</span>
            <HTMLSelect
              value={instrument.id}
              style={selectStyle}
              fill
              onChange={(event) =>
                actions.setSettings({ instrumentId: event.target.value })
              }
              options={xpsInstruments(instruments).map((choice) => ({
                value: choice.id,
                label: choice.name,
              }))}
            />
          </label>
          <label style={fieldStyle}>
            <span style={labelStyle}>Background</span>
            <HTMLSelect
              value={surveyBackground}
              style={selectStyle}
              onChange={(event) =>
                actions.setSettings({
                  surveyBackground: event.target.value as SurveyBackground,
                })
              }
              options={BACKGROUND_OPTIONS}
            />
          </label>
        </div>

        {spectrum === null ? (
          <PanelEmpty>
            Select a survey in the list and the composition it gives appears
            here.
          </PanelEmpty>
        ) : null}

        {spectrum !== null && !usable ? (
          <PanelEmpty>
            This spectrum states no photon energy, so it has no binding-energy
            axis to place a line on.
          </PanelEmpty>
        ) : null}

        {usable && extent !== null ? (
          <>
            {spectrum.transition.element === null ? null : (
              <PanelMessage>
                This is a narrow scan of {spectrum.transition.name}. A
                composition is read off a survey, which holds every element:
                select the survey of this sample.
              </PanelMessage>
            )}
            <SurveyElementsField
              key={`${spectrum.id}:${resets}`}
              spectrum={spectrum}
              lines={lines}
              instrument={instrument}
              onLines={changeLines}
            />
            {rows.length === 0 ? (
              <PanelEmpty>
                No element is quantified yet. Type the elements the survey shows
                — C O N, say — and each is read on its strongest line.
              </PanelEmpty>
            ) : (
              <>
                <div style={summaryStyle}>
                  Areas over a {BACKGROUND_NAMES[surveyBackground]} background,
                  divided by the factors of {instrument.name}.
                </div>
                <SurveyTable
                  rows={rows}
                  instrument={instrument}
                  extent={extent}
                  onChange={(index, line) =>
                    changeLines(lines.with(index, line))
                  }
                  onHover={hover}
                />
              </>
            )}
            <FormulaProposals composition={composition} />
          </>
        ) : null}
      </div>
    </div>
  );
}

const NO_LINES: XpsSurveyLine[] = [];

const BACKGROUND_OPTIONS = [
  { value: 'shirley', label: 'Shirley' },
  { value: 'linear', label: 'Linear' },
];

/** How a background is named inside a sentence. */
const BACKGROUND_NAMES: Record<SurveyBackground, string> = {
  shirley: 'Shirley',
  linear: 'linear',
};

/** The settings gear holds the far end of the toolbar row, on its own. */
const gearStyle = { marginLeft: 'auto', display: 'flex' } as const;

/** The two pickers share a row, the instrument taking what is left. */
const pickersStyle = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-end',
} as const;

/** A select as compact as the other fields of a panel. */
const selectStyle = { fontSize: 12 } as const;
