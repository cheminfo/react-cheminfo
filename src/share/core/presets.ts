import type { ShareConfig } from './config.ts';
import { applyShareConfig } from './config.ts';
import type {
  ShareParamCodecs,
  ShareParamValues,
  ShareVocabulary,
} from './vocabulary.ts';

/**
 * A ready-made link the share dialog offers as one tab: the handful of
 * configurations a site knows people actually hand out, so building one is a
 * click rather than six boxes.
 */
export interface SharePreset<
  Codecs extends ShareParamCodecs = Record<string, never>,
> {
  /** Names the preset among the others of the dialog. */
  key: string;
  /** The tab label, a few words. */
  label: string;
  /** One sentence saying what the link shows, for the person building it. */
  description: string;
  /**
   * Whether the link drops the site chrome.
   * @default true
   */
  embed?: boolean;
  /**
   * The parts the link switches off. A key the vocabulary does not list is
   * ignored.
   * @default []
   */
  hidden?: readonly string[];
  /**
   * The tool's own parameters the preset pins. A parameter it does not name
   * keeps the value the draft holds.
   * @default {}
   */
  params?: Partial<ShareParamValues<Codecs>>;
}

/**
 * The configuration a preset turns a draft into.
 * @param config - The draft as it stands.
 * @param preset - The preset to apply.
 * @param vocabulary - What this site's links can say.
 * @returns The draft with the preset's layout, parts and parameters.
 */
export function applySharePreset<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(
  config: ShareConfig<Codecs>,
  preset: SharePreset<Codecs>,
  vocabulary: ShareVocabulary<Codecs>,
): ShareConfig<Codecs> {
  const asked = new Set(preset.hidden);
  const hidden: string[] = [];
  for (const part of vocabulary.parts) {
    if (asked.has(part.key)) hidden.push(part.key);
  }
  return {
    embed: preset.embed ?? true,
    hidden,
    params: { ...config.params, ...preset.params },
  };
}

/**
 * The preset a draft already is, judged by the link both would write, so a
 * part the layout makes meaningless does not tell them apart.
 * @param config - The draft to recognise.
 * @param presets - The presets the dialog offers.
 * @param vocabulary - What this site's links can say.
 * @returns The first preset writing the same link, or `undefined`.
 */
export function findSharePreset<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(
  config: ShareConfig<Codecs>,
  presets: ReadonlyArray<SharePreset<Codecs>>,
  vocabulary: ShareVocabulary<Codecs>,
): SharePreset<Codecs> | undefined {
  const link = applyShareConfig('', config, vocabulary);
  for (const preset of presets) {
    const presetConfig = applySharePreset(config, preset, vocabulary);
    if (applyShareConfig('', presetConfig, vocabulary) === link) return preset;
  }
  return undefined;
}
