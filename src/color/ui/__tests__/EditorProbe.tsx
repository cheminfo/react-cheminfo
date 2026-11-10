import { useState } from 'react';

import type { ColorScale } from '../../core/interpolate.ts';
import { ColorScaleEditor } from '../ColorScaleEditor.tsx';

/** What {@link EditorProbe} needs. */
export interface EditorProbeProps {
  /** The scale it opens on. */
  initial: ColorScale;
  /** Called with every scale the editor hands up. */
  onChange: (scale: ColorScale) => void;
}

/**
 * The editor held as a page holds it: the scale kept in state, so every edit
 * the editor hands up is what it is drawn with next.
 * @param props - See {@link EditorProbeProps}.
 * @returns The editor.
 */
export function EditorProbe(props: EditorProbeProps) {
  const { initial, onChange } = props;
  const [scale, setScale] = useState(initial);
  return (
    <ColorScaleEditor
      value={scale}
      onChange={(next) => {
        onChange(next);
        setScale(next);
      }}
    />
  );
}
