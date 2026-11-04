/**
 * A stand-in host for a tool's end-to-end tests, the messages SciPeaks sends,
 * and the frames a chat or a page draws a card in. Node only: it serves a page, and
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
  readClipboardText,
  readClipboardTypes,
  readLastHeight,
  resetClipboard,
} from './host/testing/chatFrame.ts';
export type { CardFrameOptions } from './host/testing/cardFrame.ts';
export { frameAsCard, readOpenedAddress } from './host/testing/cardFrame.ts';
