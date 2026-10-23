import { Tag } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import { useDocumentListNavigation } from '../../hooks/ui/useDocumentListNavigation.ts';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { ProgressRecords } from '../core/progress.ts';
import { progressSummary } from '../core/progress.ts';
import type { ExerciseLevel, ExerciseStatus } from '../core/types.ts';

import { ExerciseProgressHeader } from './ExerciseProgressHeader.tsx';
import { ExerciseLevelTag, ExerciseStatusIcon } from './ExerciseTags.tsx';
import { InlineText } from './InlineText.tsx';

/** What a row of the list reads off an exercise. */
export interface ExerciseListEntry {
  /** Stable id, which is what is selected. */
  id: string;
  /** How the exercise is named; may carry the shared prose marks. */
  title: string;
  /**
   * How hard it is, drawn as a coloured tag.
   * @default undefined — no level tag
   */
  level?: ExerciseLevel;
}

/** What the list reads of the progress kept on one exercise. */
export interface ExerciseListProgress {
  /** Where the student stands. */
  status: ExerciseStatus;
  /** How many hints were opened. */
  hintsRevealed: number;
}

/** What {@link ExerciseList} needs. */
export interface ExerciseListProps<TExercise extends ExerciseListEntry> {
  /** The exercises, in the order they are worked through. */
  exercises: readonly TExercise[];
  /** The progress kept, by exercise id; an absent one reads as untouched. */
  progress: ProgressRecords<ExerciseListProgress>;
  /** The exercise on screen, or `null` for none. */
  activeId: string | null;
  /** Called with the id of the exercise to open. */
  onSelect: (id: string) => void;
  /**
   * Tags of the tool's own after the level — the kind of question, say.
   * @default undefined
   */
  tags?: (exercise: TExercise) => ReactNode;
  /**
   * Draws the title the tool's own way.
   * @default the title as inline prose, its marks drawn
   */
  renderTitle?: (exercise: TExercise) => ReactNode;
  /**
   * Whether the bar of solved exercises heads the list.
   * @default true
   */
  progressHeader?: boolean;
  /**
   * Throws away every answer, behind a dialog. Without it the header only
   * reports.
   * @default undefined
   */
  onClearAll?: () => void;
  /**
   * What the dialog says before the work is thrown away.
   * @default the header's own sentence
   */
  clearWarning?: ReactNode;
  /**
   * What a screen reader calls the list.
   * @default the chrome's own word for it, in the language of the page
   */
  label?: string;
  /**
   * Class the list carries, in addition to `exercise-list`.
   * @default undefined
   */
  className?: string;
}

const STATUS_TITLE: Record<ExerciseStatus, ChromeKey> = {
  idle: 'pedagogy.statusIdle',
  attempted: 'pedagogy.statusAttempted',
  solved: 'pedagogy.statusSolved',
};

/**
 * The exercises of a set, each with where the student stands on it, under the
 * bar of how many are solved.
 *
 * The hint count of a solved exercise is shown rather than hidden: it is the
 * honest record of which ones were hard, which is what a student coming back a
 * week later wants to know. `ArrowUp` and `ArrowDown` walk the list from
 * anywhere on the page, unless a text field has the focus.
 * @param props - The exercises, their progress, and the open one.
 * @returns The list.
 */
export function ExerciseList<TExercise extends ExerciseListEntry>(
  props: ExerciseListProps<TExercise>,
): ReactElement {
  const {
    exercises,
    progress,
    activeId,
    onSelect,
    tags,
    renderTitle,
    progressHeader = true,
    onClearAll,
    clearWarning,
    label,
    className,
  } = props;
  const t = useChromeT();
  const activeIndex = exercises.findIndex(
    (exercise) => exercise.id === activeId,
  );
  const listRef = useDocumentListNavigation<HTMLDivElement>({
    length: exercises.length,
    selectedIndex: activeIndex,
    onSelect: (index) => {
      const next = exercises[index];
      if (next !== undefined) onSelect(next.id);
    },
  });

  return (
    <div className={joinClassNames('exercise-list', className)}>
      {progressHeader ? (
        <ExerciseProgressHeader
          summary={progressSummary(
            progress,
            exercises.map((exercise) => exercise.id),
          )}
          onClearAll={onClearAll}
          clearWarning={clearWarning}
          clearDisabled={Object.keys(progress).length === 0}
        />
      ) : null}
      <div
        ref={listRef}
        className="exercise-list__rows"
        role="listbox"
        aria-label={label ?? t('pedagogy.exercises')}
        data-testid="exercise-list"
      >
        {exercises.map((exercise) => {
          const record = progress[exercise.id];
          const status = record?.status ?? 'idle';
          const hints = record?.hintsRevealed ?? 0;
          const active = exercise.id === activeId;
          return (
            <button
              key={exercise.id}
              type="button"
              role="option"
              aria-selected={active}
              data-selected={active ? 'true' : undefined}
              className={
                active
                  ? 'exercise-list__item exercise-list__item--active'
                  : 'exercise-list__item'
              }
              onClick={() => {
                onSelect(exercise.id);
              }}
            >
              <ExerciseStatusIcon
                status={status}
                title={t(STATUS_TITLE[status])}
              />
              <span className="exercise-list__title">
                {renderTitle === undefined ? (
                  <InlineText text={exercise.title} />
                ) : (
                  renderTitle(exercise)
                )}
              </span>
              <span className="exercise-list__tags">
                {exercise.level === undefined ? null : (
                  <ExerciseLevelTag level={exercise.level} active={active} />
                )}
                {tags?.(exercise)}
                {status === 'solved' && hints > 0 ? (
                  <Tag minimal round intent="success">
                    {hints === 1
                      ? t('pedagogy.solvedWithOneHint')
                      : t('pedagogy.solvedWithHints', { count: hints })}
                  </Tag>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
