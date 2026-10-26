/**
 * What a Thermo scan filter states, mined for the fields the records left blank.
 *
 * The structured `##$` records are the polite answer and the scan filter is the
 * honest one: a real Exploris export writes `##$IONISATION=` with nothing after
 * the equals sign and then names `NSI` in the middle of the conditions block
 * two lines later. So every field falls back to this, per field and never
 * wholesale — an explicit record always wins, because the exporter that wrote
 * it knew something the filter line does not say.
 *
 * A filter reads like
 * `FTMS + p NSI Full ms2 194.5000@hcd50.00 [44.0860-220.4300]`, preceded by the
 * raw file name and followed by `Scan #:` and `RT:` lines.
 */

/**
 * Read every field a conditions block states.
 *
 * Keyed by the same labels the metadata table uses, so a caller only has to
 * look up the label it failed to fill — nothing here has to know which fields
 * exist or what order they are shown in.
 * @param conditions - The instrument's own scan description, verbatim.
 * @returns The fields it states, by label; empty when it states none.
 */
export function parseScanFilter(conditions: string): Record<string, string> {
  if (!conditions) return {};
  const derived: Record<string, string> = {};

  const analyser = group(/^(?<value>FTMS|ITMS|TOFMS)\b/m, conditions);
  if (analyser) derived.Analyser = analyser;

  const ionisation = group(/\b(?<value>ESI|NSI|APCI|MALDI)\b/, conditions);
  if (ionisation) derived.Ionization = ionisation;

  // The sign is read between the analyser and the ion source rather than on its
  // own, because a bare `-` also separates the two ends of the scan range.
  if (/(?:FTMS|ITMS|TOFMS) \+ /.test(conditions)) {
    derived.Polarity = 'positive';
  } else if (/(?:FTMS|ITMS|TOFMS) - /.test(conditions)) {
    derived.Polarity = 'negative';
  }

  readFragmentation(conditions, derived);

  const range = /\[(?<from>[\d.]+)-(?<to>[\d.]+)\]/.exec(conditions);
  const from = range?.groups?.from;
  const to = range?.groups?.to;
  if (from !== undefined && to !== undefined) {
    derived['Scan range'] = `${Number(from)}–${Number(to)} m/z`;
  }

  const retentionTime = group(/^RT:\s*(?<value>.+)$/m, conditions);
  if (retentionTime) derived['Retention time'] = `${retentionTime} min`;

  const scans = group(/^Scan #:\s*(?<value>.+)$/m, conditions);
  if (scans) derived.Scans = scans;

  const rawFile = group(/^(?<value>\S+\.raw)$/m, conditions);
  if (rawFile) derived['Raw file'] = rawFile;

  return derived;
}

/**
 * Read the level a scan was taken at, and what it isolated to get there.
 *
 * The level is read first and everything else only under it, because the
 * isolation and the energy are the level's own clause: a survey scan that
 * happens to be described one line below a product scan states no level of its
 * own, and reading its `@hcd50.00` anyway would report a collision energy for a
 * spectrum nothing was ever fragmented into.
 *
 * The level is not tied to the shape of that clause, though — `Full ms2
 * 194.5000@etd` and `SIM ms [190.0000-200.0000]` are both real filters, and an
 * MS2 that loses its level because the activation was spelled unusually loses
 * the precursor the annotator would have searched for.
 * @param conditions - The instrument's own scan description.
 * @param derived - The fields read so far, added to in place.
 */
function readFragmentation(
  conditions: string,
  derived: Record<string, string>,
): void {
  const level = /\b(?:Full|SIM|SRM) ms(?<level>\d*)\b/.exec(conditions)?.groups
    ?.level;
  if (level === undefined) return;
  if (level === '') {
    derived['MS level'] = 'MS1';
    return;
  }
  derived['MS level'] = `MS${level}`;

  // The isolation is anchored to the level the filter just stated, so an MS3
  // reports the window it was isolated at rather than the one before it.
  const isolation = group(
    new RegExp(String.raw` ms${level} (?<value>\d+(?:\.\d+)?)`),
    conditions,
  );
  if (isolation) derived['Isolation m/z'] = isolation;

  const clause = /@(?<activation>[a-z]+)(?<energy>\d+(?:\.\d+)?)/.exec(
    conditions,
  );
  const activation = clause?.groups?.activation;
  const energy = clause?.groups?.energy;
  if (activation !== undefined && energy !== undefined) {
    derived['Collision energy'] = `${activation.toUpperCase()} ${energy}`;
  }
}

/**
 * The `value` capture of a pattern, trimmed.
 * @param pattern - A regular expression carrying a `value` named group.
 * @param conditions - The text to read it out of.
 * @returns The capture, or `''` when the pattern does not match.
 */
function group(pattern: RegExp, conditions: string): string {
  return pattern.exec(conditions)?.groups?.value?.trim() ?? '';
}
