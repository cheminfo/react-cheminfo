import { Button, Icon } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useCallback } from 'react';

import { useAsync } from '../../hooks/ui/useAsync.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { DocumentFile } from '../core/documentFile.ts';
import type { DocumentPlace } from '../core/documentPlace.ts';
import { documentPlace, placeKind } from '../core/documentPlace.ts';
import type { DocumentSaver } from '../core/documentSaverTypes.ts';
import { canPickFolders } from '../core/fileAccess.ts';

import { PLACE_ICONS } from './placeIcons.ts';
import { moveMessage, placeDetail, placeSummary } from './placeMessages.ts';
import { useFolderVersion } from './useFolderLabel.ts';
import { useSaveInPlace } from './useSaveInPlace.tsx';

/** Props of {@link DocumentPlaceLine}. */
export interface DocumentPlaceLineProps<D> {
  /** The site's saver. */
  saver: DocumentSaver<D>;
  /**
   * Where the document on screen is kept, read from the saver's `file` cell
   * while the site renders, so the line follows every save.
   */
  file: DocumentFile<D> | null;
  /**
   * The document on screen, compared with the one last saved to say that it
   * changed since.
   */
  live: D | undefined;
  /**
   * What a document never saved is called, e.g. its title.
   * @default "Untitled"
   */
  untitled?: ReactNode;
  /** Says what a save or a move did. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
  /**
   * The icon and the name alone, the place said on hover: for a status line.
   * @default false
   */
  compact?: boolean;
}

/**
 * Where the document on screen is: its name, then on this computer — in
 * which folder — in this browser only, or not saved yet, with the same icon
 * the folder panel gives that place. Hovering says it in full. A document
 * kept only in this browser offers to move it to this computer, and one not
 * saved anywhere to save it there.
 * @param props - See {@link DocumentPlaceLineProps}.
 * @returns The line.
 */
export function DocumentPlaceLine<D>(
  props: DocumentPlaceLineProps<D>,
): ReactElement {
  const { saver, file, live, untitled, notify, compact = false } = props;
  const t = useChromeT();
  const version = useFolderVersion(saver.folder);
  const load = useCallback(
    () => documentPlace(file, saver.folder),
    [file, saver.folder],
  );
  const place: DocumentPlace = useAsync(load, version).data ?? DRAFT;
  const inPlace = useSaveInPlace(saver, notify);
  const kind = placeKind(place);
  const changed = file !== null && live !== undefined && file.saved !== live;
  const name =
    place.kind === 'draft' ? (untitled ?? t('drafts.untitled')) : place.name;
  const detail = changed
    ? `${placeDetail(place, t)} ${t('place.changedDetail')}`
    : placeDetail(place, t);
  const savedId = file?.savedId;

  function move(): void {
    if (savedId === undefined) return;
    void saver.moveToFolder([savedId]).then((outcome) => {
      const message = moveMessage(outcome, t);
      if (message) notify(message.text, message.intent);
    });
  }

  const action =
    compact || !canPickFolders() ? null : savedId !== undefined ? (
      <PlaceAction text={t('place.moveToComputer')} onClick={move} />
    ) : place.kind === 'draft' || place.kind === 'download' ? (
      <PlaceAction
        text={t('place.saveOnComputer')}
        onClick={inPlace.askFolder}
      />
    ) : null;

  return (
    <div
      className={`document-place document-place--${kind}${compact ? ' document-place--compact' : ''}`}
      title={detail}
      data-place={place.kind}
    >
      <Icon
        icon={PLACE_ICONS[kind]}
        className="document-place__icon"
        aria-label={placeSummary(place, t)}
      />
      <span className="document-place__text">
        <span className="document-place__name">{name}</span>
        {compact ? null : (
          <span className="document-place__where">
            {placeSummary(place, t)}
            {changed ? (
              <span className="document-place__changed">
                {t('drafts.unsavedChanges')}
              </span>
            ) : null}
          </span>
        )}
        {action}
      </span>
      {compact && changed ? (
        <span
          className="document-place__dot"
          aria-label={t('drafts.unsavedChanges')}
        />
      ) : null}
      {inPlace.dialog}
    </div>
  );
}

const DRAFT: DocumentPlace = { kind: 'draft' };

function PlaceAction(props: {
  text: string;
  onClick: () => void;
}): ReactElement {
  return (
    <Button
      size="small"
      variant="minimal"
      className="document-place__action no-print"
      text={props.text}
      onClick={props.onClick}
    />
  );
}
