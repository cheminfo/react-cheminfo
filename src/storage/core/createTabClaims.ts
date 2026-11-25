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
 * A page going away for good — a reload, a link followed in the same tab —
 * lets go of its claims as it is hidden (`pagehide`) and notes in the tab's
 * session storage the ids it let go of; a page kept for the back button keeps
 * them. The next page of the tab waits for those ids rather than finding them
 * still held by the page it replaces, whose letting go no browser promises to
 * deliver before the new page asks.
 *
 * A duplicated tab inherits the original's session storage, so what it
 * `remembered` may be claimed already; with no page of its own gone before,
 * it asks without waiting, and then has to start on an id of its own.
 *
 * The claims live as long as the page, by design: create them once per scope,
 * when the module loads, as `createDraftSession` does. The `pagehide` listener
 * that lets go of them is never removed, so each further call adds one more.
 * @param scope - Names the locks and the remembered id, e.g. `draw:drafts`.
 * @returns The claims.
 */
export function createTabClaims(scope: string): TabClaims {
  const prefix = `${scope}:`;
  const rememberedKey = `${scope}:current`;
  const leftKey = `${scope}:left`;
  const releases = new Map<string, () => void>();
  const left = takeLeft(leftKey);
  globalThis.addEventListener?.('pagehide', (event) => {
    if (event.persisted) return;
    noteLeft(leftKey, [...releases.keys()]);
    for (const release of releases.values()) release();
    releases.clear();
  });

  return {
    claim: async (id) => {
      if (releases.has(id)) return true;
      const locks = globalThis.navigator?.locks;
      if (!locks) {
        releases.set(id, () => undefined);
        return true;
      }
      // This tab's previous page let go of it as it went away: wait for it.
      const ifAvailable = !left.delete(id);
      return new Promise<boolean>((resolve) => {
        locks
          .request(`${prefix}${id}`, { ifAvailable }, (lock) => {
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

/**
 * The ids this tab's previous page let go of as it went away, read once by
 * the page that follows it and forgotten, so a later duplicate of the tab
 * does not wait for them.
 * @param key - Where they are kept in the tab's session storage.
 * @returns The ids.
 */
function takeLeft(key: string): Set<string> {
  try {
    const written = globalThis.sessionStorage?.getItem(key) ?? null;
    globalThis.sessionStorage?.removeItem(key);
    return new Set(
      written === null || written === '' ? [] : written.split('\n'),
    );
  } catch {
    // A tab that cannot remember has no previous page to wait for.
    return new Set();
  }
}

function noteLeft(key: string, ids: readonly string[]): void {
  try {
    if (ids.length > 0) globalThis.sessionStorage?.setItem(key, ids.join('\n'));
  } catch {
    // A tab that cannot remember asks for its ids without waiting.
  }
}
