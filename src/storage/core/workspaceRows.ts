import equal from 'fast-deep-equal';

import type { WorkspaceSummary, WorkspacesState } from './workspaceTypes.ts';

/** Where a workspace comes from: the site's code, or the visitor. */
export type WorkspaceSource = 'builtin' | 'user';

/** A workspace as the page holds it. */
export interface WorkspaceEntry {
  id: string;
  name: string;
  source: WorkspaceSource;
  /** The preferences it was saved with, fitted to the bucket. */
  definition: Record<string, unknown>;
  /** The preferences as it was left, when they differ from the saved ones. */
  live?: Record<string, unknown>;
}

/** A workspace as IndexedDB keeps it. */
export interface StoredWorkspace {
  id: string;
  source: WorkspaceSource;
  /** The visitor's workspaces only: the site's are named in its code. */
  name?: string;
  /** The visitor's workspaces only. */
  definition?: Record<string, unknown>;
  live?: Record<string, unknown>;
  updatedAt: number;
}

/**
 * The row a workspace is stored as: a site's own keeps only how it was left.
 * @param entry - The workspace.
 * @returns The row.
 */
export function rowOf(entry: WorkspaceEntry): StoredWorkspace {
  const { id, name, source, definition, live } = entry;
  return {
    id,
    source,
    ...(source === 'user' ? { name, definition } : {}),
    ...(live === undefined ? {} : { live }),
    updatedAt: Date.now(),
  };
}

/**
 * A name no other workspace has, told apart by a number when it is taken.
 * @param name - The name asked for.
 * @param entries - Every workspace.
 * @param id - The workspace named, whose own name does not count.
 * @returns The name, or e.g. `Teaching (2)`.
 */
export function uniqueName(
  name: string,
  entries: Iterable<Pick<WorkspaceEntry, 'id' | 'name'>>,
  id: string,
): string {
  const base = name.trim() || 'Workspace';
  const taken = new Set<string>();
  for (const entry of entries) {
    if (entry.id !== id) taken.add(entry.name.toLowerCase());
  }
  let candidate = base;
  for (let count = 2; taken.has(candidate.toLowerCase()); count++) {
    candidate = `${base} (${count})`;
  }
  return candidate;
}

/**
 * Whether two values read the same, whatever order their keys came in.
 * @param a - A value.
 * @param b - Another one.
 * @returns True when they are deeply equal.
 */
export function sameValue(a: unknown, b: unknown): boolean {
  return equal(a, b);
}

/**
 * What the workspaces look like, for a picker to draw: the site's own first,
 * in its order, then the visitor's by name.
 * @param entries - Every workspace.
 * @param active - The one on screen.
 * @param flags - Whether they were read, and whether they are kept.
 * @param flags.ready - The stored workspaces were read, or given up on.
 * @param flags.stored - The browser keeps them.
 * @returns The state.
 */
export function stateOf(
  entries: Iterable<WorkspaceEntry>,
  active: WorkspaceEntry,
  flags: { ready: boolean; stored: boolean },
): WorkspacesState {
  const builtins: WorkspaceSummary[] = [];
  const visitor: WorkspaceSummary[] = [];
  for (const { id, name, source } of entries) {
    (source === 'builtin' ? builtins : visitor).push({ id, name, source });
  }
  visitor.sort((a, b) => a.name.localeCompare(b.name));
  const { id, name, source, definition, live } = active;
  return {
    ...flags,
    workspaces: [...builtins, ...visitor],
    active: { id, name, source },
    modified: live !== undefined && !sameValue(live, definition),
  };
}
