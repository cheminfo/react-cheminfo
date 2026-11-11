/**
 * The envelope every file of the family carries its edit state in, as JSON:
 * in the `<script>` of an HTML page, and as the manifest of a ZIP. An SVG
 * figure carries the same fields as XML (`figureSource.ts`).
 *
 * ```json
 * { "format": "cheminfo", "version": 2, "site": "write",
 *   "generator": "write.cheminfo.org 1.2.0", "href": "https://…",
 *   "data": { "version": 1, "value": … },
 *   "view": { "version": 1, "value": … },
 *   "preferences": { "version": 1, "value": … } }
 * ```
 *
 * The family owns the envelope and its `version`; each part is the site's,
 * versioned by the site. A reader takes the parts it knows and leaves the
 * rest, so a part, or a field, is added without breaking an older reader.
 */

import { isSameSite, presentSiteId } from '../../ecosystem/core/lookup.ts';
import { isPlainRecord } from '../../state/core/mergeStored.ts';

import type { FigureStates, SiteState } from './figureState.ts';
import { STATE_PARTS } from './figureState.ts';

/** What the envelope says it is, in its `format` field. */
export const SOURCE_FORMAT = 'cheminfo';

/** The version of the envelope the family writes and reads. */
export const SOURCE_VERSION = 2;

/** The identifier of the `<script>` an HTML page carries the envelope in. */
export const HTML_SOURCE_ID = 'cheminfo-source';

const SITE = /^[a-z\d]+(?:-[a-z\d]+)*$/;

// What would end the script, or a line, in the JSON a page carries.
const UNSAFE_IN_SCRIPT = /[<\u2028\u2029]/g;

/** What a file of the family says about itself, and the state it holds. */
export interface SourceRecord extends FigureStates {
  /** The site that wrote it, as the family names it, e.g. `write`. */
  site: string;
  /**
   * The page as it stood when it was written.
   * @default undefined — not said
   */
  href?: string;
  /**
   * The build that wrote it, e.g. `write.cheminfo.org 1.2.0`.
   * @default undefined — not said
   */
  generator?: string;
}

/** The envelope, as JSON writes it. */
export interface SourceEnvelope extends SourceRecord {
  /** Always `cheminfo`. */
  format: typeof SOURCE_FORMAT;
  /** The version of the envelope. */
  version: typeof SOURCE_VERSION;
}

/**
 * The envelope of a record, ready for `JSON.stringify`: what is not said is
 * left out.
 * @param record - What the file says about itself, and its state.
 * @returns The envelope.
 */
export function sourceEnvelope(record: SourceRecord): SourceEnvelope {
  const envelope: SourceEnvelope = {
    format: SOURCE_FORMAT,
    version: SOURCE_VERSION,
    site: record.site,
  };
  if (record.href !== undefined) envelope.href = record.href;
  if (record.generator !== undefined) envelope.generator = record.generator;
  for (const part of STATE_PARTS) {
    const state = record[part];
    if (state !== undefined) envelope[part] = state;
  }
  return envelope;
}

/**
 * The record an envelope holds, read from parsed JSON. An envelope of another
 * format or version, or of another site, is none; a part that does not read is
 * left out.
 * @param value - The parsed JSON, from anywhere.
 * @param site - The site whose envelope is wanted; another site's is none.
 * @returns The record, or `undefined`.
 */
export function readSourceEnvelope(
  value: unknown,
  site?: string,
): SourceRecord | undefined {
  if (!isPlainRecord(value)) return undefined;
  if (value.format !== SOURCE_FORMAT || value.version !== SOURCE_VERSION) {
    return undefined;
  }
  const named = value.site;
  if (typeof named !== 'string' || !SITE.test(named)) return undefined;
  if (site !== undefined && !isSameSite(named, site)) return undefined;
  const record: SourceRecord = { site: presentSiteId(named) };
  if (typeof value.href === 'string') record.href = value.href;
  if (typeof value.generator === 'string') record.generator = value.generator;
  for (const part of STATE_PARTS) {
    const state = readState(value[part]);
    if (state !== undefined) record[part] = state;
  }
  return record;
}

/**
 * An HTML page carrying its envelope, in place of any it carried before: a
 * `<script type="application/json" id="cheminfo-source">` closing its head.
 * @param html - The page.
 * @param record - What it says about itself, and its state.
 * @returns The page.
 */
export function withHtmlSource(html: string, record: SourceRecord): string {
  const page = withoutHtmlSource(html);
  const json = JSON.stringify(sourceEnvelope(record)).replaceAll(
    UNSAFE_IN_SCRIPT,
    (char) =>
      String.raw`\u${char.codePointAt(0)?.toString(16).padStart(4, '0')}`,
  );
  const script = `<script type="application/json" id="${HTML_SOURCE_ID}">${json}</script>\n`;
  const head = page.search(/<\/head\s*>/i);
  return head === -1
    ? `${script}${page}`
    : `${page.slice(0, head)}${script}${page.slice(head)}`;
}

/**
 * The record an HTML page carries in its envelope.
 * @param html - The page, from anywhere.
 * @param site - The site whose envelope is wanted; another site's is none.
 * @returns The record, or `undefined` when the page carries none that reads.
 */
export function readHtmlSource(
  html: string,
  site?: string,
): SourceRecord | undefined {
  const match = scriptPattern().exec(html);
  if (match === null) return undefined;
  try {
    return readSourceEnvelope(JSON.parse(match[1] ?? '') as unknown, site);
  } catch {
    return undefined;
  }
}

function withoutHtmlSource(html: string): string {
  return html.replace(new RegExp(String.raw`${scriptPattern().source}\n?`), '');
}

function scriptPattern(): RegExp {
  return new RegExp(
    String.raw`<script type="application/json" id="${HTML_SOURCE_ID}">([\s\S]*?)</script>`,
  );
}

function readState(value: unknown): SiteState | undefined {
  if (!isPlainRecord(value) || !('value' in value)) return undefined;
  const { version } = value;
  if (typeof version !== 'number' || !Number.isSafeInteger(version)) {
    return undefined;
  }
  return version < 1 ? undefined : { version, value: value.value };
}
