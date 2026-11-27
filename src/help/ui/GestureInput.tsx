import type { CSSProperties, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { Gesture } from '../core/gestures.ts';

import { KeyCaps } from './KeyCaps.tsx';

/** Props of {@link GestureInput}. */
export interface GestureInputProps {
  /** The gesture's input: key caps, and the mouse words between them. */
  input: Gesture['input'];
  /**
   * How the catalog names one of the words between the caps.
   * @param text - The word, in English.
   * @returns Its id, or `undefined` for punctuation nobody translates.
   */
  wordId: (text: string) => string | undefined;
  /** The catalog prefix the words are translated under, e.g. `molecule3d.input`. */
  prefix: string;
  /**
   * What a cap shows for a key.
   * @default the key itself
   */
  label?: (key: string) => string;
}

/**
 * The left cell of a gesture's row: its keys as caps, its mouse words in the
 * page's language. A word between two caps is one catalog entry, shared by
 * every gesture that writes it.
 * @param props - See {@link GestureInputProps}.
 * @returns The cell.
 */
export function GestureInput(props: GestureInputProps): ReactElement {
  const { input, wordId, prefix, label } = props;
  const t = useChromeT();
  return (
    <span style={INPUT_STYLE}>
      {input.map((part) => {
        if (typeof part !== 'string') {
          return (
            <KeyCaps
              key={part.key}
              keys={[part.key]}
              {...(label === undefined ? {} : { label })}
            />
          );
        }
        const id = wordId(part);
        return (
          <span key={part}>
            {id === undefined ? part : t.or(`${prefix}.${id}`, part)}
          </span>
        );
      })}
    </span>
  );
}

const INPUT_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  whiteSpace: 'nowrap',
};
