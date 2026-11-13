import type { ReactElement, ReactNode } from 'react';
import { useCallback } from 'react';

import { formatBytes } from '../../format/core/units.ts';
import { useAsync } from '../../hooks/ui/useAsync.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { matchesNeedle } from '../../panel/core/textFilter.ts';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import {
  usePanelNeedle,
  usePanelTally,
} from '../../panel/ui/panelSearchContext.ts';
import type { Draft, DraftStore } from '../core/createDraftStore.ts';
import type { DocumentFile } from '../core/documentFile.ts';
import { DRAFT_LIMIT, isSavedAsIs } from '../core/draftFiles.ts';
import type { DraftSession } from '../core/draftSessionTypes.ts';
import { storageUsage } from '../core/persistentStorage.ts';

import { DraftRow } from './DraftRow.tsx';
import { FolderNoMatch } from './FolderSearch.tsx';
import { FolderSection } from './FolderSection.tsx';

/** Props of {@link DraftsSection}. */
export interface DraftsSectionProps<D> {
  /** Where the drafts are written. */
  store: DraftStore<D>;
  /** The site's draft session, which opens them. */
  session: DraftSession;
  /** Whether this browser keeps drafts; `undefined` until known. */
  available: boolean | undefined;
  /** The drafts' version, from the session's status: bumped on every change. */
  version: number;
  /** The draft on screen. */
  currentId: string | null;
  /** The document on screen, drawn in its row as it is now. */
  live: D;
  /**
   * The file the document on screen is kept in, so its row leaves the list
   * the moment it is saved, and says when it changed since.
   * @default the draft's own record, as last written
   */
  file?: DocumentFile<D> | null;
  /**
   * What a draft is called, and what the search finds it by: its file's name
   * when it was saved, else something read in the document.
   * @default the file's name, else "Untitled"
   */
  name?: (draft: Draft<D>, document: D) => string;
  /**
   * How the name is drawn, e.g. a formula through `<MF>`.
   * @default the name as text
   */
  renderName?: (name: string) => ReactNode;
  /**
   * A small picture of a draft, drawn at the start of its row.
   * @default undefined — the name alone
   */
  thumbnail?: (document: D) => ReactNode;
  /** Says what went wrong deleting one. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
}

/**
 * The work this browser keeps as it is done, so a reload or a crash loses
 * nothing: every document not saved anywhere, and every saved one changed
 * since. A saved document left as it is leaves the list, and the page keeps
 * the latest {@link DRAFT_LIMIT} by default. The rows are drawn grey with
 * "Not saved", so nobody takes a draft for a document kept on purpose.
 * @param props - See {@link DraftsSectionProps}.
 * @returns The section.
 */
export function DraftsSection<D>(props: DraftsSectionProps<D>): ReactElement {
  const { store, session, available, version, currentId, live, file } = props;
  const { name = defaultName, renderName, thumbnail, notify } = props;
  const t = useChromeT();
  const needle = usePanelNeedle();
  const load = useCallback(async () => {
    const [drafts, elsewhere, usage] = await Promise.all([
      store.list(),
      session.heldElsewhere(),
      storageUsage(),
    ]);
    return { drafts, elsewhere, usage };
  }, [store, session]);
  const listing = useAsync(load, version);
  const unsaved = (listing.data?.drafts ?? [])
    .map((draft) =>
      draft.id === currentId && file !== undefined
        ? withLiveFile(draft, file, live)
        : draft,
    )
    .filter((draft) => !isSavedAsIs(draft));
  const named = unsaved.map((draft) => {
    const document = draft.id === currentId ? live : draft.document;
    return {
      draft,
      document,
      label: name(draft, document) || t('drafts.untitled'),
    };
  });
  const shown = named.filter(({ label }) => matchesNeedle(needle, label));
  usePanelTally(shown.length, named.length);

  return (
    <FolderSection
      name="drafts"
      title={t('drafts.heading')}
      count={named.length}
    >
      {available === false ? (
        <PanelEmpty>{t('drafts.unavailable')}</PanelEmpty>
      ) : shown.length > 0 ? (
        <ul className="folder-panel__list">
          {shown.map(({ draft, document, label }) => (
            <DraftRow
              key={draft.id}
              draft={draft}
              label={renderName ? renderName(label) : label}
              thumbnail={thumbnail?.(document)}
              current={draft.id === currentId}
              elsewhere={listing.data?.elsewhere.has(draft.id) ?? false}
              onOpen={() => {
                void session.open(draft.id);
              }}
              onDelete={() => {
                void store.delete(draft.id).then(
                  () => {
                    session.changed();
                  },
                  () => {
                    notify(t('drafts.deleteFailed'), 'danger');
                  },
                );
              }}
            />
          ))}
        </ul>
      ) : needle !== '' && named.length > 0 ? (
        <FolderNoMatch />
      ) : (
        <PanelEmpty>{t('drafts.empty')}</PanelEmpty>
      )}
      {listing.data?.usage && unsaved.length > 0 ? (
        <p className="folder-panel__note">
          {t('drafts.usage', {
            size: formatBytes(listing.data.usage.usage),
            count: DRAFT_LIMIT,
          })}
        </p>
      ) : null}
    </FolderSection>
  );
}

function defaultName(draft: Draft<unknown>): string {
  return draft.file?.name ?? '';
}

// The draft on screen as it is now: its own record lags the document.
function withLiveFile<D>(
  draft: Draft<D>,
  file: DocumentFile<D> | null,
  live: D,
): Draft<D> {
  const { file: _recorded, ...rest } = draft;
  return file
    ? { ...rest, file: { name: file.name, modified: file.saved !== live } }
    : rest;
}
