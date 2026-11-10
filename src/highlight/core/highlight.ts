/**
 * What a page links its views through: the thing being pointed at, and the
 * thing chosen. A plate and its table, a spectrum and its peaks, a molecule and
 * its modes are views of the same things, so one highlight is written by every
 * view and read by every view, and pointing at a row lights its mark.
 *
 * A key names the thing in the site's own terms — a mode index, an element
 * symbol, `{ lane: 2, compound: 1 }` — and the site owns the two cells, as
 * signals of its state, so the components reading them re-render on their own.
 */

/** One half of a highlight: a signal, or anything holding a `value`. */
export interface HighlightCell<K> {
  /** The key highlighted, `null` when nothing is. */
  value: K | null;
}

/** The two highlights a page links its views through. */
export interface Highlight<K> {
  /**
   * What the pointer is on, in whichever view. Never kept and never written
   * into the address: it is gone the moment the pointer is.
   */
  hovered: HighlightCell<K>;
  /** What was clicked, tapped or reached by the keys. It stays until replaced. */
  selected: HighlightCell<K>;
}

/** How a thing is highlighted: chosen, pointed at, or not at all. */
export type HighlightState = 'selected' | 'hovered' | undefined;

/**
 * Point at a thing, or at nothing. The cell is written only when the key says
 * something new, so two views each reporting what the other just lit cannot
 * bounce the highlight between them.
 * @param highlight - The page's highlight.
 * @param key - What is pointed at, `null` for nothing.
 */
export function hoverHighlight<K>(highlight: Highlight<K>, key: K | null) {
  writeCell(highlight.hovered, key);
}

/**
 * Choose a thing, or nothing, with the same guard as {@link hoverHighlight}.
 * @param highlight - The page's highlight.
 * @param key - What is chosen, `null` for nothing.
 */
export function selectHighlight<K>(highlight: Highlight<K>, key: K | null) {
  writeCell(highlight.selected, key);
}

/**
 * How a thing is highlighted. Being chosen wins over being pointed at, so a
 * chosen row keeps its look while the pointer crosses it.
 * @param highlight - The page's highlight.
 * @param key - The thing a view draws.
 * @returns `selected`, `hovered`, or `undefined` when neither names it.
 */
export function highlightStateOf<K>(
  highlight: Highlight<K>,
  key: K,
): HighlightState {
  if (highlightMatches(highlight.selected.value, key)) return 'selected';
  if (highlightMatches(highlight.hovered.value, key)) return 'hovered';
  return undefined;
}

/**
 * Whether a highlighted key names a thing a view draws.
 *
 * A key that is a record matches a record sharing at least one of its fields
 * with every shared field equal, so things at different levels light each
 * other: `{ lane: 2, compound: 1, spot: 's7' }` lights the cell
 * `{ lane: 2, compound: 1 }`, the column `{ compound: 1 }` and the lane
 * `{ lane: 2 }`, and pointing at the column lights every spot of compound 1.
 * A field left `undefined` is a field the record does not have. Any other key
 * matches what is identical to it.
 * @param key - What is highlighted, `null` when nothing is.
 * @param target - The thing a view draws.
 * @returns Whether the thing is lit.
 */
export function highlightMatches<K>(key: K | null, target: K): boolean {
  if (key === null) return false;
  if (!isRecord(key) || !isRecord(target)) return Object.is(key, target);
  let shared = false;
  for (const name in key) {
    const value = key[name];
    const other = target[name];
    if (value === undefined || other === undefined) continue;
    if (!Object.is(value, other)) return false;
    shared = true;
  }
  return shared;
}

/**
 * Whether two keys name the same thing: identical, or records holding the same
 * values under the same fields.
 * @param a - One key.
 * @param b - The other.
 * @returns Whether they are the same key.
 */
export function sameHighlightKey<K>(a: K | null, b: K | null): boolean {
  if (Object.is(a, b)) return true;
  if (!isRecord(a) || !isRecord(b)) return false;
  for (const name in a) if (!Object.is(a[name], b[name])) return false;
  for (const name in b) if (!Object.is(a[name], b[name])) return false;
  return true;
}

function writeCell<K>(cell: HighlightCell<K>, key: K | null): void {
  if (!sameHighlightKey(cell.value, key)) cell.value = key;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
