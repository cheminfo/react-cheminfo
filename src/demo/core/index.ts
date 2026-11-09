export type { DemoActionOptions, DemoActions } from './demoActions.ts';
export { createDemoActions } from './demoActions.ts';
export type { DemoCursor } from './demoCursor.ts';
export { createDemoCursor } from './demoCursor.ts';
export type { DemoPoint } from './demoEvents.ts';
export {
  DEMO_POINTER_ID,
  keepKeyboardOutside,
  tolerateDemoPointer,
} from './demoEvents.ts';
export type { DemoTarget } from './demoTargets.ts';
export { locate, pointIn } from './demoTargets.ts';
export type { Demo, DemoStep } from './serveDemo.ts';
export { serveDemo } from './serveDemo.ts';
