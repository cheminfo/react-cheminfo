import { Callout, SegmentedControl } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { SettingsProblem } from '../core/problems.ts';
import type {
  ExclusionZone,
  NormalizationSettings,
  SpectraProcessorSettings,
} from '../core/settings.ts';
import {
  DEFAULT_MAX_MEMORY,
  DEFAULT_NUMBER_OF_POINTS,
  normalizationFilters,
  withNormalizationFilters,
} from '../core/settings.ts';

import { FilterChainEditor } from './FilterChainEditor.tsx';
import { NumberField } from './NumberField.tsx';
import { ProblemList } from './ProblemList.tsx';
import { SettingsPart } from './SettingsPart.tsx';
import type { Zone } from './ZoneRows.tsx';
import { ZoneRows } from './ZoneRows.tsx';
import { problemsAbout } from './problemsAbout.ts';

/** What {@link NormalizationEditor} edits. */
export interface NormalizationEditorProps {
  /** What `new SpectraProcessor(…)` would be handed. */
  value: SpectraProcessorSettings;
  /** Called with the edited settings on every change. */
  onChange: (settings: SpectraProcessorSettings) => void;
  /** Every problem the whole settings object has; each part picks its own. */
  problems: readonly SettingsProblem[];
}

/**
 * The stage that brings every spectrum onto one x grid.
 *
 * It comes first because nothing downstream means anything until it is settled:
 * two spectra sampled on different x cannot be compared, subtracted or put in
 * one matrix. The order control is given a heading of its own because it is the
 * one switch that silently changes what every other number on this panel means.
 * @param props - See {@link NormalizationEditorProps}.
 * @returns The memory budget, the grid, the order, the excluded zones and the chain.
 */
export function NormalizationEditor(
  props: NormalizationEditorProps,
): ReactElement {
  const { value, onChange, problems } = props;
  const normalization: NormalizationSettings = value.normalization ?? {};
  const resampleFirst = normalization.applyRangeSelectionFirst === true;

  function write(patch: Partial<NormalizationSettings>): void {
    onChange({ ...value, normalization: { ...normalization, ...patch } });
  }

  return (
    <div style={STAGE_STYLE}>
      <SettingsPart
        title="Memory"
        summary="How much of the data as it was read is kept once it has been resampled."
      >
        <NumberField
          label="Budget (MB)"
          value={toMegabytes(value.maxMemory)}
          placeholder={String(toMegabytes(DEFAULT_MAX_MEMORY))}
          integer
          onChange={(megabytes) => {
            onChange(withMaxMemory(value, megabytes));
          }}
        />
        <Callout intent="warning" compact>
          Once the budget is passed the processor throws the original spectra
          away and keeps only what it has already resampled, so nothing below
          can be changed afterwards without loading the files again.
        </Callout>
        <ProblemList problems={problemsAbout(problems, 'Memory')} />
      </SettingsPart>

      <SettingsPart
        title="Resampling"
        summary="The x grid every spectrum is put on, which is what makes them comparable."
      >
        <div style={ROW_STYLE}>
          <NumberField
            label="From"
            value={normalization.from}
            placeholder="the first x"
            onChange={(from) => {
              write({ from });
            }}
          />
          <NumberField
            label="To"
            value={normalization.to}
            placeholder="the last x"
            onChange={(to) => {
              write({ to });
            }}
          />
          <NumberField
            label="Number of points"
            value={normalization.numberOfPoints}
            placeholder={String(DEFAULT_NUMBER_OF_POINTS)}
            integer
            onChange={(numberOfPoints) => {
              write({ numberOfPoints });
            }}
          />
        </div>
        <ProblemList problems={problemsAbout(problems, 'Resampling')} />
      </SettingsPart>

      <SettingsPart
        title="Order"
        summary="Whether the chain below runs before or after the grid above is applied."
      >
        <SegmentedControl
          size="small"
          value={resampleFirst ? 'resample-first' : 'filter-first'}
          options={ORDER_OPTIONS}
          onValueChange={(order) => {
            write({ applyRangeSelectionFirst: order === 'resample-first' });
          }}
        />
        <span style={HELP_STYLE}>{orderHelp(resampleFirst)}</span>
      </SettingsPart>

      <SettingsPart
        title="Excluded zones"
        summary="Stretches of x the grid skips, such as a solvent peak or a detector gap."
      >
        <ZoneRows
          label="Excluded zones"
          withIgnore
          value={normalization.exclusions ?? []}
          help="A zone is dropped from the grid; the points it would have held are shared out over the rest."
          onChange={(zones) => {
            write({ exclusions: asExclusions(zones) });
          }}
        />
        <ProblemList problems={problemsAbout(problems, 'Excluded zone')} />
      </SettingsPart>

      <SettingsPart
        title="Chain"
        summary="What each spectrum is put through on its own, step by step."
      >
        <FilterChainEditor
          value={normalizationFilters(value)}
          resampleFirst={resampleFirst}
          problems={problems}
          onChange={(chain) => {
            onChange(withNormalizationFilters(value, chain));
          }}
        />
      </SettingsPart>
    </div>
  );
}

/**
 * The budget as the box shows it, in the unit a reader thinks in.
 * @param bytes - What the settings hold.
 * @returns The same budget in megabytes, or undefined when none is set.
 */
function toMegabytes(bytes: number | undefined): number | undefined {
  return bytes === undefined ? undefined : bytes / BYTES_PER_MEGABYTE;
}

/**
 * The settings with a different budget, in bytes as the processor reads it.
 * @param settings - What the constructor would be handed.
 * @param megabytes - What was typed, or undefined when the box was emptied.
 * @returns A new settings object, without the key at all when nothing is set.
 */
function withMaxMemory(
  settings: SpectraProcessorSettings,
  megabytes: number | undefined,
): SpectraProcessorSettings {
  const next: SpectraProcessorSettings = { ...settings };
  if (megabytes === undefined) {
    delete next.maxMemory;
  } else {
    next.maxMemory = megabytes * BYTES_PER_MEGABYTE;
  }
  return next;
}

/**
 * The rows as the settings hold them.
 *
 * A row opens with neither bound typed, which upstream's type does not allow
 * and `settingsProblems` reports instead — the half-filled row has to survive
 * long enough for the reader to finish typing it.
 * @param zones - The rows as they were edited.
 * @returns The same rows, at the type the settings carry.
 */
function asExclusions(zones: readonly Zone[]): ExclusionZone[] {
  return zones as ExclusionZone[];
}

/**
 * Which x the range and the exclusions are read in, given the order.
 * @param resampleFirst - Whether the grid is applied before the chain runs.
 * @returns The line drawn under the order control.
 */
function orderHelp(resampleFirst: boolean): string {
  return resampleFirst
    ? 'The range and the excluded zones are read in the x the file holds, and the chain then runs on the resampled grid.'
    : 'The chain runs first, so the range and the excluded zones are read in the x the chain leaves behind — a step that moves the axis moves them with it.';
}

const BYTES_PER_MEGABYTE = 1024 * 1024;

const ORDER_OPTIONS = [
  { value: 'filter-first', label: 'Filter, then resample' },
  { value: 'resample-first', label: 'Resample, then filter' },
];

const STAGE_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
} as const satisfies CSSProperties;

const HELP_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;
