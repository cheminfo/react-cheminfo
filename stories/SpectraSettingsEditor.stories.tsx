import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import type { PrincipalComponentSelection } from '../src/spectra/core/principalComponents.ts';
import type { SpectraSettings } from '../src/spectra/core/settings.ts';
import type { SpectraSettingsEditorProps } from '../src/spectra/ui/SpectraSettingsEditor.tsx';
import { SpectraSettingsEditor } from '../src/spectra/ui/SpectraSettingsEditor.tsx';

import {
  EXPLAINED_VARIANCE,
  IR_SETTINGS,
  LOG_AXIS_SETTINGS,
  OPENING_SETTINGS,
  SPECTRUM_IDS,
} from './spectraFixtures.ts';

function SpectraSettingsEditorDemo(
  props: SpectraSettingsEditorProps,
): ReactElement {
  const [settings, setSettings] = useState<SpectraSettings>(props.value);
  const [selection, setSelection] = useState<PrincipalComponentSelection>({
    x: 0,
    y: 1,
  });

  const panel = props.principalComponents;

  return (
    <SpectraSettingsEditor
      {...props}
      value={settings}
      principalComponents={
        panel === undefined
          ? undefined
          : {
              ...panel,
              selection,
              onSelectionChange: (next) => {
                setSelection(next);
                panel.onSelectionChange(next);
              },
            }
      }
      onChange={(next) => {
        setSettings(next);
        props.onChange(next);
      }}
    />
  );
}

function noop(): void {
  // A page would hand the settings to the processor; the story only holds them.
}

const meta = {
  title: 'Spectra/SpectraSettingsEditor',
  component: SpectraSettingsEditor,
  args: { value: IR_SETTINGS, onChange: noop },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Everything spectra-processor can be told, laid out in the order it happens: every spectrum onto one grid, then the matrix of them all, then the components. Nothing blocks — a value the processor would throw on is named at the foot rather than refused.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(56rem, 96vw)' }}>
      <SpectraSettingsEditorDemo {...args} />
    </div>
  ),
} satisfies Meta<typeof SpectraSettingsEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A worked-up infrared study, both stages, down to the ratio it is after. */
export const Default: Story = {};

/** Nothing set: the processor's own defaults, which is where a page opens. */
export const AsItOpens: Story = { args: { value: OPENING_SETTINGS } };

/** The processor is holding spectra, so every id is picked rather than typed. */
export const WithTheSpectraLoaded: Story = {
  args: { value: IR_SETTINGS, spectrumIds: SPECTRUM_IDS },
};

/** The component picker, and the decomposition's own options under it. */
export const WithPrincipalComponents: Story = {
  args: {
    value: IR_SETTINGS,
    spectrumIds: SPECTRUM_IDS,
    principalComponents: {
      selection: { x: 0, y: 1 },
      onSelectionChange: noop,
      count: 6,
      explainedVariance: EXPLAINED_VARIANCE,
      settings: { method: 'SVD', center: true, scale: false },
      onSettingsChange: noop,
    },
  },
};

/**
 * The settings' most confusing corner. The chain takes the logarithm of x, and
 * the resampling runs after it — so the range reads −1 to 1 in log units, not
 * 0.1 to 10 in the spectrum's own. Switch the order control and the same two
 * numbers quietly come to mean something else.
 */
export const OnALogarithmicAxis: Story = { args: { value: LOG_AXIS_SETTINGS } };

/**
 * A range running backwards and a calculation naming a range that does not
 * exist. Both are drawn, both are named at the foot, and neither is refused.
 */
export const WithProblems: Story = {
  args: {
    value: {
      processor: { normalization: { from: 4000, to: 400, numberOfPoints: 1 } },
      postProcessing: {
        ranges: [{ from: 1700, to: 1630, label: 'C=O' }],
        calculations: [{ label: 'ratio', formula: 'amide / carbonyl' }],
      },
    },
  },
};
