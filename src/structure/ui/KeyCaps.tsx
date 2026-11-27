import type { ReactElement } from 'react';

import { KeyCaps as FamilyKeyCaps } from '../../help/ui/KeyCaps.tsx';
import { editorKeyCap } from '../core/editorGuide.ts';

/**
 * Keys pressed together, each drawn as a key cap, `Mod` as the modifier the
 * editor listens to on this platform.
 * @param props - The keys.
 * @param props.keys - The keys, unique within the list.
 * @returns The key caps.
 */
export function KeyCaps(props: { keys: readonly string[] }): ReactElement {
  return <FamilyKeyCaps keys={props.keys} label={editorKeyCap} />;
}
