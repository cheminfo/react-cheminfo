/**
 * What a site imports to show or to draw a structure.
 *
 * **Nothing exported here may pull react-ocl or openchemlib in statically.**
 * `StructureSvg` and `EditorCanvas` are deliberately absent: re-exporting
 * either would make react-ocl reachable from this barrel, the `React.lazy`
 * boundaries inside `Structure` and `StructureEditor` would be defeated, and
 * `react-cheminfo/structure` would stop being importable at all when those
 * optional peers are not installed — which is what a site wanting only the
 * Tools menu does. Type-only re-exports are erased and so are safe.
 */

export type {
  StructureEditorChange,
  StructureEditorMode,
} from './EditorCanvas.tsx';
export type { StructureLabels, StructureProps } from './Structure.tsx';
export { Structure } from './Structure.tsx';
export type { StructureEditorProps } from './StructureEditor.tsx';
export { StructureEditor } from './StructureEditor.tsx';
export type { ToolbarFloorOptions } from './useToolbarFloor.ts';
export { useToolbarFloor } from './useToolbarFloor.ts';
