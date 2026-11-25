import type { DragEvent } from 'react';
import { useMemo, useState } from 'react';

import type { DropTransfer } from '../core/dropTransfer.ts';
import { carriesFilesOrText, readDropTransfer } from '../core/dropTransfer.ts';

import { filesOfDrop } from './filesOfDrop.ts';

/** The drag handlers of one element. */
export interface DropHandlers {
  /**
   * Called when a drag enters the element.
   * @default undefined — not listened to
   */
  onDragEnter?: (event: DragEvent<HTMLElement>) => void;
  /**
   * Called again and again while a drag moves over the element.
   * @default undefined — not listened to
   */
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  /**
   * Called when a drag leaves the element, or a child of it.
   * @default undefined — not listened to
   */
  onDragLeave?: (event: DragEvent<HTMLElement>) => void;
  /**
   * Called when a file or text is dropped on the element.
   * @default undefined — not listened to
   */
  onDrop?: (event: DragEvent<HTMLElement>) => void;
}

/** A drop target, in two parts: the element and the overlay it raises. */
export interface DropTarget {
  /** Whether a file or text is being dragged over the target. */
  over: boolean;
  /**
   * Put on the element that takes the drop. Alone, they take the whole drag —
   * a target that marks itself rather than raising a veil: crossing its
   * children never reads as leaving it, and a drag one of its children takes
   * itself (an inner drop target) is that child's.
   */
  targetProps: DropHandlers;
  /**
   * Put on the overlay drawn while `over` (`DropOverlay`). It covers the
   * target and takes every drag event from then on, so moving across the
   * controls underneath never reads as leaving, and leaving the overlay is
   * leaving.
   */
  overlayProps: DropHandlers;
}

/** What a drop target takes. */
export interface DropTargetOptions {
  /**
   * Whether text is taken as well as files, so a target that cannot use text
   * raises no veil over a drag holding only text.
   * @default true
   */
  takesText?: boolean;
  /**
   * Whether a dropped folder is walked, so the files inside it are handed
   * over, each named by its path in the drop. The walk ends after the drop
   * event, so such a drop is handed over once it has; every other drop is
   * handed over at once. Off, a folder is one empty file.
   * @default false
   */
  walksFolders?: boolean;
  /**
   * Told why a dropped folder could not be walked, after the drop's own list
   * of files was handed over in its place — once taken, when `onDrop` takes
   * them asynchronously.
   * @default undefined — not told
   */
  onUnread?: (reason: Error) => void;
}

/** Where a drop goes: taken at once, or once its promise settles. */
export type TakeDrop = (transfer: DropTransfer) => void | Promise<void>;

/**
 * Take files, or text, dropped on an element: the veil it raises while a drag
 * is over it, the drop read, a dropped folder walked when asked.
 * @param onDrop - Where the drop goes; `undefined` takes none.
 * @param options - See {@link DropTargetOptions}.
 * @returns Whether a drag is over the element, and the handlers to put on it
 * and on its overlay.
 */
export function useDropTarget(
  onDrop: TakeDrop | undefined,
  options: DropTargetOptions = {},
): DropTarget {
  const { takesText = true, walksFolders = false, onUnread } = options;
  const [over, setOver] = useState(false);
  // The drag events this target took: one its overlay took is still its own
  // on the way up, one an inner drop target took is not.
  const [taken] = useState(() => new WeakSet<Event>());

  return useMemo(() => {
    if (onDrop === undefined) {
      return { over: false, targetProps: {}, overlayProps: {} };
    }
    const accept = (event: DragEvent<HTMLElement>): boolean => {
      if (taken.has(event.nativeEvent)) return true;
      if (event.defaultPrevented) return false;
      const { types } = event.dataTransfer;
      if (!(takesText ? carriesFilesOrText(types) : types.includes('Files'))) {
        return false;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      taken.add(event.nativeEvent);
      return true;
    };
    const take = (event: DragEvent<HTMLElement>): void => {
      setOver(false);
      if (event.defaultPrevented) return;
      if (walksFolders && holdsFolder(event.dataTransfer)) {
        event.preventDefault();
        void handOverFolders(event.dataTransfer, onDrop, onUnread);
        return;
      }
      const transfer = readDropTransfer(event.dataTransfer);
      if (transfer === null) return;
      event.preventDefault();
      void onDrop(transfer);
    };
    return {
      over,
      targetProps: {
        onDragEnter: (event) => {
          if (accept(event)) setOver(true);
        },
        onDragOver: (event) => {
          setOver(accept(event));
        },
        onDragLeave: (event) => {
          if (!within(event.currentTarget, event.relatedTarget)) setOver(false);
        },
        onDrop: take,
      },
      overlayProps: {
        onDragOver: accept,
        onDragLeave: (event) => {
          if (event.target === event.currentTarget) setOver(false);
        },
        onDrop: take,
      },
    };
  }, [onDrop, onUnread, over, taken, takesText, walksFolders]);
}

/**
 * Whether a drag going to another element stays inside the target: the
 * child it moves onto, or the overlay the target raised, is still the target.
 * @param target - The target.
 * @param to - Where the drag goes, `null` out of the page.
 * @returns Whether it stays.
 */
function within(target: HTMLElement, to: EventTarget | null): boolean {
  return to instanceof Node && target.contains(to);
}

/** The part of a drop that tells whether one of its items is a folder. */
interface FolderSource {
  /**
   * What was dropped, each item giving its file or folder entry.
   * @default undefined — read as no folder
   */
  readonly items?: Iterable<{
    webkitGetAsEntry?: () => { readonly isDirectory: boolean } | null;
  }>;
}

function holdsFolder(transfer: FolderSource): boolean {
  if (transfer.items === undefined) return false;
  for (const item of transfer.items) {
    if (item.webkitGetAsEntry?.()?.isDirectory) return true;
  }
  return false;
}

// `filesOfDrop` settles every drop: the folders' files, or the drop's own list
// with the reason a folder could not be walked.
async function handOverFolders(
  transfer: DataTransfer,
  onDrop: TakeDrop,
  onUnread: ((reason: Error) => void) | undefined,
): Promise<void> {
  const { files, unread } = await filesOfDrop(transfer);
  await onDrop({ kind: 'files', files });
  if (unread !== undefined) onUnread?.(unread);
}
