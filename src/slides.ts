export * from './slides/ui/index.ts';
export type { DemoLinkSpec } from './slides/core/demoLinks.ts';
export { demoLabel, splitDemoLinks } from './slides/core/demoLinks.ts';
export { framedLocally } from './slides/core/localFrame.ts';
export type {
  MoleculeGridShape,
  NamedMolecule,
} from './slides/core/moleculeList.ts';
export {
  MAXIMUM_MOLECULES,
  moleculeGridShape,
  parseMoleculeList,
} from './slides/core/moleculeList.ts';
export { PLAYER_LAYOUTS } from './slides/core/playerLayouts.ts';
export { openRoutedAddress } from './slides/core/routedAddress.ts';
export type {
  SiteTalk,
  SiteTalks,
  SiteTalksOptions,
} from './slides/core/siteTalks.ts';
export {
  createSiteTalks,
  readTalkSources,
  talkIdFromPath,
} from './slides/core/siteTalks.ts';
export type { SlideParamCodec } from './slides/core/slideAddress.ts';
export {
  SLIDE_PARAM,
  slideParam,
  withSlideParam,
} from './slides/core/slideAddress.ts';
export type { SplitSlideHeading } from './slides/core/slideHeading.ts';
export { slideHeading, splitSlideHeading } from './slides/core/slideHeading.ts';
export type {
  EndSites,
  MarkerOptions,
  SlideGlyphMarker,
  TakenMarker,
} from './slides/core/slideMarker.ts';
export {
  parseMarkerOptions,
  readEndSites,
  readSlideGlyph,
  takeSlideMarker,
} from './slides/core/slideMarker.ts';
export { clampSlideIndex } from './slides/core/slideNavigation.ts';
export type { Slide, Talk, TalkMeta } from './slides/core/talk.ts';
export { parseTalk } from './slides/core/talk.ts';
export type { TalkManifest, TalkSummary } from './slides/core/talkManifest.ts';
export {
  openTalk,
  showTalkSlide,
  talkSlideRoute,
} from './slides/core/talkNavigation.ts';
export type {
  FollowTalkOriginOptions,
  TalkOrigin,
} from './slides/core/talkOrigin.ts';
export {
  followTalkOrigin,
  parseTalkOrigin,
  resolveTalkAddress,
  slideOriginOf,
} from './slides/core/talkOrigin.ts';
export { talkPageContent, talkRoute } from './slides/core/talkRoutes.ts';
