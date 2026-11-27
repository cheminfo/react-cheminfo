import type { DemoCursor } from './demoCursor.ts';
import type { DemoPoint } from './demoEvents.ts';
import { pressPointer } from './demoEvents.ts';
import type { DragImage } from './demoGhost.ts';
import { createGhost, createImageGhost } from './demoGhost.ts';

/** How a draggable element is carried to a point. */
export interface DemoDragOptions {
  /** The element dragged: it, or an ancestor, is `draggable`. */
  source: Element;
  /** Where it is picked up. */
  start: DemoPoint;
  /** Where it is let go. */
  end: DemoPoint;
  /** The demo's pointer. */
  cursor: DemoCursor;
  /** Stops the drag where it is. */
  signal: AbortSignal;
  /** Whether the drag is replayed at once. */
  fast: boolean;
  /** Waits for the next frame, or throws once the signal is aborted. */
  frame: () => Promise<void>;
}

/**
 * Carry a draggable element to a point, the way the browser does: a
 * `dragstart` on it, `dragenter` and `dragover` on whatever passes under the
 * pointer, then a `drop` where it is let go and a `dragend` on it, all
 * carrying one `DataTransfer`, so the page reads what its own `dragstart`
 * wrote.
 *
 * The browser draws what is dragged as a faint copy under the pointer;
 * dispatched events draw nothing, so the demo draws that copy itself — or
 * the image the page's `dragstart` handed to `setDragImage`, as the browser
 * would, so a page that carries the dragged thing as itself is not covered
 * by its tile. A drag the room cannot see is a piece that appears from
 * nowhere.
 * @param options - See {@link DemoDragOptions}.
 */
export async function dragNative(options: DemoDragOptions): Promise<void> {
  const { source, start, end, cursor, signal, fast, frame } = options;
  const transfer = new DataTransfer();
  let image: DragImage | undefined;
  // A constructed transfer draws nothing, so its image is kept for the ghost.
  transfer.setDragImage = (element, x, y) => {
    image = { element, x, y };
  };
  cursor.press(true);
  pressPointer(start, 1);
  fireDrag(source, 'dragstart', start, transfer);
  source.dispatchEvent(
    new PointerEvent('pointercancel', { bubbles: true, isPrimary: true }),
  );
  const ghost = image
    ? createImageGhost(image, start)
    : createGhost(source, start);
  let over: Element | null = null;
  let accepted = false;

  function carry(point: DemoPoint): void {
    ghost.move(point);
    fireDrag(source, 'drag', point, transfer);
    const target = document.elementFromPoint(point.x, point.y);
    if (target !== over) {
      if (over !== null) fireDrag(over, 'dragleave', point, transfer, target);
      if (target !== null) fireDrag(target, 'dragenter', point, transfer, over);
      over = target;
    }
    // A target takes a drop by cancelling the `dragover` before it.
    accepted =
      target !== null && !fireDrag(target, 'dragover', point, transfer);
  }

  try {
    if (fast) {
      carry({ x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 });
      await frame();
      cursor.jump(end);
      carry(end);
    } else {
      await cursor.glide(end, signal, carry);
    }
    // Written by `carry`, which the narrowing above does not see.
    const target = over as Element | null;
    if (target !== null) {
      fireDrag(target, accepted ? 'drop' : 'dragleave', end, transfer);
    }
    fireDrag(source, 'dragend', end, transfer);
  } finally {
    ghost.remove();
    cursor.press(false);
  }
  await frame();
}

/**
 * The draggable element at a point, when there is one.
 * @param point - Where the drag starts.
 * @returns The element, or `null` when what lies there is not draggable.
 */
export function draggableAt(point: DemoPoint): Element | null {
  return (
    document
      .elementFromPoint(point.x, point.y)
      ?.closest('[draggable="true"]') ?? null
  );
}

/**
 * Dispatch a drag event.
 * @param target - Where.
 * @param type - Which.
 * @param point - Where the pointer is.
 * @param transfer - What is carried.
 * @param relatedTarget - What the pointer comes from, or goes to.
 * @returns Whether no listener cancelled it.
 */
function fireDrag(
  target: Element,
  type: string,
  point: DemoPoint,
  transfer: DataTransfer,
  relatedTarget: Element | null = null,
): boolean {
  return target.dispatchEvent(
    new DragEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: globalThis.window,
      clientX: point.x,
      clientY: point.y,
      screenX: point.x,
      screenY: point.y,
      buttons: 1,
      relatedTarget,
      dataTransfer: transfer,
    }),
  );
}
