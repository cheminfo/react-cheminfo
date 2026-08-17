import type { QueryEntry } from './query.ts';
import { firstValues, parseQuery, serializeQuery } from './query.ts';
import type {
  HideablePart,
  ShareParamCodecs,
  ShareParamValues,
  ShareVocabulary,
} from './vocabulary.ts';

/** The parameter that drops the site chrome. */
export const EMBED_PARAM = 'embed';

/** The parameter listing the parts a link switches off. */
export const HIDE_PARAM = 'hide';

/** What one link says about the page it opens, beyond the tool's own inputs. */
export interface ShareConfig<
  Codecs extends ShareParamCodecs = Record<string, never>,
> {
  /** Drop the site chrome, so the page can be framed in someone else's site. */
  embed: boolean;
  /** The parts switched off, in the order the vocabulary lists them. */
  hidden: readonly string[];
  /** The tool's own parameters, each at the value the link carries or its default. */
  params: ShareParamValues<Codecs>;
}

/**
 * Read the configuration a link carries.
 *
 * Everything here is untrusted: a `hide` key the vocabulary does not list is
 * ignored, a malformed number falls back to its default, and every number is
 * clamped to what the tool can serve, so a link written two years ago still
 * opens.
 * @param search - The query string, with or without its leading `?`.
 * @param vocabulary - What this site's links can say.
 * @returns The configuration in force.
 */
export function parseShareConfig<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(search: string, vocabulary: ShareVocabulary<Codecs>): ShareConfig<Codecs> {
  const values = firstValues(parseQuery(search));
  const embed = values.get(EMBED_PARAM);
  return {
    embed: embed !== undefined && embed !== '0',
    hidden: orderHidden(splitHidden(values.get(HIDE_PARAM)), vocabulary.parts),
    params: readParams(values, vocabulary.params) as ShareParamValues<Codecs>,
  };
}

/**
 * Write a configuration into an address, leaving the tool's own inputs as they
 * were. A parameter left at its default is deleted rather than written, so an
 * unconfigured link stays a plain link.
 * @param search - The address as it stands, with or without its leading `?`.
 * @param config - The configuration to write.
 * @param vocabulary - What this site's links can say.
 * @returns The new query string, without its leading `?`.
 */
export function applyShareConfig<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(
  search: string,
  config: ShareConfig<Codecs>,
  vocabulary: ShareVocabulary<Codecs>,
): string {
  const codecs: ShareParamCodecs = vocabulary.params ?? {};
  const owned = new Set<string>([
    EMBED_PARAM,
    HIDE_PARAM,
    ...Object.keys(codecs),
  ]);
  const entries: QueryEntry[] = [];
  for (const entry of parseQuery(search)) {
    if (!owned.has(entry[0])) entries.push(entry);
  }
  if (config.embed) entries.push([EMBED_PARAM, '1']);
  const hidden = orderHidden(new Set(config.hidden), vocabulary.parts);
  if (hidden.length > 0) entries.push([HIDE_PARAM, hidden.join(',')]);
  const values = config.params as Readonly<Record<string, unknown>>;
  for (const [key, codec] of Object.entries(codecs)) {
    const raw = codec.serialize(values[key]);
    if (raw !== null) entries.push([key, raw]);
  }
  return serializeQuery(entries);
}

/**
 * Whether the link switches a part of the page off.
 *
 * Hidden means hidden, not disabled: the value a hidden control carries still
 * applies, so an embedder can preset what a visitor may not change.
 * @param config - The configuration in force.
 * @param key - The part to test.
 * @returns True when the part must not be rendered.
 */
export function isHidden(
  config: Pick<ShareConfig, 'hidden'>,
  key: string,
): boolean {
  return config.hidden.includes(key);
}

/**
 * Whether a configuration differs from an unconfigured link.
 * @param config - The configuration to test.
 * @param vocabulary - What this site's links can say.
 * @returns True when the link configures anything at all.
 */
export function isShareConfigured<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(config: ShareConfig<Codecs>, vocabulary: ShareVocabulary<Codecs>): boolean {
  return applyShareConfig('', config, vocabulary) !== '';
}

/**
 * The configuration a share dialog opens on: framed, with the parts a host
 * page has no use for already switched off. Someone who wants the whole site
 * is one click away; someone building a course tile should not have to tick
 * five boxes every time.
 * @param vocabulary - What this site's links can say.
 * @returns The configuration to start from.
 */
export function suggestedShareConfig<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(vocabulary: ShareVocabulary<Codecs>): ShareConfig<Codecs> {
  const hidden: string[] = [];
  for (const part of vocabulary.parts) {
    if (part.hiddenByDefault === true) hidden.push(part.key);
  }
  return { ...parseShareConfig('', vocabulary), embed: true, hidden };
}

function splitHidden(raw: string | undefined): ReadonlySet<string> {
  const asked = new Set<string>();
  if (raw === undefined) return asked;
  for (const entry of raw.split(',')) {
    const key = entry.trim();
    if (key !== '') asked.add(key);
  }
  return asked;
}

function orderHidden(
  asked: ReadonlySet<string>,
  parts: readonly HideablePart[],
): readonly string[] {
  const hidden: string[] = [];
  for (const part of parts) {
    if (asked.has(part.key)) hidden.push(part.key);
  }
  return hidden;
}

function readParams(
  values: ReadonlyMap<string, string>,
  codecs: ShareParamCodecs | undefined,
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (codecs === undefined) return params;
  for (const [key, codec] of Object.entries(codecs)) {
    params[key] = codec.parse(values.get(key) ?? null);
  }
  return params;
}
