import type { DragEvent } from 'react';
import { useMemo, useState } from 'react';

/** The handlers spread onto the element that takes the drop. */
export interface FileDropHandlers {
  /** Read the first file dropped, unless an inner region took it. */
  onDrop: (event: DragEvent<HTMLElement>) => void;
  /** Light the outline while a file, never a text selection, is over it. */
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  /** Clear the outline once the drag has left the element. */
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
}

/** A region that takes a dropped file: whether one is over it, and its handlers. */
export interface FileDrop {
  /** Whether a file is being dragged over the region right now. */
  over: boolean;
  /** Spread onto the element that takes the drop. */
  handlers: FileDropHandlers;
}

/**
 * The drag events a region has already taken.
 *
 * One region sits inside another — the panel that advertises the drop, inside
 * the tool that also takes it — and an event travels from the inner one
 * outwards, so the region that takes it first is the one the pointer is on.
 * An outer region that sees a taken event reads no file and lights no outline
 * of its own, which is what keeps a dropped file parsed once and one outline
 * lit at a time.
 */
const taken = new WeakSet<object>();

/**
 * Make a region take a dropped file.
 *
 * A browser handed a file it was not asked about navigates to it, which throws
 * away the page the visitor was working on. So the whole tool takes the drop,
 * not only the panel that advertises it: someone dragging a spreadsheet aims at
 * the figure they want it drawn on.
 * @param onFile - Called with the first file dropped.
 * @returns Whether a file is over the region, and the handlers to spread on it.
 */
export function useFileDrop(onFile: (file: File) => void): FileDrop {
  const [over, setOver] = useState(false);
  const handlers = useMemo(
    () => fileDropHandlers(onFile, setOver),
    [onFile, setOver],
  );
  return { over, handlers };
}

/**
 * The handlers themselves, built apart from React so that the rule deciding
 * which of two nested regions takes an event is a plain function.
 * @param onFile - Called with the first file dropped.
 * @param setOver - Told whether a file is over this region.
 * @returns The handlers to spread on the element.
 */
export function fileDropHandlers(
  onFile: (file: File) => void,
  setOver: (over: boolean) => void,
): FileDropHandlers {
  return {
    onDrop(event: DragEvent<HTMLElement>) {
      event.preventDefault();
      setOver(false);
      if (!take(event)) return;
      const file = event.dataTransfer.files[0];
      if (file) onFile(file);
    },
    onDragOver(event: DragEvent<HTMLElement>) {
      // Only a file: a text selection dragged around the page is not one, and
      // claiming it would break selecting a number to copy it.
      if (!event.dataTransfer.types.includes('Files')) return;
      event.preventDefault();
      setOver(take(event));
    },
    onDragLeave(event: DragEvent<HTMLElement>) {
      // Crossing into a child fires a leave on the parent, so only a drag that
      // has actually left the element counts.
      if (event.currentTarget.contains(event.relatedTarget as Node)) return;
      setOver(false);
    },
  };
}

/**
 * Take an event on behalf of one region.
 * @param event - The drag event being handled.
 * @returns Whether this region is the innermost one to see it.
 */
function take(event: DragEvent<HTMLElement>): boolean {
  if (taken.has(event.nativeEvent)) return false;
  taken.add(event.nativeEvent);
  return true;
}
