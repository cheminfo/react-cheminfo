import { Alert, Button, ProgressBar } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { ProgressSummary } from '../core/progress.ts';

/** What {@link ExerciseProgressHeader} needs. */
export interface ExerciseProgressHeaderProps {
  /** Where the student stands, as `progressSummary` counted it. */
  summary: ProgressSummary;
  /**
   * Throws away every answer, every revealed hint and every solved exercise.
   * Guarded by a dialog the student has to confirm.
   * @default undefined — the header only reports, and offers no way to wipe
   */
  onClearAll?: () => void;
  /**
   * Text of the button that wipes the work.
   * @default the chrome's own words for it, in the language of the page
   */
  clearLabel?: string;
  /**
   * What the confirmation dialog says before the work is thrown away.
   * @default a sentence saying what is lost and that there is no undo
   */
  clearWarning?: ReactNode;
  /**
   * Whether the button is dead — there is nothing stored to wipe.
   * @default false
   */
  clearDisabled?: boolean;
  /**
   * Class the header carries, so a site can reach it from its stylesheet.
   * @default undefined
   */
  className?: string;
}

/**
 * How much of a set is solved, its bar, and the one way to wipe it.
 *
 * Wiping goes through a real dialog rather than `confirm()`: the button throws
 * away a week of somebody's work, and a native prompt is both unstyled and
 * dismissed by reflex.
 * @param props - The counts, and what clearing does.
 * @returns The header.
 */
export function ExerciseProgressHeader(
  props: ExerciseProgressHeaderProps,
): ReactElement {
  const {
    summary,
    onClearAll,
    clearLabel,
    clearWarning,
    clearDisabled = false,
    className,
  } = props;
  const t = useChromeT();
  const [confirming, setConfirming] = useState(false);
  const complete = summary.total > 0 && summary.solved === summary.total;

  return (
    <div className={className} style={ROOT_STYLE}>
      <div style={ROW_STYLE}>
        <span style={COUNT_STYLE}>
          {t('pedagogy.solvedCount', {
            solved: summary.solved,
            total: summary.total,
          })}
        </span>
        <span
          style={PERCENT_STYLE}
        >{`${Math.round(summary.ratio * 100)}%`}</span>
        {onClearAll !== undefined && (
          <Button
            size="small"
            variant="minimal"
            intent="danger"
            icon="trash"
            text={clearLabel ?? t('pedagogy.clearAll')}
            disabled={clearDisabled}
            onClick={() => {
              setConfirming(true);
            }}
          />
        )}
      </div>

      <ProgressBar
        animate={false}
        stripes={false}
        intent={complete ? 'success' : 'primary'}
        value={summary.ratio}
      />

      {onClearAll !== undefined && (
        <Alert
          isOpen={confirming}
          intent="danger"
          icon="trash"
          cancelButtonText={t('pedagogy.keepAnswers')}
          confirmButtonText={t('pedagogy.clearEverything')}
          onCancel={() => {
            setConfirming(false);
          }}
          onConfirm={() => {
            onClearAll();
            setConfirming(false);
          }}
        >
          {clearWarning ?? t('pedagogy.clearWarning')}
        </Alert>
      )}
    </div>
  );
}

const ROOT_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const COUNT_STYLE: CSSProperties = { fontWeight: 600 };

const PERCENT_STYLE: CSSProperties = {
  color: TOKEN.textMuted,
  flex: '1 1 auto',
  fontSize: 12,
};
