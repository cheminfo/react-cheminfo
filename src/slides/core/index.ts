export type { DemoLinkSpec } from './demoLinks.ts';
export { demoLabel, splitDemoLinks } from './demoLinks.ts';
export { readDemoName } from './demoProtocol.ts';
export { clampSlideIndex } from './slideNavigation.ts';
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
export { parseTalkOrigin } from './talkOrigin.ts';
