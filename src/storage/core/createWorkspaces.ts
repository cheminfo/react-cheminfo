import { toError } from '../../error/core/toError.ts';
import {
  fitSignalBucket,
  hydrateSignalBucket,
  snapshotSignalBucket,
} from '../../state/core/signalBucket.ts';

import { createAutosave } from './createAutosave.ts';
import type { WorkspaceRecord } from './workspaceFile.ts';
import { readWorkspaceText, writeWorkspaceText } from './workspaceFile.ts';
import type { StoredWorkspace, WorkspaceEntry } from './workspaceRows.ts';
import { rowOf, sameValue, stateOf, uniqueName } from './workspaceRows.ts';
import {
  openWorkspaceJournal,
  openWorkspaceStore,
  takeRows,
} from './workspaceStore.ts';
import type {
  WorkspaceSummary,
  Workspaces,
  WorkspacesOptions,
} from './workspaceTypes.ts';

/**
 * Keep a site's preferences as workspaces: named sets of every preference —
 * which panels are offered, shown and open, and each one's settings — kept in
 * IndexedDB, switched between, saved, and carried in a file.
 *
 * The site declares its preferences as a tree of signals, as for
 * `persistSignalBucket`, and ships workspaces of its own. What is on screen is
 * the active workspace as it was left: every change is kept at once, so a
 * reload finds it, and is told apart from the workspace as saved, which
 * `reset` returns to. What is read back is fitted to the tree, so a preference
 * added since keeps its default and one of the wrong shape is dropped.
 *
 * Nothing is read until `ready`, which the page awaits before its first render
 * so it never shows one workspace and then another. A browser that keeps
 * nothing, or takes longer than `timeout` to answer, gets them in this page.
 * @param options - See {@link WorkspacesOptions}.
 * @returns The workspaces.
 */
export function createWorkspaces<TBucket extends object>(
  options: WorkspacesOptions<TBucket>,
): Workspaces {
  const { bucket, effect, builtins, site, timeout = 1500 } = options;
  const { delay, onError, legacy: readLegacy, forgetLegacy } = options;
  const { batch = (callback: () => void) => callback() } = options;
  const defaults = snapshotSignalBucket(bucket);
  const fit = (value: unknown) => fitSignalBucket(bucket, value, defaults);
  const entries = new Map<string, WorkspaceEntry>();
  for (const { id, name, preferences = {} } of builtins) {
    entries.set(id, {
      id,
      name,
      source: 'builtin',
      definition: fit(preferences),
    });
  }
  const first = entries.get(builtins[0].id) as WorkspaceEntry;
  let shown = first;
  const flags = { ready: false, stored: false };
  const listeners = new Set<() => void>();
  let state = stateOf(entries.values(), shown, flags);
  const store = openWorkspaceStore(options.name);
  const journal = openWorkspaceJournal(options.name);
  const autosave = createAutosave<StoredWorkspace>({
    write: async (row) => {
      const written = await store.putRow(row);
      // Unless a change came since, the journal holds what was just written.
      if (written && !autosave.isPending()) journal.clear();
    },
    delay,
    onError,
  });

  function refresh(): void {
    const next = stateOf(entries.values(), shown, flags);
    if (sameValue(next, state)) return;
    state = next;
    for (const listener of listeners) listener();
  }

  function show(
    entry: WorkspaceEntry,
    values = entry.live ?? entry.definition,
  ) {
    shown = entry;
    batch(() => {
      hydrateSignalBucket(bucket, values);
    });
    refresh();
  }

  async function start(): Promise<void> {
    const legacy = readLegacy?.();
    const journaled = journal.read();
    const read = await store.read(timeout);
    flags.stored = read !== undefined;
    if (read) {
      takeRows(read.rows, entries, fit);
      const active =
        typeof read.active === 'string' && entries.get(read.active);
      if (active) shown = active;
    }
    if (legacy !== undefined && (!read || read.rows.length === 0)) {
      first.live = fit(legacy);
      if (read) {
        await store.put(first).then(forgetLegacy, (error: unknown) => {
          onError?.(toError(error));
        });
      }
    }
    // Newer than what IndexedDB holds: the page before was left too soon.
    const left = journaled && entries.get(journaled.id);
    if (journaled && left) {
      left.live = fit(journaled.live);
      shown = left;
      if (read) autosave.schedule(rowOf(left));
    }
    show(shown);
    let subscribed = false;
    effect(() => {
      const snapshot = snapshotSignalBucket(bucket);
      if (!subscribed) {
        subscribed = true;
        return;
      }
      shown.live = snapshot;
      journal.write(shown.id, snapshot);
      autosave.schedule(rowOf(shown));
      refresh();
    });
    flags.ready = true;
    refresh();
  }

  function owned(id: string): WorkspaceEntry {
    const entry = entries.get(id);
    if (entry?.source !== 'user') {
      throw new Error('Only a workspace you made is renamed or deleted.');
    }
    return entry;
  }

  async function activate(id: string): Promise<void> {
    const entry = entries.get(id);
    if (!entry) throw new Error('There is no such workspace.');
    if (entry === shown) return;
    await autosave.flush();
    show(entry);
    await store.putActive(id);
  }

  function record(): WorkspaceRecord {
    return {
      id: shown.source === 'builtin' ? crypto.randomUUID() : shown.id,
      name: shown.name,
      preferences: snapshotSignalBucket(bucket),
    };
  }

  async function add(taken: WorkspaceRecord): Promise<WorkspaceSummary> {
    await autosave.flush();
    const id =
      entries.get(taken.id)?.source === 'builtin'
        ? crypto.randomUUID()
        : taken.id;
    const entry: WorkspaceEntry = {
      id,
      name: uniqueName(taken.name, entries.values(), id),
      source: 'user',
      definition: fit(taken.preferences),
    };
    entries.set(id, entry);
    show(entry);
    await Promise.all([store.put(entry), store.putActive(id)]);
    return { id, name: entry.name, source: 'user' };
  }

  return {
    site,
    ready: start(),
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    current: () => snapshotSignalBucket(bucket),
    apply: (preferences) => {
      show(shown, fit(preferences));
    },
    activate,
    save: async () => {
      if (shown.source === 'builtin') {
        throw new Error('A workspace of the site is saved under a new name.');
      }
      await autosave.flush();
      shown.definition = snapshotSignalBucket(bucket);
      shown.live = undefined;
      refresh();
      await store.put(shown);
    },
    saveAs: async (name) => {
      await autosave.flush();
      const left = shown;
      const id = crypto.randomUUID();
      const entry: WorkspaceEntry = {
        id,
        name: uniqueName(name, entries.values(), id),
        source: 'user',
        definition: snapshotSignalBucket(bucket),
      };
      entries.set(id, entry);
      // What was changed went into the new workspace, not the one left.
      left.live = undefined;
      shown = entry;
      refresh();
      await Promise.all([
        store.put(entry),
        store.put(left),
        store.putActive(id),
      ]);
      return { id, name: entry.name, source: 'user' };
    },
    reset: () => {
      show(shown, shown.definition);
    },
    rename: async (id, name) => {
      const entry = owned(id);
      entry.name = uniqueName(name, entries.values(), id);
      refresh();
      await store.put(entry);
    },
    remove: async (id) => {
      const entry = owned(id);
      if (entry === shown) await activate(first.id);
      entries.delete(id);
      refresh();
      await store.remove(id);
    },
    record,
    exportText: () => writeWorkspaceText(record(), site),
    importText: async (text) => add(readWorkspaceText(text, site)),
    add,
    flush: () => autosave.flush(),
  };
}
