import type { CSSProperties, ReactElement } from 'react';

import type { SettingsProblem } from '../core/problems.ts';
import type { PostProcessingSettings } from '../core/settings.ts';

import { CalculationRows } from './CalculationRows.tsx';
import { MatrixFilterRows } from './MatrixFilterRows.tsx';
import { ProblemList } from './ProblemList.tsx';
import { RangeRows } from './RangeRows.tsx';
import { ScaleFields } from './ScaleFields.tsx';
import { SettingsPart } from './SettingsPart.tsx';
import { SpectrumSelection } from './SpectrumSelection.tsx';
import { problemsAbout } from './problemsAbout.ts';

/** What {@link PostProcessingEditor} edits. */
export interface PostProcessingEditorProps {
  /** What `getPostProcessedData` would be handed. */
  value: PostProcessingSettings;
  /** Called with the edited settings on every change. */
  onChange: (settings: PostProcessingSettings) => void;
  /** Every problem the whole settings object has; each part picks its own. */
  problems: readonly SettingsProblem[];
  /**
   * The ids the processor holds, so a spectrum is picked rather than typed.
   * @default undefined — every spectrum is named by typing its id
   */
  spectrumIds?: readonly string[];
}

/**
 * The stage that runs once every spectrum already shares one grid.
 *
 * Everything here works across spectra rather than along one, which is why it
 * cannot be part of the chain: a matrix step reads the median of the whole
 * dataset, a scaling reads one spectrum chosen as the reference, and a
 * calculation reads the integrals of ranges measured on all of them.
 * @param props - See {@link PostProcessingEditorProps}.
 * @returns The selection, the matrix steps, the scaling, the ranges and the calculations.
 */
export function PostProcessingEditor(
  props: PostProcessingEditorProps,
): ReactElement {
  const { value, onChange, problems, spectrumIds } = props;

  return (
    <div style={STAGE_STYLE}>
      <SettingsPart
        title="Spectra"
        summary="Which of the loaded spectra this stage is run over."
      >
        <SpectrumSelection
          value={value.ids}
          spectrumIds={spectrumIds}
          onChange={(ids) => {
            onChange(withIds(value, ids));
          }}
        />
      </SettingsPart>

      <SettingsPart
        title="Matrix steps"
        summary="What the whole matrix goes through once every spectrum is a row of it."
      >
        <MatrixFilterRows
          value={value.filters ?? []}
          onChange={(filters) => {
            onChange({ ...value, filters });
          }}
        />
        <ProblemList problems={problemsAbout(problems, 'Matrix step')} />
      </SettingsPart>

      <SettingsPart
        title="Scaling"
        summary="What every spectrum is scaled against, so one dataset can be read as one."
      >
        <ScaleFields
          value={value.scale ?? {}}
          spectrumIds={spectrumIds}
          onChange={(scale) => {
            onChange({ ...value, scale });
          }}
        />
        <ProblemList problems={problemsAbout(problems, 'Scaling')} />
      </SettingsPart>

      <SettingsPart
        title="Ranges"
        summary="The stretches of x integrated and reported for every spectrum."
      >
        <RangeRows
          value={value.ranges ?? []}
          onChange={(ranges) => {
            onChange({ ...value, ranges });
          }}
        />
        <ProblemList problems={problemsAbout(problems, 'Range')} />
      </SettingsPart>

      <SettingsPart
        title="Calculations"
        summary="Numbers worked out per spectrum from the range integrals."
      >
        <CalculationRows
          value={value.calculations ?? []}
          onChange={(calculations) => {
            onChange({ ...value, calculations });
          }}
        />
        <ProblemList problems={problemsAbout(problems, 'Calculation')} />
      </SettingsPart>
    </div>
  );
}

/**
 * The settings naming other spectra, or none at all.
 * @param value - What `getPostProcessedData` would be handed.
 * @param ids - The chosen ids, or undefined for every spectrum.
 * @returns A new settings object, without the key at all when none is chosen.
 */
function withIds(
  value: PostProcessingSettings,
  ids: string[] | undefined,
): PostProcessingSettings {
  const next: PostProcessingSettings = { ...value };
  if (ids === undefined) delete next.ids;
  else next.ids = ids;
  return next;
}

const STAGE_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
} as const satisfies CSSProperties;
