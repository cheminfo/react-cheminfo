import type { DemoCursor } from './demoCursor.ts';
import type { DemoPoint } from './demoEvents.ts';
import { pressPointer } from './demoEvents.ts';

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
 * dispatched events draw nothing, so the demo draws that copy itself. A drag
 * the room cannot see is a piece that appears from nowhere.
 * @param options - See {@link DemoDragOptions}.
 */
export async function dragNative(options: DemoDragOptions): Promise<void> {
  const { source, start, end, cursor, signal, fast, frame } = options;
  const transfer = new DataTransfer();
  cursor.press(true);
  pressPointer(start, 1);
  fireDrag(source, 'dragstart', start, transfer);
  source.dispatchEvent(
    new PointerEvent('pointercancel', { bubbles: true, isPrimary: true }),
  );
  const ghost = createGhost(source, start);
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

/**
 * A faint copy of what is dragged, held where it was grabbed.
 * @param source - What is dragged.
 * @param grab - Where it was grabbed.
 * @returns How to move the copy, and to take it away.
 */
function createGhost(
  source: Element,
  grab: DemoPoint,
): { move: (point: DemoPoint) => void; remove: () => void } {
  const box = source.getBoundingClientRect();
  const offset = { x: grab.x - box.left, y: grab.y - box.top };
  const copy = source.cloneNode(true) as Element;
  // Out of its place in the page, the copy loses every rule written for its
  // ancestors, so it keeps the look it has there, element by element.
  keepLook(source, copy);
  const holder = document.createElement('div');
  holder.className = 'demo-drag-ghost';
  holder.setAttribute('aria-hidden', 'true');
  holder.style.width = `${box.width}px`;
  holder.style.height = `${box.height}px`;
  holder.append(copy);
  document.body.append(holder);

  function move(point: DemoPoint): void {
    holder.style.transform = `translate(${point.x - offset.x}px, ${point.y - offset.y}px)`;
  }
  move(grab);
  return {
    move,
    remove: () => {
      holder.remove();
    },
  };
}

function keepLook(source: Element, copy: Element): void {
  const originals = [source, ...source.querySelectorAll('*')];
  const copies = [copy, ...copy.querySelectorAll('*')];
  for (let index = 0; index < originals.length; index++) {
    const original = originals[index];
    const twin = copies[index];
    if (
      original === undefined ||
      !(twin instanceof HTMLElement || twin instanceof SVGElement)
    ) {
      continue;
    }
    const style =
      original.ownerDocument.defaultView?.getComputedStyle(original);
    if (style === undefined) continue;
    for (const property of LOOK) {
      twin.style.setProperty(property, style.getPropertyValue(property));
    }
  }
  if (copy instanceof HTMLElement || copy instanceof SVGElement) {
    copy.style.setProperty('margin', '0');
  }
}

/** What makes an element look the way it does, without its ancestors. */
const LOOK = [
  'align-items',
  'background-color',
  'border-bottom',
  'border-left',
  'border-radius',
  'border-right',
  'border-top',
  'box-sizing',
  'color',
  'display',
  'fill',
  'flex-direction',
  'font-family',
  'font-size',
  'font-weight',
  'gap',
  'height',
  'justify-content',
  'line-height',
  'opacity',
  'overflow',
  'padding',
  'stroke',
  'stroke-width',
  'text-align',
  'text-overflow',
  'white-space',
  'width',
] as const;
