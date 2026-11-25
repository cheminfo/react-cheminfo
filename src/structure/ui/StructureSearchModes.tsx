import { HTMLSelect } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { Fragment, useId } from 'react';

import { formatPercent } from '../../format/core/numbers.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { StructureSearchMode } from '../core/structureSearch.ts';
import { similarityThresholds } from '../core/structureSearch.ts';

import { useStructureSearchModes } from './useStructureSearchModes.ts';

/** What {@link StructureSearchModes} needs. */
export interface StructureSearchModesProps {
  /** The modes offered, in order. */
  modes: readonly StructureSearchMode[];
  /** The mode the question is asked in now, which its button shows. */
  current: StructureSearchMode;
  /** The least similarity a similarity search asks for. */
  threshold: number;
  /** The thresholds offered; the current one is added when absent. */
  thresholds: readonly number[];
  /** Keep another least similarity. */
  onThreshold: (threshold: number) => void;
  /** Search the drawing in this mode. */
  onSearch: (mode: StructureSearchMode) => void;
  /** More controls under the threshold, such as a fingerprint. */
  similarityControls: ReactNode;
  /** An example is being read into the canvas: no search until it is. */
  isBusy: boolean;
}

/**
 * One large button per mode, its name in bold over what it finds; a click
 * searches the drawing in that mode. The least similarity sits under the
 * similarity button, so it is set before that button is pressed.
 * @param props - See {@link StructureSearchModesProps}.
 * @returns The column of modes.
 */
export function StructureSearchModes(
  props: StructureSearchModesProps,
): ReactElement {
  const {
    modes,
    current,
    threshold,
    thresholds,
    onThreshold,
    onSearch,
    similarityControls,
    isBusy,
  } = props;
  const t = useChromeT();
  const labels = useStructureSearchModes(modes);
  const id = useId();
  const thresholdOptions: Array<{ value: number; label: string }> = [];
  for (const value of similarityThresholds(threshold, thresholds)) {
    thresholdOptions.push({
      value,
      label: t('structure.search.thresholdOption', {
        percent: formatPercent(value, 0),
      }),
    });
  }
  const entries: ReactNode[] = [];
  for (const option of labels) {
    entries.push(
      <Fragment key={option.mode}>
        <button
          type="button"
          className="structure-search__mode"
          aria-labelledby={`${id}-${option.mode}`}
          aria-describedby={`${id}-${option.mode}-help`}
          aria-current={option.mode === current ? 'true' : undefined}
          disabled={isBusy}
          onClick={() => onSearch(option.mode)}
        >
          <b id={`${id}-${option.mode}`}>{option.label}</b>
          <span id={`${id}-${option.mode}-help`}>{option.help}</span>
        </button>
        {option.mode === 'similarity' && (
          <div className="structure-search__similarity">
            <span className="structure-search__label">
              {t('structure.search.threshold')}
            </span>
            <HTMLSelect
              minimal
              value={threshold}
              aria-label={t('structure.search.threshold')}
              title={t('structure.search.thresholdHelp')}
              options={thresholdOptions}
              onChange={(event) =>
                onThreshold(Number(event.currentTarget.value))
              }
            />
            {similarityControls}
          </div>
        )}
      </Fragment>,
    );
  }
  return (
    <div
      className="structure-search__modes"
      role="group"
      aria-labelledby={`${id}-title`}
    >
      <span id={`${id}-title`} className="structure-search__label">
        {t('structure.search.modes')}
      </span>
      {entries}
    </div>
  );
}
