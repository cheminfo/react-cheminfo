/** An institution that provides a site: hosts it, pays for it, employs who writes it. */
export interface ProviderEntry {
  /** How a site names the institution in its record. */
  id: string;
  /** The short name, spelled the way the institution spells it. */
  name: string;
  /** The full name, read by a screen reader and shown on hover. */
  fullName: string;
  /** Where the institution lives. */
  href: string;
  /** City and country, as written under the institution's name. */
  location: string;
}

/** An id the provider registry answers to. */
export type ProviderId = (typeof PROVIDERS)[number]['id'];

/**
 * The institutions a site names as its providers, in the order it names them.
 * @param ids - Which institutions, in display order.
 * @returns The entries, in that order.
 * @throws {Error} When an id is not in the registry.
 */
export function providers(ids: readonly ProviderId[]): ProviderEntry[] {
  const listed: ProviderEntry[] = [];
  for (const id of ids) {
    const entry = PROVIDERS.find((candidate) => candidate.id === id);
    if (entry === undefined) {
      throw new Error(`unknown provider: ${id}`);
    }
    listed.push(entry);
  }
  return listed;
}

/** Every institution a site of the family may name as its provider. */
export const PROVIDERS = [
  {
    id: 'epfl',
    name: 'EPFL',
    fullName: 'École polytechnique fédérale de Lausanne',
    href: 'https://www.epfl.ch',
    location: 'Lausanne, Switzerland',
  },
] as const satisfies readonly ProviderEntry[];
