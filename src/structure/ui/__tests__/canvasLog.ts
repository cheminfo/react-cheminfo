/**
 * What react-ocl's stand-in editors were mounted with, and a pen on the one
 * mounted last — kept apart from the components of `canvasEditorStandIn.tsx`
 * so that file holds components only.
 */

import type { CanvasEditorInputFormat } from 'react-ocl';

/** What one editor was mounted with. */
export interface CanvasMount {
  /** Which of the two editors it is. */
  mode: 'molecule' | 'reaction';
  /** How its first value is written. */
  inputFormat: CanvasEditorInputFormat | undefined;
  /** Its first value. */
  inputValue: string | undefined;
  /** Whether it draws a query fragment. */
  fragment: boolean | undefined;
}

/** Every mount, in order, and a pen on the editor mounted last. */
export const canvas: {
  mounts: CanvasMount[];
  draw: (smiles: string) => void;
} = {
  mounts: [],
  draw: () => {
    throw new Error('no canvas editor is mounted');
  },
};

/**
 * Forget every mount, before a test.
 */
export function resetCanvas(): void {
  canvas.mounts.length = 0;
}
