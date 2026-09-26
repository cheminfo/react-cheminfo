import { Button, Callout } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { clamp } from '../../format/core/clamp.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

import { GlossaryText } from './GlossaryText.tsx';

/** What {@link HintLadder} needs. */
export interface HintLadderProps {
  /** Every hint of the exercise, ordered from a nudge to almost the answer. */
  hints: readonly string[];
  /**
   * How many the student has asked for. A count outside the ladder is read as
   * one of its ends, so a stored value from a shorter or longer ladder still
   * opens the page.
   */
  revealed: number;
  /**
   * Opens the next hint. Leave it out where the button lives elsewhere — in
   * `ExerciseActions`, say — and the ladder only shows what is already open.
   * @default undefined — no button
   */
  onReveal?: () => void;
  /**
   * Text of the button, before its count.
   * @default the chrome's own words for it, in the language of the page
   */
  revealLabel?: string;
  /**
   * Heading over the hints.
   * @default the chrome's own words for it, in the language of the page
   */
  title?: string;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * The hints asked for so far, and the button that opens the next one.
 *
 * One at a time, in order: a ladder that dumped all four at once is a solution
 * with extra steps. The prose goes through the glossary, so a hint may link its
 * jargon exactly like the statement above it.
 * @param props - The ladder, how much of it is open, and how to open more.
 * @returns The hints, or nothing while none is open and none can be.
 */
export function HintLadder(props: HintLadderProps): ReactElement | null {
  const { className, hints, revealed, onReveal, revealLabel, title } = props;
  const t = useChromeT();
  const open = clampRevealed(revealed, hints.length);
  const exhausted = open >= hints.length;
  if (open === 0 && (onReveal === undefined || hints.length === 0)) return null;

  return (
    <div className={className} style={ROOT_STYLE}>
      {onReveal !== undefined && hints.length > 0 && (
        <div>
          <Button
            icon="lightbulb"
            text={t('pedagogy.revealHintLadder', {
              label: revealLabel ?? t('pedagogy.revealHint'),
              open,
              total: hints.length,
            })}
            disabled={exhausted}
            onClick={onReveal}
          />
        </div>
      )}

      {open > 0 && (
        <Callout
          intent="primary"
          icon="lightbulb"
          title={title ?? t('pedagogy.hints')}
        >
          <ol style={LIST_STYLE}>
            {hints.slice(0, open).map((hint) => (
              <li key={hint} style={ITEM_STYLE}>
                <GlossaryText text={hint} />
              </li>
            ))}
          </ol>
        </Callout>
      )}
    </div>
  );
}

function clampRevealed(revealed: number, total: number): number {
  return Math.floor(clamp(revealed, 0, total));
}

const ROOT_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const LIST_STYLE: CSSProperties = { margin: 0, paddingLeft: 18 };

const ITEM_STYLE: CSSProperties = { lineHeight: 1.45 };
