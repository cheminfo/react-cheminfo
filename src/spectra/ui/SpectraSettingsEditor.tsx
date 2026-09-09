import type { CSSProperties, ReactElement } from 'react';

import type {
  PrincipalComponentSelection,
  PrincipalComponentSettings,
} from '../core/principalComponents.ts';
import type {
  PostProcessingSettings,
  SpectraProcessorSettings,
  SpectraSettings,
} from '../core/settings.ts';
import { settingsProblems } from '../core/settingsProblems.ts';

import { NormalizationEditor } from './NormalizationEditor.tsx';
import { PostProcessingEditor } from './PostProcessingEditor.tsx';
import { PrincipalComponentSelect } from './PrincipalComponentSelect.tsx';
import { ProblemList } from './ProblemList.tsx';
import { SettingsPart } from './SettingsPart.tsx';

/** A decomposition the panel offers a component picker for. */
export interface PrincipalComponentPanel {
  /** Which two components are drawn — both zero-based columns of the score matrix. */
  selection: PrincipalComponentSelection;
  /** Called with the pair whenever either axis changes. */
  onSelectionChange: (selection: PrincipalComponentSelection) => void;
  /** How many components the decomposition produced. */
  count: number;
  /**
   * What `pca.getExplainedVariance()` returned, as fractions.
   * @default undefined — the components are named without their share
   */
  explainedVariance?: readonly number[];
  /**
   * How the decomposition is computed, when the panel is to offer that too.
   * @default undefined — only the two axes are offered
   */
  settings?: PrincipalComponentSettings;
  /**
   * Called with the decomposition's options; needed for them to be offered.
   * @default undefined — the options are not offered
   */
  onSettingsChange?: (settings: PrincipalComponentSettings) => void;
}

/** What {@link SpectraSettingsEditor} edits. */
export interface SpectraSettingsEditorProps {
  /** Both settings objects the processor takes. */
  value: SpectraSettings;
  /** Called with the whole settings object on every edit. */
  onChange: (settings: SpectraSettings) => void;
  /**
   * The spectra the processor holds, which turns every place an id is typed
   * into a place one is picked.
   * @default undefined — an id is typed rather than picked
   */
  spectrumIds?: readonly string[];
  /**
   * The decomposition, when the page draws one.
   * @default undefined — no component picker is drawn
   */
  principalComponents?: PrincipalComponentPanel;
}

/**
 * Everything `spectra-processor` can be told, in the order it happens.
 *
 * The panel is laid out as the pipeline runs — every spectrum is brought onto
 * one grid first, then the matrix of them all is worked on, then the components
 * are picked — because the settings only make sense in that order: a range is
 * read in whatever units the chain has left the x axis in, and the matrix stage
 * cannot say anything until every row is the same length.
 *
 * Nothing here blocks. A reader mid-thought may hold settings the processor
 * would throw on, and the panel says which value it would throw on rather than
 * refusing the edit.
 * @param props - See {@link SpectraSettingsEditorProps}.
 * @returns The whole settings panel.
 */
export function SpectraSettingsEditor(
  props: SpectraSettingsEditorProps,
): ReactElement {
  const { value, onChange, spectrumIds, principalComponents } = props;
  const problems = settingsProblems(value);

  function writeProcessor(processor: SpectraProcessorSettings): void {
    onChange({ ...value, processor });
  }

  function writePostProcessing(postProcessing: PostProcessingSettings): void {
    onChange({ ...value, postProcessing });
  }

  return (
    <div style={PANEL_STYLE}>
      <SettingsPart
        title="Every spectrum onto one grid"
        summary="What the processor is built with. Until this is settled no two spectra can be compared, and changing it recomputes every one of them."
      >
        <NormalizationEditor
          value={value.processor}
          problems={problems}
          onChange={writeProcessor}
        />
      </SettingsPart>

      <SettingsPart
        title="The matrix of them all"
        summary="What every comparison reads, once the rows are the same length."
      >
        <PostProcessingEditor
          value={value.postProcessing}
          problems={problems}
          spectrumIds={spectrumIds}
          onChange={writePostProcessing}
        />
      </SettingsPart>

      {principalComponents === undefined ? null : (
        <SettingsPart
          title="Principal components"
          summary="Which two of them a score plot is drawn against."
        >
          <PrincipalComponentSelect
            value={principalComponents.selection}
            count={principalComponents.count}
            explainedVariance={principalComponents.explainedVariance}
            settings={principalComponents.settings}
            onChange={principalComponents.onSelectionChange}
            onSettingsChange={principalComponents.onSettingsChange}
          />
        </SettingsPart>
      )}

      <ProblemList problems={problems} title="The settings as they stand" />
    </div>
  );
}

const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
} as const satisfies CSSProperties;
