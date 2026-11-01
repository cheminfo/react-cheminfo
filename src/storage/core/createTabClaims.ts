/** Which tab works on what, for work several tabs of a site may hold. */
export interface TabClaims {
  /**
   * Claim an id for this tab until it is released or the tab goes away.
   * @returns Whether the claim holds: false when another tab holds the id.
   */
  claim: (id: string) => Promise<boolean>;
  /** Let another tab claim the id. */
  release: (id: string) => void;
  /**
   * The ids every live tab of the site holds, this one included. An id
   * stored and not held was left by a tab that closed or crashed.
   * @returns The ids, or `undefined` where the browser cannot tell.
   */
  held: () => Promise<ReadonlySet<string> | undefined>;
  /**
   * The id this tab last worked on, kept across a reload — and across a
   * browser restoring its tabs after a crash — but not shared with other tabs.
   * @returns The id, or `undefined` for a tab that remembers none.
   */
  remembered: () => string | undefined;
  /** Keep an id for the next load of this tab, or forget it with `undefined`. */
  remember: (id: string | undefined) => void;
}

/**
 * Claims through Web Locks: a claim is a lock this tab holds for as long as
 * it lives, so a crashed tab lets go of it with nothing to clean up. Where the
 * browser has no Web Locks every claim holds, as if the site had one tab.
 *
 * A duplicated tab inherits the original's session storage, so what it
 * `remembered` may be claimed already; it then has to start on an id of its own.
 * @param scope - Names the locks and the remembered id, e.g. `draw:drafts`.
 * @returns The claims.
 */
export function createTabClaims(scope: string): TabClaims {
  const prefix = `${scope}:`;
  const rememberedKey = `${scope}:current`;
  const releases = new Map<string, () => void>();

  return {
    claim: async (id) => {
      if (releases.has(id)) return true;
      const locks = globalThis.navigator?.locks;
      if (!locks) {
        releases.set(id, () => undefined);
        return true;
      }
      return new Promise<boolean>((resolve) => {
        locks
          .request(`${prefix}${id}`, { ifAvailable: true }, (lock) => {
            if (!lock) {
              resolve(false);
              return undefined;
            }
            return new Promise<void>((release) => {
              releases.set(id, release);
              resolve(true);
            });
          })
          .catch(() => {
            // A frame denied Web Locks cannot tell tabs apart either.
            releases.set(id, () => undefined);
            resolve(true);
          });
      });
    },
    release: (id) => {
      releases.get(id)?.();
      releases.delete(id);
    },
    held: async () => {
      const locks = globalThis.navigator?.locks;
      if (!locks) return undefined;
      try {
        const { held = [] } = await locks.query();
        const ids = new Set<string>();
        for (const lock of held) {
          if (lock.name?.startsWith(prefix)) {
            ids.add(lock.name.slice(prefix.length));
          }
        }
        return ids;
      } catch {
        return undefined;
      }
    },
    remembered: () => {
      try {
        return globalThis.sessionStorage?.getItem(rememberedKey) ?? undefined;
      } catch {
        return undefined;
      }
    },
    remember: (id) => {
      try {
        if (id === undefined) {
          globalThis.sessionStorage?.removeItem(rememberedKey);
        } else {
          globalThis.sessionStorage?.setItem(rememberedKey, id);
        }
      } catch {
        // A tab that cannot remember starts on a new id after a reload.
      }
    },
  };
}
