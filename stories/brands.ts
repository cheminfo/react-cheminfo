/** A site's two colours, to check the components carry whatever they are given. */
export interface Brand {
  /** Name shown on the toolbar. */
  name: string;
  /** The leading colour, bound to `--brand` and `--accent`. */
  brand: string;
  /** The answering colour, bound to `--brand-alt`. */
  brandAlt: string;
}

/** Three pairs from real sites, so the toolbar shows a genuine range. */
export const BRANDS = [
  { name: 'vcl', brand: '#2d72d2', brandAlt: '#9a3412' },
  { name: 'surge', brand: '#4338ca', brandAlt: '#be123c' },
  { name: 'smiles', brand: '#1c6e42', brandAlt: '#9a3412' },
] as const satisfies readonly Brand[];

/** The pair the canvas opens on. */
export const DEFAULT_BRAND: Brand = BRANDS[0];

/**
 * The pair a toolbar value names, falling back to the default so a stale value
 * in a shared link never leaves the canvas unpainted.
 * @param name - The name the toolbar currently holds.
 * @returns The two colours to put on the tree.
 */
export function brandNamed(name: unknown): Brand {
  for (const brand of BRANDS) {
    if (brand.name === name) return brand;
  }
  return DEFAULT_BRAND;
}
