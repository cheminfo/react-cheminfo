/**
 * The share dialog's draft and what it is read from: the configuration it
 * opens on, the one a link hands out, the part the preview marks, a preset by
 * its key.
 */

import type {
  HideablePart,
  ShareConfig,
  ShareParamCodecs,
  SharePreset,
  ShareVocabulary,
} from '../core/index.ts';
import {
  applySharePreset,
  canOpenSealedAddresses,
  isShareConfigured,
  parseShareConfig,
  suggestedShareConfig,
} from '../core/index.ts';

/**
 * The configuration a link hands out: a sealed page is always embedded,
 * whatever a preset said.
 * @param config - The draft.
 * @param sealed - Whether the link is sealed.
 * @returns The configuration written into the link.
 */
export function embeddedWhenSealed<Codecs extends ShareParamCodecs>(
  config: ShareConfig<Codecs>,
  sealed: boolean,
): ShareConfig<Codecs> {
  return sealed ? { ...config, embed: true } : config;
}

/**
 * The seal switch, offered only where a sealed address can be opened: a site
 * that never opens one must not hand one out.
 * @param setSealed - Seal the link.
 * @returns The switch's handler, or `undefined` when no sealed address opens here.
 */
export function offeredWhenOpened(
  setSealed: (sealed: boolean) => void,
): ((sealed: boolean) => void) | undefined {
  return canOpenSealedAddresses() ? setSealed : undefined;
}

/**
 * The draft a dialog opens on: the configuration the page runs, else the
 * suggested one with the default preset applied.
 * @param search - The page's query string.
 * @param vocabulary - What the site's links can say.
 * @param preset - The preset opened first, if any.
 * @returns The draft.
 */
export function initialDraft<Codecs extends ShareParamCodecs>(
  search: string,
  vocabulary: ShareVocabulary<Codecs>,
  preset: SharePreset<Codecs> | undefined,
): ShareConfig<Codecs> {
  const current = parseShareConfig(search, vocabulary);
  if (isShareConfigured(current, vocabulary)) return current;
  const suggested = suggestedShareConfig(vocabulary);
  return preset === undefined
    ? suggested
    : applySharePreset(suggested, preset, vocabulary);
}

/**
 * What the preview marks: the part the reader points at in the list, with
 * its name, since the name in the list and the box on the page are the same
 * thing.
 * @param parts - The parts a link can hide.
 * @param pointed - The part pointed at, or `null`.
 * @returns The part and its label, or `null`.
 */
export function highlightOf(
  parts: readonly HideablePart[],
  pointed: string | null,
): { part: string; label: string } | null {
  if (pointed === null) return null;
  for (const part of parts) {
    if (part.key === pointed) return { part: part.key, label: part.label };
  }
  return null;
}

/**
 * A preset by its key.
 * @param presets - The presets.
 * @param key - The key, or `null`.
 * @returns The preset, or `undefined`.
 */
export function findPreset<Codecs extends ShareParamCodecs>(
  presets: ReadonlyArray<SharePreset<Codecs>>,
  key: string | null,
): SharePreset<Codecs> | undefined {
  if (key === null) return undefined;
  for (const preset of presets) {
    if (preset.key === key) return preset;
  }
  return undefined;
}
