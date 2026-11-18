/**
 * How a crystal is drawn: whole molecules or the atoms the cell cuts, whether
 * the box of the cell is drawn, and how many cells along each axis.
 */

import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { CrystalPacking } from '../core/crystalView.ts';
import { CELL_COUNT_RANGE, CRYSTAL_PACKINGS } from '../core/crystalView.ts';

/** Props of {@link CrystalViewControls}. */
export interface CrystalViewControlsProps {
  /** How the cell is drawn. */
  packing: CrystalPacking;
  onPackingChange: (packing: CrystalPacking) => void;
  /** Whether the box of the unit cell is drawn. */
  unitCell: boolean;
  onUnitCellChange: (unitCell: boolean) => void;
  /** Cells along each axis. */
  cells: number;
  onCellsChange: (cells: number) => void;
}

/**
 * The two rows of chips under a crystal.
 * @param props - See {@link CrystalViewControlsProps}.
 * @returns The chip bar.
 */
export function CrystalViewControls(
  props: CrystalViewControlsProps,
): ReactElement {
  const {
    packing,
    onPackingChange,
    unitCell,
    onUnitCellChange,
    cells,
    onCellsChange,
  } = props;
  const t = useChromeT();
  return (
    <div className="chip-bar no-print">
      <div className="chip-row">
        <div className="chip-row__label">{t('crystal3d.draw')}</div>
        <div className="chip-row__chips">
          {CRYSTAL_PACKINGS.map((value) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={packing === value}
              title={t(`crystal3d.packing.${value}Help`)}
              onClick={() => {
                onPackingChange(value);
              }}
            >
              {t(`crystal3d.packing.${value}`)}
            </button>
          ))}
          <button
            type="button"
            className="chip"
            aria-pressed={unitCell}
            title={t('crystal3d.unitCellHelp')}
            onClick={() => {
              onUnitCellChange(!unitCell);
            }}
          >
            {t('crystal3d.unitCell')}
          </button>
        </div>
      </div>
      <div className="chip-row">
        <div className="chip-row__label">{t('crystal3d.cells')}</div>
        <div className="chip-row__chips">
          {CELL_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              className="chip"
              aria-pressed={cells === count}
              onClick={() => {
                onCellsChange(count);
              }}
            >
              {`${count}×${count}×${count}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** One to four cells along each axis, which is what a shared link may ask for. */
const CELL_COUNTS: readonly number[] = Array.from(
  { length: CELL_COUNT_RANGE.maximum - CELL_COUNT_RANGE.minimum + 1 },
  (_, index) => CELL_COUNT_RANGE.minimum + index,
);
