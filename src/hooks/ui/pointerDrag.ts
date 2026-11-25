/**
 * A drag of one pointer, from its press to its release: the element pressed
 * captures the pointer, so its moves keep coming when it leaves the element
 * — over a frame, out of the window —, and the drag ends once, however it
 * ends: released, cancelled, or its capture taken away. A pan, a slider's
 * thumb, a divider, a pinch's fingers each follow their pointer this way
 * rather than wiring their own listeners and deciding, each its own way,
 * when a gesture is over.
 */

/** What a drag tells. */
export interface PointerDragHandlers {
  /** The pointer moved, still pressed. */
  onMove: (event: PointerEvent) => void;
  /**
   * The drag ended: the pointer released or cancelled, its capture taken
   * away, or a pointer the browser no longer tracked. Told once.
   * @default undefined
   */
  onEnd?: () => void;
}

/** The press a drag starts from: the element pressed, and its pointer. */
export interface PointerPress {
  /** The element whose handler read the press: it captures the pointer. */
  currentTarget: Element;
  /** The pointer pressed. */
  pointerId: number;
}

/**
 * Follow a pointer pressed on an element until the drag ends.
 * @param press - The press: the element captures its pointer.
 * @param handlers - See {@link PointerDragHandlers}.
 * @returns What ends the drag early, telling nothing more.
 */
export function startPointerDrag(
  press: PointerPress,
  handlers: PointerDragHandlers,
): () => void {
  const element = press.currentTarget;
  const id = press.pointerId;
  const move = (event: Event) => {
    if (ofPointer(event, id)) handlers.onMove(event);
  };
  const end = (event: Event) => {
    if (!ofPointer(event, id)) return;
    stop();
    handlers.onEnd?.();
  };
  function stop(): void {
    element.removeEventListener('pointermove', move);
    for (const type of ENDS) element.removeEventListener(type, end);
    if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
  }
  element.addEventListener('pointermove', move);
  for (const type of ENDS) element.addEventListener(type, end);
  if (!tryCapturePointer(element, id)) {
    stop();
    handlers.onEnd?.();
  }
  return stop;
}

/**
 * Capture a pointer on an element, so its moves and its release keep coming
 * there.
 * @param element - The element.
 * @param pointerId - The pointer.
 * @returns Whether it was captured: `false` for a pointer the browser no
 *   longer tracks, already released; anything else the browser refuses is
 *   thrown on.
 */
export function tryCapturePointer(
  element: Element,
  pointerId: number,
): boolean {
  try {
    element.setPointerCapture(pointerId);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return false;
    }
    throw error;
  }
}

/** How a drag can end. */
const ENDS = ['pointerup', 'pointercancel', 'lostpointercapture'] as const;

/**
 * Whether an event is one of a pointer's.
 * @param event - The event.
 * @param pointerId - The pointer.
 * @returns Whether it is a pointer event of that pointer.
 */
function ofPointer(event: Event, pointerId: number): event is PointerEvent {
  return 'pointerId' in event && event.pointerId === pointerId;
}
