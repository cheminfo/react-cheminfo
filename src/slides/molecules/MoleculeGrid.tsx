import { Molecule } from 'openchemlib';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { SvgRenderer } from 'react-ocl';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { NamedMolecule } from '../core/moleculeList.ts';
import { moleculeGridShape } from '../core/moleculeList.ts';

/** What {@link MoleculeGrid} draws. */
export interface MoleculeGridProps {
  /** The molecules, each with the name written under it. */
  molecules: readonly NamedMolecule[];
}

/** How wide the figure column of a slide is, in canvas pixels. */
const FIGURE_WIDTH = 870;

/** How tall the figure column of a slide is, names included. */
const GRID_HEIGHT = 780;

/** Room between two structures, across and down, as `slides.css` sets it. */
const GAP = { across: 32, down: 24 } as const;

/** Room a name takes under its structure. */
const NAME_ROOM = 64;

/** The longest bond a structure is drawn with: alone, and one of several. */
const LONGEST_BOND = { alone: 120, several: 60 } as const;

/** How openchemlib writes the atoms and crops the drawing. */
const DRAWING = {
  autoCrop: true,
  autoCropMargin: 4,
  factorTextSize: 1.2,
} as const;

/** The box openchemlib draws in: large enough that `maxAVBL` sets the size. */
const DRAWING_BOX = 2000;

/** The bond length the structures are measured at, before they are scaled. */
const REFERENCE_BOND = 30;

/** The thinnest bond line drawn: a room reads it from the back. */
const THINNEST_LINE = 3;

/**
 * The structures of a `molecules` slide, each over its name: one alone fills
 * the figure, several share it in rows of up to three. Every structure of a
 * slide is drawn with the same bond length, the longest at which all of them
 * fit their cells, so their sizes compare as the molecules' do.
 * @param props - See {@link MoleculeGridProps}.
 * @returns The grid.
 */
export function MoleculeGrid(props: MoleculeGridProps): ReactElement {
  const { molecules } = props;
  const t = useChromeT();
  const { columns, rows } = moleculeGridShape(molecules.length);
  const alone = molecules.length === 1;
  const width = Math.floor(
    (FIGURE_WIDTH - (columns - 1) * GAP.across) / columns,
  );
  const height = Math.floor(
    (GRID_HEIGHT - (rows - 1) * GAP.down) / rows - NAME_ROOM,
  );
  const longest = alone ? LONGEST_BOND.alone : LONGEST_BOND.several;
  const { bond, entries } = useMemo(
    () => readMolecules(molecules, { width, height }, longest),
    [molecules, width, height, longest],
  );

  const cells: ReactElement[] = [];
  for (const { key, label, molecule } of entries) {
    cells.push(
      <figure key={key} className="molecule-grid__cell">
        <div className="molecule-grid__drawing">
          {molecule === null ? (
            <p className="chem-figure-message">
              {t('slides.unreadableSmiles')}
            </p>
          ) : (
            <SvgRenderer
              molecule={molecule}
              width={width}
              height={height}
              maxAVBL={bond}
              strokeWidth={Math.max(THINNEST_LINE, bond * 0.06)}
              {...DRAWING}
            />
          )}
        </div>
        {label === '' ? null : (
          <figcaption className="molecule-grid__name">{label}</figcaption>
        )}
      </figure>,
    );
  }

  return (
    <div
      className={alone ? 'molecule-grid molecule-grid--alone' : 'molecule-grid'}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {cells}
    </div>
  );
}

/** One molecule of the grid, read. */
interface GridEntry {
  /** The SMILES and how many times it came before, unique on the slide. */
  key: string;
  /** What is written under it. */
  label: string;
  /** The molecule, `null` when its SMILES cannot be read. */
  molecule: Molecule | null;
}

/**
 * Read every SMILES and find the bond length all the structures fit their
 * cells at: each is measured once at a reference length, and a drawing grows
 * in proportion to its bonds, its letters included.
 * @param molecules - The molecules of the slide.
 * @param cell - The room each structure has, in pixels.
 * @param cell.width - Across.
 * @param cell.height - Down, its name left out.
 * @param longest - The longest bond allowed, in pixels.
 * @returns The bond length, and each molecule read.
 */
function readMolecules(
  molecules: readonly NamedMolecule[],
  cell: { width: number; height: number },
  longest: number,
): { bond: number; entries: GridEntry[] } {
  let bond = longest;
  const seen = new Map<string, number>();
  const entries: GridEntry[] = [];
  for (const { label, smiles } of molecules) {
    const repeat = seen.get(smiles) ?? 0;
    seen.set(smiles, repeat + 1);
    const molecule = readSmiles(smiles);
    entries.push({ key: `${smiles}#${repeat}`, label, molecule });
    if (molecule === null) continue;
    const svg = molecule.toSVG(DRAWING_BOX, DRAWING_BOX, 'measure', {
      ...DRAWING,
      maxAVBL: REFERENCE_BOND,
    });
    const size = DRAWING_SIZE.exec(svg)?.groups;
    const scale = Math.min(
      cell.width / Number(size?.width ?? cell.width),
      cell.height / Number(size?.height ?? cell.height),
    );
    bond = Math.min(bond, Math.floor(REFERENCE_BOND * scale * FIT_MARGIN));
  }
  return { bond, entries };
}

/**
 * Read a SMILES a deck's author typed.
 * @param smiles - The SMILES.
 * @returns The molecule, or `null` when openchemlib cannot read it.
 */
function readSmiles(smiles: string): Molecule | null {
  try {
    return Molecule.fromSmiles(smiles);
  } catch {
    return null;
  }
}

/** How much of its cell the largest structure fills. */
const FIT_MARGIN = 0.96;

const DRAWING_SIZE = /width="(?<width>[\d.]+)px" height="(?<height>[\d.]+)px"/;
