export type { DemoLinkSpec } from './demoLinks.ts';
export { demoLabel, parseSingleLink, splitDemoLinks } from './demoLinks.ts';
export type { SectionHeading } from './sectionHeading.ts';
export { parseSectionHeading } from './sectionHeading.ts';
export type { SlideAction } from './slideNavigation.ts';
export { clampSlideIndex, slideActionForKey } from './slideNavigation.ts';
export type { Slide, Talk, TalkMeta } from './talk.ts';
export { parseTalk } from './talk.ts';
export type { TalkManifest, TalkSummary } from './talkManifest.ts';
export {
  buildTalkManifest,
  parseTalkManifest,
  talkSourceUrl,
  talkSummary,
} from './talkManifest.ts';
export type { TalkOrigin } from './talkOrigin.ts';
export {
  TALK_ORIGIN_PARAM,
  formatTalkOrigin,
  parseTalkOrigin,
  withTalkOrigin,
} from './talkOrigin.ts';
