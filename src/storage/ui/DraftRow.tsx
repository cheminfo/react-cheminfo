import { Tag } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import { ConfirmButton } from '../../confirm/ui/ConfirmButton.tsx';
import { formatRelativeTime } from '../../format/core/relativeTime.ts';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { Draft } from '../core/createDraftStore.ts';

/**
 * One draft: drawn grey, with what it is — kept nowhere else, or a saved
 * document changed since — then when. A click shows it; the bin forgets it.
 * @param props - What it shows.
 * @param props.draft - The draft.
 * @param props.label - Its name, drawn.
 * @param props.thumbnail - Its picture.
 * @param props.current - Whether it is on screen.
 * @param props.elsewhere - Whether another tab holds it.
 * @param props.onOpen - Shows it.
 * @param props.onDelete - Forgets it.
 * @returns The row.
 */
export function DraftRow<D>(props: {
  draft: Draft<D>;
  label: ReactNode;
  thumbnail: ReactNode;
  current: boolean;
  elsewhere: boolean;
  onOpen: () => void;
  onDelete: () => void;
}): ReactElement {
  const { draft, label, thumbnail, current, elsewhere, onOpen, onDelete } =
    props;
  const t = useChromeT();
  const language = useLanguage();
  return (
    <li className="folder-panel__item">
      <button
        type="button"
        className="folder-panel__open folder-panel__open--draft"
        aria-current={current ? 'true' : undefined}
        disabled={elsewhere}
        title={
          elsewhere
            ? t('drafts.otherTabTooltip')
            : current
              ? t('drafts.onScreenTooltip')
              : t('drafts.openTooltip')
        }
        onClick={onOpen}
      >
        {thumbnail}
        <span className="folder-panel__text">
          <span className="folder-panel__name">{label}</span>
          <span className="folder-panel__time">
            <span className="folder-panel__draft-status">
              {draft.file ? t('drafts.unsavedChanges') : t('drafts.notSaved')}
            </span>
            {current
              ? t('documents.onScreen')
              : formatRelativeTime(draft.updatedAt, { locale: language })}
          </span>
        </span>
        {elsewhere ? <Tag minimal>{t('drafts.otherTab')}</Tag> : null}
      </button>
      {current || elsewhere ? null : (
        <ConfirmButton
          variant="minimal"
          size="small"
          icon="trash"
          className="no-print"
          aria-label={t('drafts.delete')}
          question={t('drafts.deleteQuestion')}
          onConfirm={onDelete}
        />
      )}
    </li>
  );
}
