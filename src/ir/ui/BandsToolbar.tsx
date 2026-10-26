import { useMemo } from 'react';
import { Button, Toolbar } from 'react-science/ui';

import { panelToolbarStyle } from '../../panel/core/panelStyles.ts';
import { IR_TECHNIQUE_RULES } from '../core/irTechnique.ts';

import { bandsToTsv } from './bandsTsv.ts';
import { useIrCommandProps } from './irCommandContext.tsx';
import { useIrActions, useIrEditorState } from './irStateContext.ts';

/**
 * The row at the top of the bands panel: the switches — picking at all,
 * picking by hand, naming the assignments — then the threshold, then what
 * acts at once, apart from them on the right: finding the bands automatically
 * again, taking every band away, copying the table.
 * @returns The row.
 */
export function BandsToolbar() {
  const { state, selectedSpectrum, assigned } = useIrEditorState();
  const actions = useIrActions();
  const command = useIrCommandProps();
  const { tool } = state.view;
  const { mode, pickBands, showAssignments, technique } = state.settings;
  const { assignments } = IR_TECHNIQUE_RULES[technique];
  const byHand = selectedSpectrum?.bandsByHand === true;

  const tsv = useMemo(
    () => bandsToTsv(assigned, mode, assignments),
    [assigned, mode, assignments],
  );

  return (
    <div style={panelToolbarStyle}>
      <Toolbar aria-label="Band actions">
        <Toolbar.Item
          icon="locate"
          active={pickBands}
          tooltip={pickBands ? 'Stop picking bands' : 'Pick the bands'}
          aria-label="Pick the bands"
          onClick={() => actions.setSettings({ pickBands: !pickBands })}
        />
        <Toolbar.Item
          icon="add-location"
          active={tool === 'pick'}
          {...command('pickTool')}
          disabled={selectedSpectrum === null}
        />
        {assignments ? (
          <Toolbar.Item
            icon="label"
            active={showAssignments}
            tooltip="Name the assignments on the chart"
            aria-label="Name the assignments on the chart"
            disabled={!pickBands}
            onClick={() =>
              actions.setSettings({ showAssignments: !showAssignments })
            }
          />
        ) : null}
      </Toolbar>

      <ThresholdSlider />

      <span style={{ flex: 1 }} />

      <Button
        variant="minimal"
        icon="refresh"
        disabled={!pickBands || !byHand}
        tooltipProps={{ content: 'Find the bands automatically again' }}
        aria-label="Find the bands automatically again"
        onClick={() => {
          if (selectedSpectrum !== null) {
            actions.resetBands(selectedSpectrum.id);
          }
        }}
      />
      <Button
        variant="minimal"
        icon="eraser"
        disabled={!pickBands || assigned.length === 0}
        tooltipProps={{ content: 'Take every band away, to pick them by hand' }}
        aria-label="Take every band away"
        onClick={() => {
          if (selectedSpectrum !== null) {
            actions.setBands(selectedSpectrum.id, []);
          }
        }}
      />
      <Button
        variant="minimal"
        icon="clipboard"
        disabled={assigned.length === 0}
        tooltipProps={{ content: 'Copy the table' }}
        aria-label="Copy the table"
        onClick={() => void navigator.clipboard?.writeText(tsv)}
      />
    </div>
  );
}

/**
 * The threshold, the one picking setting worth reaching for while reading:
 * everything else about a band follows from the spectrum, and this is what
 * decides whether a shoulder is a band at all. Bands picked by hand are not
 * its to move.
 * @returns The labelled slider.
 */
function ThresholdSlider() {
  const { state, selectedSpectrum } = useIrEditorState();
  const actions = useIrActions();
  const { pickBands, picking } = state.settings;
  const byHand = selectedSpectrum?.bandsByHand === true;

  return (
    <label
      style={thresholdStyle}
      title={
        byHand
          ? 'The bands were picked by hand: find them automatically again to use the threshold.'
          : undefined
      }
    >
      <span style={{ opacity: 0.7 }}>threshold</span>
      <input
        type="range"
        min={0.005}
        max={0.3}
        step={0.005}
        style={sliderStyle}
        value={picking.minRelativeHeight ?? 0.02}
        disabled={!pickBands || byHand}
        aria-label="How tall a band must be to be picked"
        onChange={(event) =>
          actions.setSettings({
            picking: { minRelativeHeight: event.target.valueAsNumber },
          })
        }
      />
    </label>
  );
}

const thresholdStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
} as const;

/** Narrower than the browser's own, so the row holds every control at 360 px. */
const sliderStyle = { width: 88 } as const;
