import { formatRelativeTime } from '../../format/core/relativeTime.ts';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { MessageValues } from '../../i18n/core/messageValues.ts';

import { createAutosave } from './createAutosave.ts';
import type { Draft } from './createDraftStore.ts';
import { createRestoreGuard } from './createRestoreGuard.ts';
import { createTabClaims } from './createTabClaims.ts';
import type { DocumentFile } from './documentFile.ts';
import type { KeptDraft as Kept } from './draftFiles.ts';
import {
  DRAFT_LIMIT,
  afterPaint,
  documentFile,
  draftFile,
  tidyDrafts,
} from './draftFiles.ts';
import type { DraftSession, DraftSessionOptions } from './draftSessionTypes.ts';
import { requestPersistentStorage } from './persistentStorage.ts';

/**
 * Keep every document a page shows as a draft while it changes, from its
 * first change and before any save, so a reload, a crash or a closed tab loses
 * a moment at most and the last document comes back.
 *
 * Each tab holds the draft it shows, so two tabs never write over each other.
 * A tab reloaded — or restored by the browser after a crash — reopens its own
 * draft; a new tab reopens the most recent draft no live tab holds, and starts
 * empty when there is none. A document that took the page down while it was
 * being reopened is skipped once, so the page cannot crash on every load; the
 * next reload tries it again.
 * @param options - Where drafts go, and how the page shows one.
 * @returns What the site does with its drafts.
 */
export function createDraftSession<D>(
  options: DraftSessionOptions<D>,
): DraftSession {
  const { store, cells, status, signals, empty, isEmpty, reset } = options;
  const { shown, limit = DRAFT_LIMIT, keepSaved = true } = options;
  const scope = `${options.scope}:drafts`;
  const claims = createTabClaims(scope);
  const guard = createRestoreGuard(scope);

  // The last document handed to the autosave, so an unchanged one is not.
  let lastKept: Kept<D> | undefined;
  // The draft this tab holds.
  let heldId: string | undefined;
  // Drafts this page has written, so only a new one makes lists re-read.
  const written = new Set<string>();
  let warned = false;
  // The last work is reopened once per page, however often drafts start.
  let reopening: Promise<void> | undefined;

  function notify(
    key: ChromeKey,
    values?: MessageValues,
    intent?: 'success' | 'danger',
  ): void {
    const language = options.language?.() ?? 'en';
    options.notify(CHROME_CATALOG.translate(key, language, { values }), intent);
  }

  const autosave = createAutosave<Kept<D>>({
    write: writeKept,
    onError: (error) => {
      if (warned) return;
      warned = true;
      notify('drafts.failed', { message: error.message }, 'danger');
    },
  });

  function changed(): void {
    status.version.value += 1;
  }

  async function open(
    id: string,
    openOptions: { quiet?: boolean; force?: boolean } = {},
  ): Promise<boolean> {
    const { quiet = false, force = false } = openOptions;
    if (id === cells.draftId.peek() && !force) return true;
    const draft = await store.get(id);
    if (!draft) {
      if (!quiet) notify('drafts.unreadable', undefined, 'danger');
      return false;
    }
    if (!(await claims.claim(id))) {
      if (!quiet) notify('drafts.heldElsewhere', undefined, 'danger');
      return false;
    }
    await autosave.flush();
    guard.begin(id);
    signals.batch(() => {
      reset(draft.document);
      const document = cells.document.peek();
      const file = documentFile(draft.file, document, empty);
      cells.file.value = file;
      cells.draftId.value = id;
      lastKept = { id, document, file, createdAt: draft.createdAt };
    });
    shown?.();
    afterPaint(() => {
      guard.finish(id);
    });
    return true;
  }

  function keep(document: D, file: DocumentFile<D> | null, id: string | null) {
    if (id === null) {
      if (isEmpty(document)) return;
      // Undo after New brings back the document its draft already holds.
      const reopened = lastKept?.document === document ? lastKept : undefined;
      cells.draftId.value = reopened?.id ?? crypto.randomUUID();
      return;
    }
    if (id !== heldId) {
      if (heldId !== undefined) {
        void autosave.flush();
        claims.release(heldId);
      }
      heldId = id;
      void claims.claim(id);
      claims.remember(id);
    }
    const unchanged =
      lastKept?.id === id &&
      lastKept.document === document &&
      lastKept.file === file;
    if (unchanged) return;
    const before = lastKept?.id === id ? lastKept : undefined;
    lastKept = {
      id,
      document,
      file,
      createdAt: before?.createdAt ?? Date.now(),
    };
    autosave.schedule(lastKept);
    if (before && before.file !== file) void autosave.flush(); // just saved
  }

  async function writeKept(kept: Kept<D>): Promise<void> {
    if (isEmpty(kept.document)) {
      await store.delete(kept.id);
      if (written.delete(kept.id)) changed();
      return;
    }
    const draft: Draft<D> = {
      id: kept.id,
      document: kept.document,
      createdAt: kept.createdAt,
      updatedAt: Date.now(),
    };
    if (kept.file) draft.file = draftFile(kept.file, kept.document, keepSaved);
    await store.put(draft);
    await tidy(kept.id);
    if (!written.has(kept.id)) {
      written.add(kept.id);
      changed();
    }
    // Firefox asks the visitor, so only once there is work to keep.
    void requestPersistentStorage();
  }

  // A document is kept once, and the oldest goes past the limit; the draft
  // on screen and those a tab holds stay.
  async function tidy(id: string | null): Promise<void> {
    const stays = new Set(await claims.held());
    if (heldId !== undefined) stays.add(heldId);
    if (id !== null) stays.add(id);
    if (await tidyDrafts(store, stays, limit)) changed();
  }

  async function reopenLastWork(): Promise<void> {
    const remembered = claims.remembered();
    if (remembered !== undefined) {
      if (skipCrashed(remembered)) return;
      // A duplicated tab finds its draft held by the original, and starts empty.
      await open(remembered, { quiet: true });
      return;
    }
    const held = await claims.held();
    if (held === undefined) return;
    const kept = await store.list();
    const orphan = kept.find((draft) => !held.has(draft.id));
    if (!orphan || !isEmpty(cells.document.peek())) return;
    if (skipCrashed(orphan.id)) return;
    if (await open(orphan.id, { quiet: true })) {
      const language = options.language?.() ?? 'en';
      notify('drafts.reopened', {
        when: formatRelativeTime(orphan.updatedAt, { locale: language }),
      });
    }
  }

  // Skipped once: the mark is cleared, so a reload tries the draft again.
  function skipCrashed(id: string): boolean {
    if (!guard.crashedOn(id)) return false;
    guard.finish(id);
    notify('drafts.crashed', undefined, 'danger');
    return true;
  }

  return {
    start: async ({ linked }) => {
      try {
        const available = await store.isAvailable();
        status.available.value = available;
        if (!available) return () => undefined;
        if (!linked) {
          reopening ??= reopenLastWork();
          await reopening;
        }
        // Copies kept before a document was kept once go too; best effort.
        void tidy(cells.draftId.peek()).catch(() => undefined);
      } finally {
        status.settled.value = true;
      }
      const stop = signals.effect(() => {
        const document = cells.document.value;
        const file = cells.file.value;
        const id = cells.draftId.value;
        signals.untracked(() => {
          keep(document, file, id);
        });
      });
      return () => {
        stop();
        void autosave.dispose().then(() => {
          if (heldId !== undefined) claims.release(heldId);
          heldId = undefined;
        });
      };
    },
    flush: () => autosave.flush(),
    discardPending: () => {
      autosave.cancel();
      lastKept = undefined;
    },
    heldElsewhere: async () => {
      const held = new Set(await claims.held());
      if (heldId !== undefined) held.delete(heldId);
      return held;
    },
    changed,
    open,
  };
}
