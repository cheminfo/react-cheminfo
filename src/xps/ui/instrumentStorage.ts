/**
 * The part of the workspace that outlives the page: the instruments the reader
 * entered, which of them quantifies, and over which background.
 *
 * A laboratory types its sensitivity factors in once. Losing them with the tab
 * would make the table something nobody fills in, so they are kept in this
 * browser — best effort, as everything a framed page keeps, since a page
 * embedded in another site may have no storage at all.
 */

import type { PersistedBucket } from '../../state/core/persistBucket.ts';
import { persistBucket } from '../../state/core/persistBucket.ts';
import type { XpsSettings } from '../core/xpsState.ts';
import { DEFAULT_SETTINGS } from '../core/xpsState.ts';

/** The settings kept between visits. */
export type StoredQuantification = Pick<
  XpsSettings,
  'instrumentId' | 'instruments' | 'surveyBackground'
>;

/** The bucket a viewer keeps its instruments in unless told otherwise. */
export const DEFAULT_INSTRUMENT_STORAGE_KEY = 'react-cheminfo:xps-instruments';

/**
 * The bucket the instruments are kept in.
 * @param key - Its name.
 * @returns The bucket; what it reads is checked by the settings merge.
 */
export function instrumentBucket(
  key: string,
): PersistedBucket<StoredQuantification> {
  return persistBucket<StoredQuantification>({
    key,
    defaults: storedPart(DEFAULT_SETTINGS),
  });
}

/**
 * What of a workspace is kept between visits.
 * @param settings - The workspace.
 * @returns The instruments, the one chosen and the background.
 */
export function storedPart(settings: XpsSettings): StoredQuantification {
  const { instrumentId, instruments, surveyBackground } = settings;
  return { instrumentId, instruments, surveyBackground };
}
