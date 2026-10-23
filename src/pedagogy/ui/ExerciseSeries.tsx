import type { ReactElement, ReactNode } from 'react';
import { useEffect, useEffectEvent, useMemo, useState } from 'react';

import { useDocumentListNavigation } from '../../hooks/ui/useDocumentListNavigation.ts';
import type { SplitRange } from '../../split/core/split.ts';
import { clampSplit } from '../../split/core/split.ts';
import { SplitRow } from '../../split/ui/SplitRow.tsx';
import type { AttemptStore } from '../core/attempts.ts';
import { attemptKey } from '../core/attempts.ts';
import { progressSummary } from '../core/progress.ts';
import type { PickSeededOptions, SeedRange } from '../core/seed.ts';
import { freshSeed, pickSeeded } from '../core/seed.ts';
import type { SeriesTool } from '../core/series.ts';

import { ExerciseProgressHeader } from './ExerciseProgressHeader.tsx';
import type { QuestionRendering } from './QuestionCard.tsx';
import { QuestionCard } from './QuestionCard.tsx';
import { SeriesHead, SeriesQuestionList } from './seriesParts.tsx';
import { useAttemptRecords } from './useAttemptRecords.ts';

/** What {@link ExerciseSeries} needs. */
export interface ExerciseSeriesProps<
  Question,
> extends QuestionRendering<Question> {
  /** The tool the series is drawn from. */
  tool: SeriesTool<Question>;
  /** Where the attempts, and the series each tool was last on, are kept. */
  store: AttemptStore;
  /** How a question is named in the list beside the card. */
  label: (question: Question) => ReactNode;
  /**
   * The seed the address names, read with `parseSeed`, or `null` when it names
   * none — the series this browser was last on is then written into it.
   */
  seed: number | null;
  /**
   * Write a seed into the address: `replace` when the page adopts one it was
   * opened without, `push` when the student draws a new series, so Back
   * returns to the previous one.
   */
  onSeed: (seed: number, history: 'replace' | 'push') => void;
  /** How many questions the student asked for; the pool caps it. */
  count: number;
  /** Change how many questions the series holds. */
  onCount: (count: number) => void;
  /**
   * The lengths offered, beside the whole pool.
   * @default [5, 10, 15, 20]
   */
  counts?: readonly number[];
  /**
   * The share of the row the list takes, as the address names it, or `null`
   * for {@link ExerciseSeriesProps.defaultSplit}.
   */
  split: number | null;
  /** Write the share a drag came to rest at, or `null` for the default. */
  onSplit: (split: number | null) => void;
  /**
   * The share the list opens at: the card is the figure, so the list opens
   * narrow.
   * @default 22
   */
  defaultSplit?: number;
  /**
   * How far the list may be dragged, measured on the labels of the pool.
   * @default { min: 15, max: 26 }
   */
  splitRange?: SplitRange;
  /**
   * The narrowest row still divided, in pixels; under it the list stacks under
   * the card's row, as on a tablet held upright.
   * @default SplitRow's own, 860
   */
  stackBelow?: number;
  /**
   * How the series is drawn from the pool, for a site whose links were written
   * with the other generator call.
   * @default { draw: 'getFloat', wrap: false }
   */
  pick?: PickSeededOptions;
  /**
   * The seeds a new series is drawn from.
   * @default every unsigned 32-bit integer
   */
  seedRange?: SeedRange;
  /**
   * The heading over the series.
   * @default the chrome's own word for it, in the language of the page
   */
  title?: ReactNode;
  /**
   * Id of the heading, for a section labelled by it.
   * @default 'questions-heading'
   */
  headingId?: string;
}

const DEFAULT_RANGE: SplitRange = { min: 15, max: 26 };

/**
 * A graded series drawn from a tool's pool: the list of its questions, the one
 * open, and the progress over the series.
 *
 * The series is its seed, and the seed is in the address, so the link on
 * screen reopens the same questions for anyone — a teacher hands one series to
 * a whole class. How the row is divided between the list and the open question
 * travels in the address too. The component reads neither: the page hands it
 * the seed, the length and the share, and is told when one changes.
 * @param props - The tool, where its attempts are kept, the address values,
 * and how to draw a question.
 * @returns The series.
 */
export function ExerciseSeries<Question>(
  props: ExerciseSeriesProps<Question>,
): ReactElement {
  const {
    tool,
    store,
    label,
    seed: addressSeed,
    onSeed,
    count: wanted,
    onCount,
    counts,
    split,
    onSplit,
    defaultSplit = 22,
    splitRange = DEFAULT_RANGE,
    stackBelow,
    pick,
    seedRange,
    title,
    headingId = 'questions-heading',
    ...rendering
  } = props;
  const records = useAttemptRecords(store);
  const [fallbackSeed] = useState(
    () => store.storedSeed(tool.id) ?? freshSeed(seedRange),
  );
  const seed = addressSeed ?? fallbackSeed;
  const poolSize = tool.maxCount ?? tool.pool.length;
  const count = Math.min(wanted, poolSize);

  // The address is what the series is read from and handed out as, so a page
  // opened without a seed writes the one it fell back on into it; and the
  // series on screen is the one this tool reopens on the next visit.
  const followSeed = useEffectEvent((): void => {
    if (addressSeed === null) onSeed(fallbackSeed, 'replace');
    store.storeSeed(tool.id, addressSeed ?? fallbackSeed);
  });
  useEffect(() => {
    followSeed();
  }, [seed, addressSeed, tool.id]);

  const series = useMemo(
    () =>
      tool.draw === undefined
        ? pickSeeded(tool.pool, count, seed, pick)
        : tool.draw(count, seed),
    [tool, count, seed, pick],
  );
  const keys = useMemo(
    () =>
      series.map((question) => attemptKey(tool.id, seed, tool.key(question))),
    [series, tool, seed],
  );

  const [opened, setOpened] = useState({ seed, index: 0 });
  const index =
    opened.seed === seed ? Math.min(opened.index, series.length - 1) : 0;
  function open(next: number): void {
    setOpened({ seed, index: next });
  }
  const listRef = useDocumentListNavigation<HTMLElement>({
    length: series.length,
    selectedIndex: index,
    onSelect: open,
  });

  const summary = progressSummary(records, keys);
  const question = series[index];
  const storageKey = keys[index];

  return (
    <div className="exercise-series">
      <SeriesHead
        title={title}
        headingId={headingId}
        count={count}
        poolSize={poolSize}
        counts={counts}
        onCount={onCount}
        onNewSeries={() => {
          const next = freshSeed(seedRange);
          store.forgetOtherSeries(tool.id, next);
          onSeed(next, 'push');
        }}
      />

      <ExerciseProgressHeader
        summary={summary}
        onClearAll={() => {
          store.clearAttempts(keys);
        }}
        clearDisabled={!keys.some((key) => records[key] !== undefined)}
      />

      <SplitRow
        ratio={split === null ? null : clampSplit(split, splitRange)}
        defaultRatio={defaultSplit}
        min={splitRange.min}
        max={splitRange.max}
        stackBelow={stackBelow}
        onRatio={onSplit}
        start={
          <SeriesQuestionList
            series={series}
            keys={keys}
            records={records}
            index={index}
            onOpen={open}
            label={label}
            listRef={listRef}
          />
        }
        end={
          question === undefined || storageKey === undefined ? null : (
            <QuestionCard
              key={storageKey}
              tool={tool}
              question={question}
              store={store}
              storageKey={storageKey}
              number={index + 1}
              total={series.length}
              onNext={
                index + 1 < series.length
                  ? () => {
                      open(index + 1);
                    }
                  : undefined
              }
              {...rendering}
            />
          )
        }
      />
    </div>
  );
}
