/**
 * What the mouse and the keyboard do on the molecule canvas, shown in the
 * toolbar's help popover.
 */

import { Classes } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { gestureRowKey } from '../../help/core/gestures.ts';
import { GestureInput } from '../../help/ui/GestureInput.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import {
  MOLECULE_3D_GESTURES,
  molecule3dInputWordId,
} from '../core/gestures.ts';

/**
 * The help panel.
 * @returns The panel.
 */
export function Molecule3DHelp(): ReactElement {
  const t = useChromeT();

  return (
    <div style={PANEL_STYLE} data-testid="molecule3d-help">
      <div style={GRID_STYLE}>
        {MOLECULE_3D_GESTURES.map((gesture) => (
          <div key={gestureRowKey(gesture)} style={ROW_STYLE}>
            <GestureInput
              input={gesture.input}
              wordId={molecule3dInputWordId}
              prefix="molecule3d.input"
            />
            <span>
              {t.or(`molecule3d.gesture.${gesture.id}`, gesture.action)}
            </span>
          </div>
        ))}
      </div>
      <p className={Classes.TEXT_MUTED} style={NOTE_STYLE}>
        {t('molecule3d.helpNote')}
      </p>
    </div>
  );
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

const NOTE_STYLE: CSSProperties = { margin: 0 };
