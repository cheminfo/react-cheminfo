import type { Molecule3DTools } from '../../molecule3d/core/settings.ts';
import type { CrystalViewSettings } from '../core/crystalView.ts';

import type { CrystalViewHandle } from './crystalScene.ts';

/** Props of `CrystalStructureViewer`. */
export interface CrystalStructureViewerProps {
  /** The CIF, as text. */
  cif: string;
  /**
   * What the crystal is called, at the head of the caption.
   * @default ''
   */
  name?: string;
  /**
   * How the crystal is drawn, when the page owns it — to keep it in the
   * address, for one.
   * @default undefined
   */
  settings?: CrystalViewSettings;
  /**
   * How the crystal is drawn at first, when the viewer owns it.
   * @default DEFAULT_CRYSTAL_VIEW_SETTINGS
   */
  defaultSettings?: CrystalViewSettings;
  /**
   * Called with every change a chip makes.
   * @default undefined
   */
  onSettingsChange?: (settings: CrystalViewSettings) => void;
  /**
   * How tall the canvas is: pixels, or any CSS length.
   * @default 420
   */
  height?: number | string;
  /**
   * Which tools the toolbars offer; every one it does not name is on.
   * @default every tool but the display options and the surface
   */
  tools?: Partial<Molecule3DTools>;
  /**
   * Base name of a picture saved from the toolbar, extension excluded.
   * @default 'crystal'
   */
  fileName?: string;
  /**
   * Called with the means to picture the scene once the canvas exists, and with
   * `null` once it is gone.
   * @default undefined
   */
  onHandle?: (handle: CrystalViewHandle | null) => void;
}

export { DEFAULT_CRYSTAL_VIEW_SETTINGS as DEFAULT_SETTINGS } from '../core/crystalView.ts';
