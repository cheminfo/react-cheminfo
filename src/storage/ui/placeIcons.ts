import type { IconName } from '@blueprintjs/core';

import type { SaveTarget } from '../core/documentFile.ts';
import type { PlaceKind } from '../core/documentPlace.ts';

/**
 * The icon of each place a document can be in, the same in the folder panel,
 * its toolbar, the Save dialogs and the line saying where the document on
 * screen is: a screen for this computer, a window for this browser, a dashed
 * circle for nowhere yet.
 */
export const PLACE_ICONS: Readonly<Record<PlaceKind, IconName>> = {
  computer: 'desktop',
  browser: 'application',
  nowhere: 'circle-dashed',
};

/** The icon of each place Save offers. */
export const TARGET_ICONS: Readonly<Record<SaveTarget, IconName>> = {
  file: PLACE_ICONS.computer,
  folder: PLACE_ICONS.computer,
  browser: PLACE_ICONS.browser,
  download: 'download',
};
