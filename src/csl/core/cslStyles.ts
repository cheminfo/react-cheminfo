/**
 * The Citation Style Language styles the journals of the family format their
 * references in, kept as the CSL project publishes them (each says who wrote
 * it and under which licence) and loaded one at a time, only when something is
 * formatted. A dependent style — Tetrahedron's — is formatted by the style it
 * names as its parent. `scripts/csl-styles.mjs` writes them.
 */

import { STYLE_LOADERS } from './styles/styleLoaders.ts';

/** The ids of the styles there are, as the CSL project names them. */
export const CSL_STYLE_IDS: readonly string[] = Object.keys(STYLE_LOADERS);

/**
 * Whether a style is one there is.
 * @param id - The style's id, `american-chemical-society`.
 * @returns True when it is.
 */
export function hasCslStyle(id: string): boolean {
  return Object.hasOwn(STYLE_LOADERS, id);
}

/**
 * The style that formats a style's references: itself, or the parent a
 * dependent style names.
 * @param id - The style's id, one there is.
 * @returns Its XML.
 * @throws {Error} For a style there is not.
 */
export async function loadCslStyle(id: string): Promise<string> {
  const load = hasCslStyle(id) ? STYLE_LOADERS[id] : undefined;
  if (load === undefined) throw new Error(`unknown citation style: ${id}`);
  const xml = await load();
  const parent = parentOf(xml);
  return parent === undefined || parent === id ? xml : loadCslStyle(parent);
}

/**
 * The terms a style writes its references with — `et al.`, `p.`, the months —
 * in English, the language every journal of the family publishes in.
 * @returns The locale's XML.
 */
export function loadCslLocale(): Promise<string> {
  return import('./styles/localeEnUs.ts').then((module) => module.LOCALE);
}

function parentOf(xml: string): string | undefined {
  const link = /<link\s[^>]*rel="independent-parent"[^>]*>/.exec(xml)?.[0];
  return link === undefined
    ? undefined
    : /href="[^"]*\/styles\/(?<parent>[^"/]+)"/.exec(link)?.groups?.parent;
}
