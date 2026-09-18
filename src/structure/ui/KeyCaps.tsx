import { Classes } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { editorKeyLabel } from '../core/editorGuide.ts';

/**
 * Keys pressed together, each drawn as a key cap, `Mod` as the modifier the
 * editor listens to on this platform.
 * @param props - The keys.
 * @param props.keys - The keys, unique within the list.
 * @returns The key caps.
 */
export function KeyCaps(props: { keys: readonly string[] }): ReactElement {
  const isMac = isMacPlatform();
  return (
    <span style={KEYS_STYLE}>
      {props.keys.map((key) => (
        <kbd key={key} className={Classes.KEY}>
          {editorKeyLabel(key, isMac)}
        </kbd>
      ))}
    </span>
  );
}

/**
 * Whether the page runs on a Mac, decided as openchemlib decides it, so the
 * cap shown is the modifier the editor actually reads: ⌘ there, Ctrl elsewhere.
 * @returns True on a Mac.
 */
function isMacPlatform(): boolean {
  return typeof navigator !== 'undefined' && navigator.platform === 'MacIntel';
}

const KEYS_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  whiteSpace: 'nowrap',
};
