// The Playwright configuration the sites' browser suites share, and the
// helpers their specs measure and wait with. Types only from
// `@playwright/test`, so importing this entry loads no Playwright.
export type { CheminfoPlaywrightOptions } from './playwright/config.ts';
export {
  MAX_DEFAULT_WORKERS,
  WORKERS_ENV,
  cheminfoPlaywrightConfig,
} from './playwright/config.ts';
export type {
  DragSplitBarOptions,
  Rect,
  RectOfOptions,
  SplitShareOptions,
} from './playwright/split.ts';
export {
  dragSplitBar,
  rectOf,
  splitBar,
  splitShare,
} from './playwright/split.ts';
export type { PageErrorOptions } from './playwright/pageErrors.ts';
export { collectPageErrors } from './playwright/pageErrors.ts';
export {
  CANVAS_CHANGE_THRESHOLD,
  CANVAS_SIGNATURE_SIZE,
  canvasSignature,
  changedFraction,
  signatureLevels,
  signatureSpread,
  waitForCanvasChange,
  waitForCanvasPaint,
  waitForStableCanvas,
  waitForViewerPick,
} from './playwright/canvasSignature.ts';
export type { FoldReading } from './playwright/pageReaders.ts';
export {
  buildBadgePattern,
  readFold,
  readImagesLoaded,
} from './playwright/pageReaders.ts';
export { headCommit } from './playwright/headCommit.ts';
export type { StructureEditorBoxes } from './playwright/structureEditor.ts';
export { structureEditorBoxes } from './playwright/structureEditor.ts';
export type { NoFixedWaitConfig } from './playwright/lint.ts';
export { NO_FIXED_WAIT, noFixedWaitRules } from './playwright/lint.ts';
