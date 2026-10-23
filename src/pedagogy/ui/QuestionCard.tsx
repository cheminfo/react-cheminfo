import { Button, Callout, Tag } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { useIsHidden } from '../../share/ui/hiddenParts.ts';
import type { AttemptStore } from '../core/attempts.ts';
import { emptyAttempt } from '../core/attempts.ts';
import type { Answers, FieldCase, SeriesTool } from '../core/series.ts';

import { AnswerFields } from './AnswerFields.tsx';
import { ExerciseActions } from './ExerciseActions.tsx';
import { GlossaryText } from './GlossaryText.tsx';
import { HintLadder } from './HintLadder.tsx';
import { TestCaseList } from './TestCaseList.tsx';
import { LEVEL_INTENT } from './exerciseMeta.ts';
import { useAttemptRecords } from './useAttemptRecords.ts';

/** What a tool's own answer input is handed. */
export interface AnswerInputProps<Question> {
  /** The question being answered. */
  question: Question;
  /** What is typed so far, field by field. */
  answers: Answers;
  /** Change one field. */
  onChange: (key: string, value: string) => void;
  /** Check the answer, as Enter does in a box. */
  onSubmit: () => void;
}

/** How one tool draws the parts of a question the card does not know. */
export interface QuestionRendering<Question> {
  /** The statement of the question. */
  prompt: (question: Question) => ReactNode;
  /**
   * An input of the tool's own — a drawing canvas, a reaction to balance — in
   * place of the typed boxes.
   * @default undefined — one box per field of the tool
   */
  answer?: (props: AnswerInputProps<Question>) => ReactNode;
  /**
   * What the solution shows beyond its text, such as a drawn structure.
   * @default undefined
   */
  solution?: (question: Question) => ReactNode;
}

/** What {@link QuestionCard} needs. */
export interface QuestionCardProps<
  Question,
> extends QuestionRendering<Question> {
  /** The tool the question belongs to. */
  tool: SeriesTool<Question>;
  /** The question on the card. */
  question: Question;
  /** Where the attempts are kept. */
  store: AttemptStore;
  /** The key this question's attempt is kept under, from `attemptKey`. */
  storageKey: string;
  /** Its position in the series, counted from 1. */
  number: number;
  /** How many questions the series holds. */
  total: number;
  /**
   * Open the next question; left out on the last one.
   * @default undefined
   */
  onNext?: () => void;
}

/**
 * One question: its statement, the answer, the four actions, and — once
 * checked — the verdict case by case, the hints taken and the solution.
 *
 * The answer is graded on every change, but the verdict is shown only for the
 * answer as it was checked: a numeric answer that turned green as it was typed
 * could be found by trying numbers. A link that hides the `solutions` part
 * takes the solution button away.
 * @param props - The tool, the question, where its attempt is kept, and how to
 * draw it.
 * @returns The card.
 */
export function QuestionCard<Question>(
  props: QuestionCardProps<Question>,
): ReactElement {
  const {
    tool,
    question,
    store,
    storageKey,
    number,
    total,
    onNext,
    prompt,
    answer,
    solution,
  } = props;
  const t = useChromeT();
  const isHidden = useIsHidden();
  const records = useAttemptRecords(store);
  const {
    answers,
    checked: checkedAnswers,
    hintsRevealed,
    showSolution,
  } = records[storageKey] ?? emptyAttempt();
  const check = useMemo(
    () => tool.grade(question, answers),
    [tool, question, answers],
  );
  const hints = useMemo(() => tool.hints(question), [tool, question]);
  const snapshot = JSON.stringify(answers);
  const checked = checkedAnswers === snapshot;
  const solutionsHidden = isHidden('solutions');
  const level = tool.level?.(question);

  function setAnswer(key: string, value: string): void {
    store.updateAttempt(storageKey, { answers: { ...answers, [key]: value } });
  }

  function commit(): void {
    store.updateAttempt(storageKey, {
      status: check.passed ? 'solved' : 'attempted',
      checked: snapshot,
    });
  }

  return (
    <article
      className="series-question"
      aria-label={t('pedagogy.questionNumber', { number })}
    >
      <div className="series-question__meta">
        <span>{t('pedagogy.questionOf', { number, total })}</span>
        {level === undefined ? null : (
          <Tag minimal intent={LEVEL_INTENT[level]}>
            {level}
          </Tag>
        )}
      </div>
      <div className="series-question__prompt">{prompt(question)}</div>

      {answer ? (
        answer({ question, answers, onChange: setAnswer, onSubmit: commit })
      ) : (
        <AnswerFields
          fields={tool.fields(question)}
          answers={answers}
          onChange={setAnswer}
          onSubmit={commit}
        />
      )}

      <ExerciseActions
        onCheck={commit}
        checkDisabled={isBlank(answers)}
        onRevealHint={() => {
          store.updateAttempt(storageKey, {
            hintsRevealed: Math.min(hintsRevealed + 1, hints.length),
          });
        }}
        hintsRevealed={hintsRevealed}
        hintCount={hints.length}
        onToggleSolution={
          solutionsHidden
            ? undefined
            : () => {
                store.updateAttempt(storageKey, {
                  showSolution: !showSolution,
                });
              }
        }
        showSolution={showSolution}
        onReset={() => {
          store.updateAttempt(storageKey, emptyAttempt());
        }}
      />

      {checked ? (
        <TestCaseList<FieldCase>
          results={check.cases}
          label={(verdict) => verdict.label}
        />
      ) : null}

      {checked && check.passed ? (
        <Callout
          intent="success"
          icon="tick-circle"
          title={t('pedagogy.solved')}
        >
          {hintsRevealed > 0
            ? t('pedagogy.solvedWithHintsOf', {
                revealed: hintsRevealed,
                total: hints.length,
              })
            : t('pedagogy.solvedWithoutHint')}
          {onNext ? (
            <Button
              className="series-question__next"
              intent="success"
              endIcon="arrow-right"
              text={t('pedagogy.nextQuestion')}
              onClick={onNext}
            />
          ) : null}
        </Callout>
      ) : null}

      {hintsRevealed > 0 ? (
        <HintLadder hints={hints} revealed={hintsRevealed} />
      ) : null}

      {showSolution && !solutionsHidden ? (
        <Callout intent="warning" icon="key" title={t('pedagogy.solution')}>
          <p className="series-question__solution">
            <GlossaryText text={tool.solution(question)} />
          </p>
          {solution?.(question)}
        </Callout>
      ) : null}
    </article>
  );
}

function isBlank(answers: Answers): boolean {
  for (const value of Object.values(answers)) {
    if (value.trim() !== '') return false;
  }
  return true;
}
