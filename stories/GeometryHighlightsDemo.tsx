import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { MoleculeViewer3D } from '../src/molecule3d/ui/MoleculeViewer3D.tsx';
import type { MoleculeViewer3DProps } from '../src/molecule3d/ui/moleculeViewer3DProps.ts';

import { ACETONE_GEOMETRY } from './acetoneFixtures.ts';

/** The row the story opens on: C–H ×6. */
const FIRST_CHOSEN = 3;

/**
 * The viewer beside the rows of a geometry card. The row under the pointer or
 * holding the focus is highlighted on the model, as on the card; otherwise the
 * row last clicked is.
 * @param props - Whatever the story's controls hold.
 * @returns The viewer and the rows.
 */
export function GeometryHighlightsDemo(
  props: MoleculeViewer3DProps,
): ReactElement {
  const [chosen, setChosen] = useState(FIRST_CHOSEN);
  const [pointed, setPointed] = useState<number | null>(null);
  const shown = ACETONE_GEOMETRY[pointed ?? chosen] ?? ACETONE_GEOMETRY[0];

  return (
    <div style={DEMO_STYLE}>
      <div style={VIEWER_STYLE}>
        <MoleculeViewer3D {...props} highlights={shown?.highlights} />
      </div>
      <div style={ROWS_STYLE} role="group" aria-label="Geometry">
        {ACETONE_GEOMETRY.map((row, index) => (
          <button
            key={row.label}
            type="button"
            aria-pressed={index === chosen}
            style={index === chosen ? CHOSEN_ROW_STYLE : ROW_STYLE}
            onClick={() => setChosen(index)}
            onPointerEnter={() => setPointed(index)}
            onPointerLeave={() => setPointed(null)}
            onFocus={() => setPointed(index)}
            onBlur={() => setPointed(null)}
          >
            {row.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const DEMO_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'start',
  gap: 12,
  width: 'min(48rem, 92vw)',
};

const VIEWER_STYLE: CSSProperties = { height: 420, display: 'flex' };

const ROWS_STYLE: CSSProperties = {
  display: 'grid',
  gap: 4,
  fontSize: 13,
};

const ROW_STYLE: CSSProperties = {
  padding: '4px 10px',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--border)',
  borderRadius: 6,
  background: 'var(--surface)',
  color: 'var(--text)',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
};

const CHOSEN_ROW_STYLE: CSSProperties = {
  ...ROW_STYLE,
  borderColor: 'var(--accent)',
  color: 'var(--accent)',
};
