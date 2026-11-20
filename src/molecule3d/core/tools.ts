/**
 * Which buttons the toolbar over the 3D molecule canvas shows, free of React
 * and molstar so a site can persist them.
 */

/** Which buttons the toolbar over the canvas shows. */
export interface Molecule3DTools {
  /** Distance, angle and dihedral tools, and a button removing them all. */
  measure: boolean;
  /** A popover with the representation, the size and the surface sliders. */
  options: boolean;
  /** A toggle turning the model on its own. */
  spin: boolean;
  /** A toggle drawing the molecular surface. */
  surface: boolean;
  /** A button framing the model again. */
  reset: boolean;
  /** A popover saving the picture as a PNG or an SVG. */
  export: boolean;
  /**
   * A toggle filling the screen with the canvas and its toolbars. It is left
   * out where the browser cannot fill the screen, as on an iPhone or in a
   * frame not allowed to.
   */
  fullscreen: boolean;
  /** A popover listing what the mouse and the keyboard do on the canvas. */
  help: boolean;
}

/** Every tool on. */
export const DEFAULT_MOLECULE_3D_TOOLS: Molecule3DTools = {
  measure: true,
  options: true,
  spin: true,
  surface: true,
  reset: true,
  export: true,
  fullscreen: true,
  help: true,
};

/**
 * Complete a partial tool selection.
 * @param tools - The tools a site switched on or off.
 * @returns Every tool, those not named left on.
 */
export function resolveMolecule3DTools(
  tools: Partial<Molecule3DTools> = {},
): Molecule3DTools {
  return { ...DEFAULT_MOLECULE_3D_TOOLS, ...tools };
}
