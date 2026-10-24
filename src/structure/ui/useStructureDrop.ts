import type { DragEvent } from 'react';
import { useMemo, useState } from 'react';

import type { StructureTransfer } from '../core/structureTransfer.ts';
import {
  carriesStructure,
  readStructureTransfer,
} from '../core/structureTransfer.ts';

/** The drag handlers of one element. */
export interface DropHandlers {
  onDragEnter?: (event: DragEvent<HTMLElement>) => void;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDragLeave?: (event: DragEvent<HTMLElement>) => void;
  onDrop?: (event: DragEvent<HTMLElement>) => void;
}

/** A drop target, in two parts: the element and the overlay it raises. */
export interface StructureDropTarget {
  /** Whether a file or text is being dragged over the target. */
  over: boolean;
  /** Put on the element that takes the drop. */
  targetProps: DropHandlers;
  /**
   * Put on the overlay drawn while `over`. It covers the target and takes
   * every drag event from then on, so moving across the canvas and the buttons
   * underneath never reads as leaving, and leaving the overlay is leaving.
   */
  overlayProps: DropHandlers;
}

/**
 * Take a file or text dropped on an element.
 * @param onDrop - Where the drop goes; `undefined` takes none.
 * @returns Whether a drag is over the element, and the handlers to put on it
 * and on its overlay.
 */
export function useStructureDrop(
  onDrop: ((transfer: StructureTransfer) => void) | undefined,
): StructureDropTarget {
  const [over, setOver] = useState(false);

  return useMemo(() => {
    if (onDrop === undefined) {
      return { over: false, targetProps: {}, overlayProps: {} };
    }
    const accept = (event: DragEvent<HTMLElement>): boolean => {
      if (!carriesStructure(event.dataTransfer.types)) return false;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      return true;
    };
    return {
      over,
      targetProps: {
        onDragEnter: (event) => {
          if (accept(event)) setOver(true);
        },
        onDragOver: accept,
      },
      overlayProps: {
        onDragOver: accept,
        onDragLeave: (event) => {
          if (event.target === event.currentTarget) setOver(false);
        },
        onDrop: (event) => {
          setOver(false);
          const transfer = readStructureTransfer(event.dataTransfer);
          if (transfer === null) return;
          event.preventDefault();
          onDrop(transfer);
        },
      },
    };
  }, [onDrop, over]);
}
