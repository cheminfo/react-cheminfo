/**
 * How one kind name falls under another, apart from the schemas of
 * `./kinds.ts`, so a page that only matches kinds — a Send menu — never loads
 * ajv.
 */

/**
 * Whether a kind falls under another: the same name, or a name under it on a
 * segment boundary. A list (`…[]`) never stands for one value, nor one value
 * for a list.
 * @param accepted - The kind a tool declares, e.g. `'chem.molfile'`.
 * @param offered - The kind an item carries, e.g. `'chem.molfile.2d'`.
 * @returns `true` when an item of `offered` can be read as `accepted`.
 */
export function kindAccepts(accepted: string, offered: string): boolean {
  const list = accepted.endsWith('[]');
  if (offered.endsWith('[]') !== list) return false;
  const base = list ? accepted.slice(0, -2) : accepted;
  const name = list ? offered.slice(0, -2) : offered;
  return name === base || name.startsWith(`${base}.`);
}
