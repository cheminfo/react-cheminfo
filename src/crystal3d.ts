/**
 * Crystals in 3D: the atoms of a cell, the box around it, the symmetry
 * elements over it and an operation applied to it, drawn by molstar.
 *
 * An entry point of its own because molstar is several megabytes: the canvas
 * sits behind `React.lazy`, so importing this costs a page the drawing
 * geometry and the components, never the viewer. The geometry needs neither
 * React nor molstar and is exported beside the components.
 */

export * from './crystal3d/core/index.ts';
export * from './crystal3d/ui/index.ts';
