/** How much of its quota an origin uses, in bytes. */
export interface StorageUsage {
  /** Bytes stored. */
  usage: number;
  /** Bytes the browser lets the origin store. */
  quota: number;
}

let asked: Promise<boolean> | undefined;

/**
 * Ask the browser to keep this site's storage when the disk fills up, instead
 * of evicting it with the least-used sites' data.
 *
 * Chrome decides on its own, but Firefox asks the visitor, so call it once
 * there is work worth keeping — after the first save — never on page load.
 * Asked once per page; best effort, never throws.
 * @returns Whether the storage is kept.
 */
export function requestPersistentStorage(): Promise<boolean> {
  asked ??= askToPersist();
  return asked;
}

/**
 * How much the site stores and may store, where the browser says.
 * @returns The usage, or `undefined` where the browser does not tell.
 */
export async function storageUsage(): Promise<StorageUsage | undefined> {
  try {
    const estimate = await globalThis.navigator?.storage?.estimate?.();
    if (estimate?.usage === undefined || estimate.quota === undefined) {
      return undefined;
    }
    return { usage: estimate.usage, quota: estimate.quota };
  } catch {
    return undefined;
  }
}

async function askToPersist(): Promise<boolean> {
  const storage = globalThis.navigator?.storage;
  if (!storage?.persist) return false;
  try {
    if (await storage.persisted?.()) return true;
    return await storage.persist();
  } catch {
    return false;
  }
}
