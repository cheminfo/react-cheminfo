import type { SignalEffect } from '../../state/core/persistSignalBucket.ts';

import type { WorkspaceRecord } from './workspaceFile.ts';
import type { WorkspaceSource } from './workspaceRows.ts';

export type { WorkspaceSource } from './workspaceRows.ts';

/** A workspace a site ships with. */
export interface BuiltinWorkspace {
  /** Its identifier, never changed once shipped: the visitor's copy is kept under it. */
  id: string;
  /** The name the picker shows. */
  name: string;
  /**
   * What differs from the bucket as it is declared, keyed as it is.
   * @default {} — the bucket's own values
   */
  preferences?: Record<string, unknown>;
}

/** One workspace, as a picker lists it. */
export interface WorkspaceSummary {
  /** Its identifier. */
  id: string;
  /** Its name. */
  name: string;
  /** Whether the site ships it or the visitor made it. */
  source: WorkspaceSource;
}

/** What the workspaces look like now, for a picker to draw. */
export interface WorkspacesState {
  /** Whether the stored workspaces were read, or given up on. */
  ready: boolean;
  /** Whether the browser keeps them; false keeps them in this page only. */
  stored: boolean;
  /** Every workspace: the site's first, in its order, then the visitor's by name. */
  workspaces: readonly WorkspaceSummary[];
  /** The workspace on screen. */
  active: WorkspaceSummary;
  /** Whether the preferences on screen differ from the workspace as saved. */
  modified: boolean;
}

/** What `createWorkspaces` is given. */
export interface WorkspacesOptions<TBucket extends object> {
  /** Names the database, e.g. `draw-cheminfo`, which `-workspaces` follows. */
  name: string;
  /** The site, e.g. `draw`, written into a workspace file and checked on reading one. */
  site: string;
  /** The tree of signals the workspace on screen fills, as declared. */
  bucket: TBucket;
  /** The page's own `effect`, imported from its signals package. */
  effect: SignalEffect;
  /** The workspaces the site ships; the first is the one a first visit opens. */
  builtins: readonly [BuiltinWorkspace, ...BuiltinWorkspace[]];
  /**
   * Groups the writes into the bucket, so a workspace taken on redraws once.
   * @default each leaf is written on its own
   */
  batch?: (callback: () => void) => void;
  /**
   * Reads the preferences kept before there were workspaces, taken once as
   * the first workspace's.
   * @default nothing is taken
   */
  legacy?: () => unknown;
  /**
   * Called once the preferences of `legacy` are stored, so they can be dropped.
   * @default nothing is dropped
   */
  forgetLegacy?: () => void;
  /**
   * Milliseconds the stored workspaces may take to come before the page goes
   * on without them, keeping its own in this page only.
   * @default 1500
   */
  timeout?: number;
  /**
   * Milliseconds of quiet before a change to the preferences is written.
   * @default 500
   */
  delay?: number;
  /**
   * Told when a write fails.
   * @default the failure is dropped
   */
  onError?: (error: Error) => void;
}

/** The workspaces of a site, and the preferences on screen they fill. */
export interface Workspaces {
  /** The site they belong to. */
  readonly site: string;
  /** Settles once the workspace on screen is in the bucket: render after it. */
  readonly ready: Promise<void>;
  /** What the workspaces look like now; the same object until they change. */
  getState: () => WorkspacesState;
  /** Be told whenever {@link Workspaces.getState} changes. */
  subscribe: (listener: () => void) => () => void;
  /** The preferences on screen. */
  current: () => Record<string, unknown>;
  /** Put preferences on screen, fitted to the bucket, in the active workspace. */
  apply: (preferences: unknown) => void;
  /** Put another workspace on screen, as it was left. */
  activate: (id: string) => Promise<void>;
  /** Save what is on screen into the active workspace, one of the visitor's. */
  save: () => Promise<void>;
  /**
   * Save what is on screen as a new workspace, and switch to it; the one left
   * returns to what it was saved as.
   */
  saveAs: (name: string) => Promise<WorkspaceSummary>;
  /** Put the active workspace back on screen as it was saved. */
  reset: () => void;
  /** Rename one of the visitor's workspaces. */
  rename: (id: string, name: string) => Promise<void>;
  /** Delete one of the visitor's workspaces; the site's first opens in its place. */
  remove: (id: string) => Promise<void>;
  /** The active workspace as a file carries it: its name and what is on screen. */
  record: () => WorkspaceRecord;
  /** The active workspace as a workspace file. */
  exportText: () => string;
  /** Take a workspace file in, and switch to it. */
  importText: (text: string) => Promise<WorkspaceSummary>;
  /**
   * Take a workspace in — from a file, from a document — replacing the copy of
   * the same identifier, and switch to it as it was saved.
   */
  add: (record: WorkspaceRecord) => Promise<WorkspaceSummary>;
  /** Write what waits to be written. */
  flush: () => Promise<void>;
}
