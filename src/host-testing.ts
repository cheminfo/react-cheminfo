/**
 * A stand-in host for a tool's end-to-end tests, and the messages SciPeaks
 * sends. Node only: it serves a page.
 */

export type {
  StandInHost,
  StandInHostLog,
} from './host/testing/standInHost.ts';
export {
  readStandInHostLog,
  startStandInHost,
} from './host/testing/standInHost.ts';
export {
  SCIPEAKS_ETHYLBENZENE_LOAD,
  SCIPEAKS_ETHYLBENZENE_MOLFILE,
  SCIPEAKS_HOST_NAME,
} from './host/testing/sciPeaks.ts';
