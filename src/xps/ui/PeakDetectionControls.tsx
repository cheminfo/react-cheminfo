import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from 'react-science/ui';

import { NumberInput } from '../../number/ui/NumberInput.tsx';
import { countLabel } from '../../panel/core/statusBar.ts';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import { MINIMUM_PICKING_POINTS, pickPeaks } from '../core/pickPeaks.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';

import { labelStyle, panelFieldStyle as fieldStyle } from './panelStyles.ts';
import { useXpsActions } from './xpsStateContext.ts';

export interface PeakDetectionControlsProps {
  /** The spectrum the detection is run over. */
  spectrum: XpsSpectrum;
}

/**
 * Run the peak detection again, harder or less hard.
 *
 * The two numbers here are the two the answer actually turns on. Prominence is
 * what separates a line from the structure of the background it stands on, and
 * it is the control that means the same thing at both ends of a survey scan
 * whose background climbs from tens of counts to thousands. The floor is an
 * absolute number of counts and is left empty unless a reader can see where the
 * noise of a flat narrow scan sits.
 *
 * The result replaces the spectrum's peaks rather than being held here, so the
 * table, the chart labels and the element lookup are all reading one detection.
 * That is also why there is no live re-run as the numbers are typed: a detection
 * over a hundred thousand points on every keystroke would fight the caret, and
 * the reader is choosing a value rather than sweeping one.
 * @param props - Component props.
 * @returns The controls.
 */
export function PeakDetectionControls(
  props: PeakDetectionControlsProps,
): ReactNode {
  const { spectrum } = props;
  const actions = useXpsActions();
  const [noiseLevel, setNoiseLevel] = useState<number | undefined>(undefined);
  const [prominence, setProminence] = useState(DEFAULT_PROMINENCE_RATIO);

  const points = spectrum.energy.x.length;
  const enough = points >= MINIMUM_PICKING_POINTS;

  function detect(): void {
    actions.setSpectrumPeaks(
      spectrum.id,
      pickPeaks(spectrum.energy, {
        noiseLevel,
        minProminenceRatio: prominence,
      }),
    );
  }

  if (!enough) {
    return (
      <PanelEmpty>
        This spectrum holds {countLabel(points, 'point', 'points')}, and the
        detection needs at least {MINIMUM_PICKING_POINTS} to take a derivative
        at all.
      </PanelEmpty>
    );
  }

  return (
    <div style={rowStyle}>
      <label
        style={fieldStyle}
        title="Counts under which a maximum is not a peak at all. Left empty there is no absolute floor, which is right for a survey scan whose background rises across the scan."
      >
        <span style={labelStyle}>Noise floor</span>
        <NumberInput
          allowEmpty
          fill
          size="small"
          min={0}
          value={noiseLevel}
          placeholder="none"
          buttons={false}
          onChange={setNoiseLevel}
        />
      </label>

      <label
        style={fieldStyle}
        title="How far a maximum must rise above its own surroundings to count as a peak, as a fraction of the full height of the trace."
      >
        <span style={labelStyle}>Prominence</span>
        <NumberInput
          fill
          size="small"
          min={0}
          max={1}
          step={0.005}
          value={prominence}
          buttons={false}
          onChange={setProminence}
        />
      </label>

      <Button
        size="small"
        intent="primary"
        icon="refresh"
        text="Detect"
        tooltipProps={{ content: 'Find the maxima again with these settings' }}
        onClick={detect}
      />
    </div>
  );
}

/** The prominence `pickPeaks` uses when it is not told another one. */
const DEFAULT_PROMINENCE_RATIO = 0.02;

/** The two numbers and the button that applies them, on one line each. */
const rowStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 6,
} as const;
