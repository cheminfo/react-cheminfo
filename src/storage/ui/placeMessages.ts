import type { DocumentPlace } from '../core/documentPlace.ts';
import type { MoveOutcome } from '../core/moveToFolder.ts';

import type { SaveMessage } from './saveMessages.ts';
import { folderPathLabel } from './saveMessages.ts';

type Translate = (key: string, values?: Record<string, string>) => string;

/**
 * Where a document is, in a few words: what the line under its name says.
 * @param place - The place.
 * @param t - The chrome's translator.
 * @returns E.g. `On this computer · Chemistry course › Week 3`.
 */
export function placeSummary(place: DocumentPlace, t: Translate): string {
  switch (place.kind) {
    case 'draft':
      return t('place.draft');
    case 'browser':
      return t('place.browser');
    case 'folder':
      return t('place.inFolder', {
        folder: pathLabel(place.folder),
      });
    case 'file':
      return t('place.computer');
    case 'download':
      return t('place.download');
    default:
      return '';
  }
}

/**
 * Where a document is, said in full: what its tooltip reads.
 * @param place - The place.
 * @param t - The chrome's translator.
 * @returns The sentences.
 */
export function placeDetail(place: DocumentPlace, t: Translate): string {
  switch (place.kind) {
    case 'draft':
      return t('place.draftDetail');
    case 'browser':
      return t('place.browserDetail', { name: place.name });
    case 'folder':
      return `${t('place.folderDetail', {
        name: place.name,
        folder: pathLabel(place.folder),
      })} ${t('place.pathNote')}`;
    case 'file':
      return `${t('place.fileDetail', { name: place.name })} ${t('place.pathNote')}`;
    case 'download':
      return t('place.downloadDetail', { name: place.name });
    default:
      return '';
  }
}

/**
 * The sentence a move out of this browser is reported with.
 * @param outcome - What the move did.
 * @param t - The chrome's translator.
 * @returns The sentence, or `undefined` when the visitor cancelled.
 */
export function moveMessage(
  outcome: MoveOutcome,
  t: Translate,
): SaveMessage | undefined {
  if (outcome.kind === 'cancelled') return undefined;
  if (outcome.kind === 'unavailable') {
    return { text: t('documents.saveInFolderUnavailable'), intent: 'danger' };
  }
  if (outcome.kind === 'failed') {
    const { name, message, missingFolder } = outcome;
    const text =
      missingFolder === undefined
        ? t('place.moveFailed', { name, message })
        : t('folder.gone', { folder: missingFolder });
    return { text, intent: 'danger' };
  }
  return {
    text: t('place.moved', {
      count: String(outcome.count),
      folder: pathLabel(outcome.folder),
    }),
    intent: 'success',
  };
}

function pathLabel(folders: readonly string[]): string {
  return folderPathLabel(folders[0] ?? '', folders.slice(1));
}
