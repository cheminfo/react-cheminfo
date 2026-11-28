export type { ShareConfig } from './config.ts';
export {
  EMBED_PARAM,
  HIDE_PARAM,
  applyShareConfig,
  formatHiddenParts,
  isHidden,
  isShareConfigured,
  parseShareConfig,
  readHiddenParts,
  suggestedShareConfig,
  visibleShareParts,
} from './config.ts';
export { escapeAttribute, escapeText } from './escape.ts';
export type { ExampleMark } from './exampleMark.ts';
export { createExampleMark } from './exampleMark.ts';
export type { KeySetParamOptions } from './keySetParam.ts';
export { keySetParam } from './keySetParam.ts';
export {
  MAX_LINK_TOKEN,
  packLinkValue,
  packLinkValueIfFits,
  unpackLinkValue,
} from './linkValue.ts';
export type {
  OpensOnAddresses,
  OpensOnChoice,
  OpensOnLinks,
  OpensOnTarget,
  ScreenLink,
  ShareAddress,
  ShareExample,
  ShareOnScreen,
} from './opensOn.ts';
export {
  EXAMPLE_PARAM,
  WORKSPACE_PARAM,
  defaultOpensOn,
  opensOnLinks,
} from './opensOn.ts';
export type { PageShareConfig } from './pageShareConfig.ts';
export { createPageShareConfig } from './pageShareConfig.ts';
export type {
  BooleanParamOptions,
  IntegerParamOptions,
  NumberParamOptions,
  ShareParamCodec,
  StringParamOptions,
} from './params.ts';
export {
  booleanParam,
  enumParam,
  integerParam,
  numberParam,
  stringParam,
} from './params.ts';
export type {
  PreferenceHistory,
  PreferenceLocation,
  SyncPreferencesOptions,
  UrlPreference,
  UrlPreferences,
} from './preferences.ts';
export {
  applyPreferencesFromSearch,
  pinnedPreferenceSearch,
  preferenceEffect,
  syncPreferencesWithUrl,
  writePreferencesToSearch,
} from './preferences.ts';
export type { SharePreset } from './presets.ts';
export { applySharePreset, findSharePreset } from './presets.ts';
export type { SealProblem, UnsealResult } from './seal.ts';
export { sealQuery, sealShareUrl, unsealQuery } from './seal.ts';
export type { SealedAddress } from './sealedAddress.ts';
export { openSealedAddress } from './sealedAddress.ts';
export type { EmbedCodeOptions, ShareUrlOptions } from './url.ts';
export { buildEmbedCode, buildShareUrl } from './url.ts';
export type {
  HideablePart,
  ShareParamCodecs,
  ShareParamValues,
  ShareVocabulary,
} from './vocabulary.ts';
