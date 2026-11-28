/**
 * A stand-in host for a tool's end-to-end tests, the messages SciPeaks sends,
 * the frames a chat or a page draws a card in, and the reads a spec makes of
 * the family's share dialog, copy and card. Node only: it serves a page, and
 * drives Playwright's.
 */

export type {
  StandInHost,
  StandInHostLog,
} from './host/testing/standInHost.ts';
export {
  readStandInHostLog,
  sendStandInHostRequest,
  startStandInHost,
} from './host/testing/standInHost.ts';
export type { StandInTool, ToolLog } from './host/testing/standInTool.ts';
export {
  readToolLog,
  standInTool,
  switchedFrame,
  toolFrame,
  toolFrameAt,
} from './host/testing/standInTool.ts';
export {
  SCIPEAKS_ETHYLBENZENE_LOAD,
  SCIPEAKS_ETHYLBENZENE_MOLFILE,
  SCIPEAKS_HOST_NAME,
} from './host/testing/sciPeaks.ts';
export {
  SCIPEAKS_ETHYLBENZENE_IR_FILENAME,
  SCIPEAKS_ETHYLBENZENE_IR_PEAKS,
  sciPeaksEthylbenzeneIrLoad,
} from './host/testing/sciPeaksIr.ts';
export {
  SCIPEAKS_ETHYLBENZENE_RAMAN_FILENAME,
  SCIPEAKS_ETHYLBENZENE_RAMAN_MAP_FILENAME,
  SCIPEAKS_ETHYLBENZENE_RAMAN_PEAKS,
  sciPeaksEthylbenzeneRamanLoad,
} from './host/testing/sciPeaksRaman.ts';
export type {
  ChatFrameLog,
  ChatFrameOptions,
} from './host/testing/chatFrame.ts';
export {
  frameAsChat,
  readChatFrameLog,
  readClipboardHtml,
  readClipboardText,
  readClipboardTypes,
  readLastHeight,
  resetClipboard,
} from './host/testing/chatFrame.ts';
export type { CardFrameOptions } from './host/testing/cardFrame.ts';
export { frameAsCard, readOpenedAddress } from './host/testing/cardFrame.ts';
export type {
  StandInHostFigureAnswer,
  StandInHostWaitOptions,
} from './host/testing/standInHostPage.ts';
export {
  framedAddress,
  framedParameter,
  framedSite,
  sendWhenConnected,
  standInHostAnswer,
  standInHostFigure,
  standInHostNextResult,
  standInHostResults,
} from './host/testing/standInHostPage.ts';
export type { CopiedFrameOptions } from './host/testing/shareDialog.ts';
export {
  copiedFrame,
  shareDialog,
  sharedLink,
} from './host/testing/shareDialog.ts';
export type { CopyByClickOptions } from './host/testing/copyByClick.ts';
export { copyByClick } from './host/testing/copyByClick.ts';
export type {
  ToolAnswer,
  ToolCallOptions,
  ToolCard,
} from './host/testing/toolCard.ts';
export {
  CARD_META_KEY,
  readToolAnswer,
  readToolCard,
} from './host/testing/toolCard.ts';
export type { SandboxFrameOptions } from './host/testing/sandboxFrame.ts';
export {
  frameInSandbox,
  readFrameOrigin,
} from './host/testing/sandboxFrame.ts';
export type { SettledCardHeightOptions } from './host/testing/cardHeight.ts';
export {
  readDrawnHeight,
  settledCardHeight,
} from './host/testing/cardHeight.ts';
export { stubFolderPicker } from './host/testing/folderPicker.ts';
export type {
  SaveFigureOptions,
  SavedFigure,
} from './host/testing/figureSave.ts';
export { saveFigureWithShortcut } from './host/testing/figureSave.ts';
