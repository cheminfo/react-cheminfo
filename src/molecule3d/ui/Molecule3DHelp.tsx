/**
 * What the mouse and the keyboard do on the molecule canvas, shown in the
 * toolbar's help popover.
 */

import { Classes } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { Molecule3DGesture } from '../core/gestures.ts';
import { MOLECULE_3D_GESTURES } from '../core/gestures.ts';

/**
 * The help panel.
 * @returns The panel.
 */
export function Molecule3DHelp(): ReactElement {
  return (
    <div style={PANEL_STYLE} data-testid="molecule3d-help">
      <div style={GRID_STYLE}>
        {MOLECULE_3D_GESTURES.map(({ input, action }) => (
          <div key={`${inputText(input)} ${action}`} style={ROW_STYLE}>
            <span style={INPUT_STYLE}>
              {input.map((part) =>
                typeof part === 'string' ? (
                  <span key={part}>{part}</span>
                ) : (
                  <kbd key={part.key} className={Classes.KEY}>
                    {part.key}
                  </kbd>
                ),
              )}
            </span>
            <span>{action}</span>
          </div>
        ))}
      </div>
      <p className={Classes.TEXT_MUTED} style={NOTE_STYLE}>
        Keys act while the pointer is over the molecule. On a Mac, Ctrl is the
        Control key, not ⌘. With a measuring tool on, a click picks an atom.
      </p>
    </div>
  );
}

function inputText(input: Molecule3DGesture['input']): string {
  return input
    .map((part) => (typeof part === 'string' ? part : part.key))
    .join(' ');
}

const PANEL_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: 360,
  padding: 12,
  fontSize: 12,
};

const GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'max-content minmax(0, 1fr)',
  alignItems: 'center',
  columnGap: 12,
  rowGap: 6,
};

const ROW_STYLE: CSSProperties = { display: 'contents' };

const INPUT_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  whiteSpace: 'nowrap',
};

const NOTE_STYLE: CSSProperties = { margin: 0 };
