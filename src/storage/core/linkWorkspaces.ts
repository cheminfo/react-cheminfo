/**
 * The workspace a link opens in: `?workspace=exercise` puts that workspace of
 * the site on screen before the page is first drawn, exactly as picking it in
 * the settings does, and the address names the workspace on screen whenever it
 * is one of the site's, so the address bar, and every link the Share dialog
 * hands out, opens in it. Only the site's own workspaces have a name a link
 * can carry; one the visitor made lives in their browser alone.
 */

import type {
  BuiltinWorkspace,
  WorkspaceSummary,
  Workspaces,
} from './workspaceTypes.ts';

/** How the workspaces are tied to the address. */
export interface LinkWorkspacesOptions {
  /** The site's own workspaces; the first is the one a first visit opens. */
  builtins: readonly BuiltinWorkspace[];
  /** The `workspace` parameter on screen, if any. */
  read: () => string | undefined;
  /** Write it, or remove it for `null`, replacing the history entry. */
  write: (id: string | null) => void;
  /**
   * Be told when the address moves, so a page opened again is named too:
   * `subscribeToRoute` over the site's router.
   * @default undefined — only a change of workspace is followed
   */
  subscribe?: (listener: () => void) => () => void;
  /**
   * Whether the page on screen names the workspace, such as only the editor's.
   * @default every page does
   */
  follows?: () => boolean;
  /**
   * Called once the workspace a link names is on screen, such as to put in
   * hand the tool it is linked for.
   * @default nothing more is done
   */
  onOpened?: (id: string) => void;
}

/** The workspaces tied to the address. */
export interface LinkedWorkspaces {
  /**
   * The workspace of the site a `workspace` parameter names; an id no
   * workspace carries is ignored, so a link written before a rename opens.
   * @returns Its id, or undefined.
   */
  read: (value: string | undefined) => string | undefined;
  /**
   * What a link writes for a workspace: its id when it is one of the site's,
   * other than the one a first visit opens anyway.
   * @returns The value, or null to write none.
   */
  paramOf: (active: WorkspaceSummary) => string | null;
  /**
   * Put on screen the workspace the address names, before the first render.
   * @returns Settles once it is on screen.
   */
  open: () => Promise<void>;
  /**
   * Keep the address naming the workspace on screen, as it is picked and as
   * the page moves.
   * @returns The function that stops following.
   */
  follow: () => () => void;
}

/**
 * Tie a site's workspaces to its address.
 * @param workspaces - The site's workspaces.
 * @param options - Its own workspaces, and how the parameter is read and
 * written.
 * @returns What opens the linked workspace and follows the one on screen.
 */
export function linkWorkspaces(
  workspaces: Workspaces,
  options: LinkWorkspacesOptions,
): LinkedWorkspaces {
  const {
    builtins,
    read: readParam,
    write,
    subscribe,
    follows,
    onOpened,
  } = options;

  function read(value: string | undefined): string | undefined {
    const id = value?.trim();
    for (const workspace of builtins) {
      if (workspace.id === id) return id;
    }
    return undefined;
  }

  function paramOf(active: WorkspaceSummary): string | null {
    if (active.source !== 'builtin') return null;
    return active.id === builtins[0]?.id ? null : active.id;
  }

  return {
    read,
    paramOf,
    open: async () => {
      const id = read(readParam());
      if (id === undefined) return;
      if (workspaces.getState().active.id !== id) await workspaces.activate(id);
      onOpened?.(id);
    },
    follow: () => {
      const sync = (): void => {
        if (follows && !follows()) return;
        const named = paramOf(workspaces.getState().active);
        if ((readParam() ?? null) !== named) write(named);
      };
      sync();
      const stopWorkspaces = workspaces.subscribe(sync);
      const stopRoute = subscribe?.(sync);
      return () => {
        stopWorkspaces();
        stopRoute?.();
      };
    },
  };
}
