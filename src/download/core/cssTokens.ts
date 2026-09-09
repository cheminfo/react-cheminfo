/**
 * Reading the tokens a figure is drawn with out of its markup, and writing
 * their values back into it.
 *
 * Every chart in this package takes its ink from the family's custom
 * properties — `var(--border)`, `var(--text-muted)` — which is what lets one
 * figure follow the site it is embedded in. A file saved to disk has left that
 * site: nothing there declares `--border`, so a `var()` that survives the
 * export resolves to nothing at all and the picture arrives with no axes. So
 * the values are read off the live element while it is still on the page, and
 * written into the copy that leaves.
 */

/**
 * One `var(--name)` call, with the fallback it carries where it has one. The
 * fallback may not itself contain brackets, so a nested call is left to the
 * next pass rather than half-matched here.
 */
const TOKEN_CALL =
  /var\(\s*(?<name>--[\w-]+)\s*(?:,\s*(?<fallback>[^()]*?)\s*)?\)/gu;

/** How many times a resolved value may itself name another token. */
const MAX_PASSES = 4;

/**
 * Every token a piece of markup asks for, each named once.
 * @param text - The markup, or a single declaration.
 * @returns The token names, `--` included, in the order first written.
 */
export function cssTokenNames(text: string): readonly string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(TOKEN_CALL)) {
    const name = match.groups?.name;
    if (name === undefined || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

/**
 * The same markup with every token it names written out in full.
 *
 * A token whose value is itself written with `var()` — which is how a site
 * points `--accent` at its own `--brand` — is resolved in turn, up to a few
 * passes deep. A token nobody has a value for keeps its fallback where the
 * call carries one, and is otherwise left exactly as written: an unresolved
 * `var()` is at worst the colour that was already missing, while a guess would
 * be a colour nobody chose.
 * @param text - The markup, or a single declaration.
 * @param values - What each token is worth, keyed by name with its `--`.
 * @returns The markup, resolved.
 */
export function resolveCssTokens(
  text: string,
  values: Readonly<Record<string, string>>,
): string {
  let resolved = text;
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    if (!resolved.includes('var(')) break;
    const next = resolveOnce(resolved, values);
    if (next === resolved) break;
    resolved = next;
  }
  return resolved;
}

/**
 * One pass over the markup, replacing the calls that can be answered.
 * @param text - The markup as it stands.
 * @param values - What each token is worth.
 * @returns The markup, one layer of tokens shallower.
 */
function resolveOnce(
  text: string,
  values: Readonly<Record<string, string>>,
): string {
  let written = '';
  let read = 0;
  for (const match of text.matchAll(TOKEN_CALL)) {
    const { name, fallback } = match.groups ?? {};
    const value = name === undefined ? undefined : values[name]?.trim();
    written += text.slice(read, match.index);
    written +=
      value !== undefined && value !== '' ? value : (fallback ?? match[0]);
    read = match.index + match[0].length;
  }
  return written + text.slice(read);
}
