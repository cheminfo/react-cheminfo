/**
 * The two pieces of `ExerciseSeries` that are only layout: the heading row
 * with the length picker and the new-series button, and the numbered list of
 * questions.
 */

import { Button, HTMLSelect } from '@blueprintjs/core';
import type { ReactElement, ReactNode, RefObject } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { Attempt } from '../core/attempts.ts';
import type { ProgressRecords } from '../core/progress.ts';

import { ExerciseStatusIcon } from './ExerciseTags.tsx';
import { seriesCountOptions } from './seriesCounts.ts';

/** What {@link SeriesHead} needs. */
export interface SeriesHeadProps {
  /** The heading, or the chrome's word for it. */
  title: ReactNode | undefined;
  /** Id of the heading. */
  headingId: string;
  /** The length on screen. */
  count: number;
  /** The largest length the tool serves. */
  poolSize: number;
  /** The lengths offered beside the whole pool. */
  counts: readonly number[] | undefined;
  /** Change the length. */
  onCount: (count: number) => void;
  /** Draw another series. */
  onNewSeries: () => void;
}

/**
 * The heading row of a series.
 * @param props - See {@link SeriesHeadProps}.
 * @returns The row.
 */
export function SeriesHead(props: SeriesHeadProps): ReactElement {
  const { title, headingId, count, poolSize, counts, onCount, onNewSeries } =
    props;
  const t = useChromeT();
  return (
    <div className="exercise-series__head">
      <h2 className="exercise-series__title" id={headingId}>
        {title ?? t('pedagogy.questions')}
      </h2>
      <div className="exercise-series__controls">
        <HTMLSelect
          aria-label={t('pedagogy.questionsInSeries')}
          value={count}
          onChange={(event) => {
            onCount(Number(event.currentTarget.value));
          }}
          options={seriesCountOptions(poolSize, counts, t)}
        />
        <Button
          icon="refresh"
          text={t('pedagogy.newSeries')}
          title={t('pedagogy.newSeriesTitle')}
          onClick={onNewSeries}
        />
      </div>
    </div>
  );
}

/** What {@link SeriesQuestionList} needs. */
export interface SeriesQuestionListProps<Question> {
  /** The questions of the series, in order. */
  series: readonly Question[];
  /** The attempt key of each, in the same order. */
  keys: readonly string[];
  /** Every attempt kept. */
  records: ProgressRecords<Attempt>;
  /** The open one. */
  index: number;
  /** Open one. */
  onOpen: (index: number) => void;
  /** How a question is named. */
  label: (question: Question) => ReactNode;
  /** The ref the arrow keys scroll inside. */
  listRef: RefObject<HTMLElement | null>;
}

/**
 * The numbered list of a series, each question with its status.
 * @param props - See {@link SeriesQuestionListProps}.
 * @returns The list.
 */
export function SeriesQuestionList<Question>(
  props: SeriesQuestionListProps<Question>,
): ReactElement {
  const { series, keys, records, index, onOpen, label, listRef } = props;
  const t = useChromeT();
  return (
    <nav
      ref={listRef}
      className="exercise-series__list"
      aria-label={t('pedagogy.seriesQuestions')}
    >
      {series.map((entry, position) => {
        const key = keys[position] ?? '';
        return (
          <Button
            key={key}
            variant="minimal"
            alignText="start"
            fill
            active={position === index}
            data-selected={position === index ? 'true' : undefined}
            icon={
              <ExerciseStatusIcon status={records[key]?.status ?? 'idle'} />
            }
            onClick={() => {
              onOpen(position);
            }}
          >
            <span className="exercise-series__number">{position + 1}.</span>{' '}
            {label(entry)}
          </Button>
        );
      })}
    </nav>
  );
}
