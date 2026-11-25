import { StoreRefusal } from './storeRefusal.ts';

/**
 * A Cache Storage store of the site, or the browser's refusal named: a page
 * served without a secure context has no Cache Storage at all, and a private
 * window or blocked site data refuses to open one — both an `unavailable`
 * refusal (`StoreRefusal`), which a page answers by keeping nothing; anything
 * else is thrown on as it came.
 * @param name - The store's name, with its version: `site-models-v1`.
 * @returns The store.
 * @throws {StoreRefusal} `unavailable` when the browser keeps nothing here.
 */
export async function openCacheStore(name: string): Promise<Cache> {
  if (!('caches' in globalThis)) {
    throw new StoreRefusal(
      'unavailable',
      'This page has no Cache Storage: it is not a secure context.',
    );
  }
  try {
    return await globalThis.caches.open(name);
  } catch (error) {
    if (error instanceof DOMException) {
      throw new StoreRefusal('unavailable', error.message, { cause: error });
    }
    throw error;
  }
}
