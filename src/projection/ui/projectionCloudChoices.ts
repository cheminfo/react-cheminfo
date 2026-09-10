/**
 * What the cloud's own settings offer.
 *
 * One list, read by the value menu on the bar and by the segmented control in
 * the panel behind the cog, so the two can never offer different words for the
 * same thing.
 */

import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';

/**
 * What a plain drag does.
 *
 * Written as the action rather than as the name of a mode: `Turn` and `Select`
 * are what the reader's hand is about to do, where `Orbit` would be a state
 * they have to translate first.
 */
export const CLOUD_GESTURE_CHOICES: ReadonlyArray<OverlayOption<CloudGesture>> =
  [
    { value: 'turn', label: 'Turn' },
    { value: 'select', label: 'Select' },
  ];
