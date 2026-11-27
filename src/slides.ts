export * from './slides/ui/index.ts';
export type { DemoLinkSpec } from './slides/core/demoLinks.ts';
export { demoLabel, splitDemoLinks } from './slides/core/demoLinks.ts';
export { clampSlideIndex } from './slides/core/slideNavigation.ts';
export type { Slide, Talk, TalkMeta } from './slides/core/talk.ts';
export { parseTalk } from './slides/core/talk.ts';
export type { TalkManifest, TalkSummary } from './slides/core/talkManifest.ts';
export type { TalkOrigin } from './slides/core/talkOrigin.ts';
export { parseTalkOrigin } from './slides/core/talkOrigin.ts';
