import type { SaveOutcome } from '../core/documentSaverTypes.ts';

/** What a save said, for the site's status bar or toast. */
export interface SaveMessage {
  /** The sentence. */
  text: string;
  /** Whether it reports a success or a failure. */
  intent?: 'success' | 'danger';
}

/**
 * The sentence a save outcome is reported with.
 * @param outcome - What the save did.
 * @param t - The chrome's translator.
 * @returns The sentence, or `undefined` for an outcome that says nothing:
 * a choice or a name still to ask, a save cancelled.
 */
export function saveMessage(
  outcome: SaveOutcome,
  t: (key: string, values?: Record<string, string>) => string,
): SaveMessage | undefined {
  if (outcome.kind === 'empty') return { text: t('saving.empty') };
  if (outcome.kind === 'failed') {
    const { name, message } = outcome;
    return { text: t('saving.failed', { name, message }), intent: 'danger' };
  }
  if (outcome.kind !== 'saved') return undefined;
  const { name, wanted, target } = outcome;
  if (wanted !== undefined) {
    return {
      text: t('saving.savedRenamed', { name, wanted }),
      intent: 'success',
    };
  }
  if (target === 'browser') {
    return { text: t('saving.savedBrowser', { name }), intent: 'success' };
  }
  if (target === 'download') {
    return { text: t('saving.downloaded', { name }), intent: 'success' };
  }
  return { text: t('saving.saved', { name }), intent: 'success' };
}

/**
 * How a folder is named to a reader: the chosen folder, then the folders
 * open inside it.
 * @param root - The chosen folder's name.
 * @param path - The folders open inside it.
 * @returns E.g. `Chemistry course › Week 3`.
 */
export function folderPathLabel(root: string, path: readonly string[]): string {
  return [root, ...path].join(' › ');
}
