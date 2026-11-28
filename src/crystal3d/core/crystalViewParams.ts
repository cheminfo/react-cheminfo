/**
 * How a crystal is drawn, as an address carries it: whole molecules or the
 * atoms the cell cuts, how many cells along each axis, whether the box of the
 * cell is drawn, and which bonds. A field at its default is never written.
 */

import type { ShareParamCodec } from '../../share/core/params.ts';
import {
  booleanParam,
  enumParam,
  integerParam,
} from '../../share/core/params.ts';

import type {
  CrystalBonds,
  CrystalPacking,
  CrystalViewSettings,
} from './crystalView.ts';
import {
  CELL_COUNT_RANGE,
  CRYSTAL_BONDS,
  CRYSTAL_PACKINGS,
  DEFAULT_CRYSTAL_VIEW_SETTINGS,
} from './crystalView.ts';

/** The four parameters, by the name each takes in the query string. */
export interface CrystalViewParams {
  /** `packing`: `molecules` or `cell`. */
  packing: ShareParamCodec<CrystalPacking>;
  /** `supercell`: the cells along each axis. */
  supercell: ShareParamCodec<number>;
  /** `unitCell`: whether the box of the cell is drawn. */
  unitCell: ShareParamCodec<boolean>;
  /** `bonds`: `all`, `noMetal` or `none`. */
  bonds: ShareParamCodec<CrystalBonds>;
}

/** What {@link crystalViewParams} is configured with. */
export interface CrystalViewParamsOptions {
  /**
   * What the site opens on.
   * @default DEFAULT_CRYSTAL_VIEW_SETTINGS
   */
  defaults?: CrystalViewSettings;
  /**
   * The cells a link may ask for along each axis.
   * @default CELL_COUNT_RANGE
   */
  cells?: { readonly minimum: number; readonly maximum: number };
}

/**
 * The codecs of a crystal's drawing.
 * @param options - The site's defaults and the cells it allows.
 * @returns The four codecs.
 */
export function crystalViewParams(
  options: CrystalViewParamsOptions = {},
): CrystalViewParams {
  const { defaults = DEFAULT_CRYSTAL_VIEW_SETTINGS, cells = CELL_COUNT_RANGE } =
    options;
  return {
    packing: enumParam(CRYSTAL_PACKINGS, defaults.packing),
    supercell: integerParam({
      min: cells.minimum,
      max: cells.maximum,
      default: defaults.cells,
    }),
    unitCell: booleanParam({ default: defaults.unitCell }),
    bonds: enumParam(CRYSTAL_BONDS, defaults.bonds),
  };
}

/**
 * Read a crystal's drawing from a decoded query.
 * @param query - The decoded query.
 * @param params - The codecs.
 * @default params crystalViewParams()
 * @returns Every field; one the query does not carry, or carries wrong, at its default.
 */
export function readCrystalView(
  query: Readonly<Record<string, string>>,
  params: CrystalViewParams = crystalViewParams(),
): CrystalViewSettings {
  return {
    packing: params.packing.parse(query.packing ?? null),
    cells: params.supercell.parse(query.supercell ?? null),
    unitCell: params.unitCell.parse(query.unitCell ?? null),
    bonds: params.bonds.parse(query.bonds ?? null),
  };
}

/**
 * Write a crystal's drawing into a decoded query, leaving out every default.
 * @param settings - How the crystal is drawn.
 * @param params - The codecs.
 * @default params crystalViewParams()
 * @returns The query.
 */
export function writeCrystalView(
  settings: CrystalViewSettings,
  params: CrystalViewParams = crystalViewParams(),
): Record<string, string> {
  const query: Record<string, string> = {};
  const packing = params.packing.serialize(settings.packing);
  if (packing !== null) query.packing = packing;
  const supercell = params.supercell.serialize(settings.cells);
  if (supercell !== null) query.supercell = supercell;
  const unitCell = params.unitCell.serialize(settings.unitCell);
  if (unitCell !== null) query.unitCell = unitCell;
  const bonds = params.bonds.serialize(settings.bonds);
  if (bonds !== null) query.bonds = bonds;
  return query;
}
