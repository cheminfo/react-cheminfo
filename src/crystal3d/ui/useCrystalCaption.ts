/**
 * One line under a crystal saying what is on it: its name, what one cell
 * holds, and how many cells are drawn.
 */

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { CrystalView } from '../core/crystalView.ts';

/**
 * The caption of a crystal view.
 * @param name - What the crystal is called; left out when empty.
 * @param view - What `crystalView` found.
 * @param asked - Cells along each axis asked for.
 * @returns e.g. `Aspirin · 4 molecules per cell · 2×2×2 cells`.
 */
export function useCrystalCaption(
  name: string,
  view: Pick<CrystalView, 'molecules' | 'atomsPerCell' | 'cells'>,
  asked: number,
): string {
  const t = useChromeT();
  const parts = [
    name,
    view.molecules > 0
      ? t('crystal3d.caption.molecules', { count: view.molecules })
      : t('crystal3d.caption.atoms', { count: view.atomsPerCell }),
    view.cells < asked
      ? t('crystal3d.caption.cellsCapped', { count: view.cells, asked })
      : t('crystal3d.caption.cells', { count: view.cells }),
  ];
  return parts.filter((part) => part !== '').join(' · ');
}
