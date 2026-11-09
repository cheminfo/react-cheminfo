// What a tool needs to play its demos on a steps slide: the cursor, the
// actions a step plays through it, and the runner hearing the slide. It is
// its own entry point because only a page opened with `?demo=` loads it.
export * from './demo/core/index.ts';
export type { DemoMessage } from './slides/core/demoProtocol.ts';
export {
  DEMO_DONE,
  DEMO_FAILED,
  DEMO_PARAM,
  DEMO_READY,
  DEMO_STEP,
  readDemoMessage,
  readDemoName,
} from './slides/core/demoProtocol.ts';
