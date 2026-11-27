import { Classes } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

/** Props of {@link KeyCaps}. */
export interface KeyCapsProps {
  /** The keys pressed together, unique within the list. */
  keys: readonly string[];
  /**
   * What a cap shows for a key, such as the platform's modifier for `Mod`.
   * @default the key itself
   */
  label?: (key: string) => string;
}

/**
 * Keys pressed together, each drawn as a key cap.
 * @param props - See {@link KeyCapsProps}.
 * @returns The key caps.
 */
export function KeyCaps(props: KeyCapsProps): ReactElement {
  const { keys, label } = props;
  return (
    <span style={KEYS_STYLE}>
      {keys.map((key) => (
        <kbd key={key} className={Classes.KEY}>
          {label === undefined ? key : label(key)}
        </kbd>
      ))}
    </span>
  );
}

const KEYS_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  whiteSpace: 'nowrap',
};
