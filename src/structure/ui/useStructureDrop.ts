import type { DropTarget } from '../../dropzone/ui/useDropTarget.ts';
import { useDropTarget } from '../../dropzone/ui/useDropTarget.ts';
import type { StructureTransfer } from '../core/structureTransfer.ts';

export type { DropHandlers } from '../../dropzone/ui/useDropTarget.ts';

/** A drop target, in two parts: the element and the overlay it raises. */
export type StructureDropTarget = DropTarget;

/**
 * Take a structure file, or structure text, dropped on an element: the
 * family's drop target (`useDropTarget`), a folder not walked.
 * @param onDrop - Where the drop goes; `undefined` takes none.
 * @param takesText - Whether text is taken as well as files, so a target that
 * cannot use text raises no veil over a drag holding only text.
 * @default true
 * @returns Whether a drag is over the element, and the handlers to put on it
 * and on its overlay.
 */
export function useStructureDrop(
  onDrop: ((transfer: StructureTransfer) => void) | undefined,
  takesText = true,
): StructureDropTarget {
  return useDropTarget(onDrop, { takesText });
}
