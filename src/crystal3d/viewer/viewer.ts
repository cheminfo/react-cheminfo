/**
 * The viewer a crystal page drives: a structure, a cell, a set of symmetry
 * elements, and an operation applied to the first of them.
 *
 * Nothing here parses a space group or expands an orbit. The atoms arrive in
 * their final places, because molstar's own expansion neither wraps into the
 * cell nor deduplicates a special position, and falls back to `P 1` without a
 * word on several common settings.
 */

import { clearMeasurements } from '../../molstar/core/index.ts';
import type { CrystalBonds } from '../core/crystalView.ts';
import { mergeDrawings, withoutDrawings } from '../core/drawingSet.ts';
import type {
  CellRepeat,
  SymmetryDrawing,
  UnitCell,
  ViewerAtom,
  ViewerOperation,
} from '../core/types.ts';

import type { PlayOptions } from './animate.ts';
import {
  playOperation,
  resetOperation,
  setOperationFraction,
} from './animate.ts';
import type { CrystalViewerOptions } from './plugin.ts';
import { CrystalViewerPlugin } from './plugin.ts';
import type { CellStyle } from './renderCell.ts';
import type { ElementLayerStyle } from './renderElements.ts';
import type { StructureStyle } from './renderStructure.ts';
import { setStructureBonds } from './renderStructure.ts';
import { drawCell, drawElements, drawStructure } from './sceneParts.ts';

/**
 * Create a crystal viewer inside `container` and start initialising it.
 * @param container - An element with `position: relative`; molstar inserts its
 *   own canvas into it.
 * @param options - See {@link CrystalViewerOptions}.
 * @returns A handle that is safe to dispose immediately.
 */
export function createCrystalViewer(
  container: HTMLElement,
  options: CrystalViewerOptions = {},
): CrystalViewer {
  return new CrystalViewer(container, options);
}

/**
 * Everything a crystal page draws, on one canvas: the lifecycle, the camera,
 * the measurements and the hover readout come from {@link CrystalViewerPlugin},
 * the scene is here.
 */
export class CrystalViewer extends CrystalViewerPlugin {
  #drawings: readonly SymmetryDrawing[] = [];
  #elementStyle: ElementLayerStyle = {};
  #bonds: CrystalBonds = 'all';

  /**
   * The symmetry elements drawn right now, in drawing order.
   * @returns The drawings on screen.
   */
  get elements(): readonly SymmetryDrawing[] {
    return this.#drawings;
  }

  /**
   * Replace the atoms on screen.
   * @param atoms - The whole scene, expanded and repeated already, in Cartesian
   *   ångström. An empty list clears them.
   * @param style - See {@link StructureStyle}; its bonds are the ones last
   *   set by {@link CrystalViewer.setBonds}.
   * @returns Resolves once the atoms are drawn.
   */
  showStructure(
    atoms: readonly ViewerAtom[],
    style?: Omit<StructureStyle, 'bonds'>,
  ): Promise<void> {
    // A measurement names atoms of the structure it was taken on.
    return this.run(async (plugin) => {
      await clearMeasurements(plugin);
      await drawStructure(plugin, atoms, { ...style, bonds: this.#bonds });
    });
  }

  /**
   * Draw other bonds, on the atoms on screen and on every later structure. The
   * atoms are not drawn again, so the camera stays where it is.
   * @param bonds - Which bonds are drawn.
   * @returns Resolves once they are drawn.
   */
  setBonds(bonds: CrystalBonds): Promise<void> {
    if (bonds === this.#bonds) return Promise.resolve();
    this.#bonds = bonds;
    return this.run((plugin) => setStructureBonds(plugin, bonds));
  }

  /**
   * Remove the atoms, leaving the cell and the elements in place.
   * @returns Resolves once the atoms are gone.
   */
  hideStructure(): Promise<void> {
    return this.run(async (plugin) => {
      await clearMeasurements(plugin);
      await drawStructure(plugin, []);
    });
  }

  /**
   * Replace the unit cell box, and the stack of cells around it.
   * @param cell - The six cell parameters, or `null` to draw none.
   * @param repeat - Cells along a, b and c.
   * @param style - See {@link CellStyle}.
   * @returns Resolves once the cell is drawn.
   */
  showCell(
    cell: UnitCell | null,
    repeat: CellRepeat = [1, 1, 1],
    style?: CellStyle,
  ): Promise<void> {
    return this.run((plugin) => drawCell(plugin, cell, repeat, style));
  }

  /**
   * Remove the cell.
   * @returns Resolves once the cell is gone.
   */
  hideCell(): Promise<void> {
    return this.run((plugin) => drawCell(plugin, null));
  }

  /**
   * Replace every drawn symmetry element.
   * @param drawings - The elements; an empty list clears them.
   * @param style - See {@link ElementLayerStyle}; kept for later edits.
   * @returns Resolves once the elements are drawn.
   */
  showElements(
    drawings: readonly SymmetryDrawing[],
    style?: ElementLayerStyle,
  ): Promise<void> {
    if (style !== undefined) this.#elementStyle = style;
    this.#drawings = [...drawings];
    return this.#redrawElements();
  }

  /**
   * Draw these elements as well, replacing any already drawn under the same id.
   * @param drawings - What to add.
   * @returns Resolves once the elements are drawn.
   */
  addElements(drawings: readonly SymmetryDrawing[]): Promise<void> {
    this.#drawings = mergeDrawings(this.#drawings, drawings);
    return this.#redrawElements();
  }

  /**
   * Stop drawing these elements, leaving the rest alone.
   * @param ids - The ids to remove; an id that is not drawn is ignored.
   * @returns Resolves once the rest are redrawn.
   */
  removeElements(ids: readonly string[]): Promise<void> {
    this.#drawings = withoutDrawings(this.#drawings, ids);
    return this.#redrawElements();
  }

  /**
   * Remove every symmetry element.
   * @returns Resolves once they are gone.
   */
  hideElements(): Promise<void> {
    this.#drawings = [];
    return this.#redrawElements();
  }

  /**
   * Apply an operation to the structure, once, and leave it where it lands.
   *
   * The elements stay where they are: an axis that turned with the molecule
   * would prove nothing.
   * @param operation - What to apply.
   * @param options - See {@link PlayOptions}.
   * @returns Resolves once the operation has been applied in full.
   */
  playOperation(
    operation: ViewerOperation,
    options?: PlayOptions,
  ): Promise<void> {
    return this.run((plugin) => playOperation(plugin, operation, options));
  }

  /**
   * Hold the structure part-way through an operation, for a slider.
   * @param operation - What is being applied.
   * @param fraction - How far through, 0 to 1.
   * @returns Resolves once the structure is held there.
   */
  setOperationFraction(
    operation: ViewerOperation,
    fraction: number,
  ): Promise<void> {
    return this.run((plugin) => {
      setOperationFraction(plugin, operation, fraction);
    });
  }

  /**
   * Put the structure back where it started.
   * @returns Resolves once the structure is back.
   */
  resetOperation(): Promise<void> {
    return this.run((plugin) => {
      resetOperation(plugin);
    });
  }

  #redrawElements(): Promise<void> {
    const drawings = this.#drawings;
    const style = this.#elementStyle;
    return this.run((plugin) => drawElements(plugin, drawings, style));
  }
}
