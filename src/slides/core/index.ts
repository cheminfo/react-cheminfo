export type { DemoLinkSpec } from './demoLinks.ts';
export type { DemoMessage } from './demoProtocol.ts';
export {
  DEMO_DONE,
  DEMO_FAILED,
  DEMO_PARAM,
  DEMO_READY,
  DEMO_STEP,
  readDemoMessage,
  readDemoName,
} from './demoProtocol.ts';
export type { EmbedAddress } from './embedAddress.ts';
export { splitEmbedAddress } from './embedAddress.ts';
export { demoLabel, parseSingleLink, splitDemoLinks } from './demoLinks.ts';
export type { SectionHeading } from './sectionHeading.ts';
export { parseSectionHeading } from './sectionHeading.ts';
export type { SlideAction, SlideDirection } from './slideNavigation.ts';
export {
  clampSlideIndex,
  slideActionForKey,
  slideDirectionForKey,
} from './slideNavigation.ts';
export type { SlidePosition, SlideSteps } from './slideSteps.ts';
export {
  STEPS_LAYOUT,
  nextPosition,
  previousPosition,
  slideStepCount,
  splitSteps,
  talkStepCounts,
} from './slideSteps.ts';
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
export { parseTalkOrigin, withTalkOrigin } from './talkOrigin.ts';
