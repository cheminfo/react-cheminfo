// Both travel with the catalogs: a server validating a submission and naming
// the language in a pull request must not have to load the whole of
// `react-cheminfo/core` to do it.
export { languageName } from '../../language/core/languageName.ts';
export { isLanguageTag } from '../../language/core/languageParam.ts';
export type { CatalogSource, MessageRef, Messages } from './catalog.ts';
export {
  SOURCE_LOCALE,
  catalogFile,
  isCatalogDirectory,
  ownMessage,
} from './catalog.ts';
export type { MessageProblem, MessageProblemKind } from './checkTranslation.ts';
export { checkTranslation, messageArguments } from './checkTranslation.ts';
export type {
  Contribution,
  ContributionCatalog,
  ContributionProblem,
  ContributionPullRequest,
  ContributionRejection,
  ContributionResult,
} from './contribution.ts';
export {
  MAX_CATALOGS,
  MAX_CONTRIBUTOR_LENGTH,
  MAX_MESSAGES_PER_CATALOG,
  MAX_MESSAGE_LENGTH,
  MAX_NOTE_LENGTH,
} from './contribution.ts';
export {
  encodeMarker,
  hasMarker,
  markText,
  readMarkers,
  stripMarkers,
} from './marker.ts';
export {
  changedKeys,
  mergeMessages,
  parseMessages,
  serializeMessages,
} from './mergeMessages.ts';
export type {
  CatalogSnapshot,
  MessageValues,
  TranslateBridge,
  TranslateSessionOptions,
} from './session.ts';
export { BRIDGE_GLOBAL, BRIDGE_PROTOCOL, TranslateSession } from './session.ts';
export type { StartTranslatingOptions } from './start.ts';
export {
  TRANSLATE_ORIGIN,
  TRANSLATE_PARAM,
  loadOverlay,
  readTranslateLocale,
  startTranslating,
} from './start.ts';
export type {
  MessageSuggestion,
  SuggestionKind,
  SuggestionOptions,
  TranslatedPair,
} from './suggestions.ts';
export { messageSimilarity, messageSuggestions } from './suggestions.ts';
export type {
  TableCell,
  TranslatableField,
  TranslatableFieldSize,
  TranslatableRow,
  TranslatableTable,
} from './tables.ts';
export { tableCells, tableKey } from './tables.ts';
