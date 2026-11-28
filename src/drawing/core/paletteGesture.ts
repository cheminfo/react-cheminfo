/**
 * How an entry comes out of an editor's palette, the same on every editor of
 * the family: a drag released over the canvas puts it where it was let go; a
 * single click takes it in hand, and each click on the canvas then puts one
 * there until it is let go; a double click, or Enter on the focused entry,
 * adds it at once.
 */

import { svgPointAt } from '../../chart/core/svgPoint.ts';
import type { Cell, SignalTools } from '../../state/core/cells.ts';

import type { Point } from './types.ts';

/**
 * What a click on a palette entry does: the first click of a run takes it in
 * hand, the second — a double click — adds it at once, and so does Enter or
 * Space, whose click has no count.
 * @param event - The click.
 * @param event.detail - How many clicks in a row, 0 from the keyboard.
 * @returns `'take'` or `'add'`.
 */
export function paletteClick(event: { detail: number }): 'take' | 'add' {
  return event.detail % 2 === 1 ? 'take' : 'add';
}

/** A drag over a palette or its canvas, as React or the DOM hands it. */
export interface PaletteDragEvent {
  /** What the drag carries. */
  readonly dataTransfer: DataTransfer;
  /** The element the listener is on: the entry, or the canvas. */
  readonly currentTarget: Pick<Element, 'querySelector'>;
  /** Where the pointer is on the screen, horizontally. */
  readonly clientX: number;
  /** Where the pointer is on the screen, vertically. */
  readonly clientY: number;
  /** Whether Alt is held, for a site that places a piece free with it. */
  readonly altKey: boolean;
  /** Take the drag over from the browser. */
  preventDefault: () => void;
}

/** A press or a move on a canvas, as React or the DOM hands it. */
export interface PalettePointerEvent {
  /** Which button is pressed: 0 for the left. */
  readonly button: number;
  /** Where the pointer is on the screen, horizontally. */
  readonly clientX: number;
  /** Where the pointer is on the screen, vertically. */
  readonly clientY: number;
  /** Whether Alt is held, for a site that places a piece free with it. */
  readonly altKey: boolean;
  /** Keep the press from what lies under the canvas's own listener. */
  stopPropagation: () => void;
  /** Take the press over from the browser. */
  preventDefault: () => void;
}

/** What makes a palette entry draggable, spread on its button. */
export interface PaletteDragProps {
  /** Always true. */
  draggable: true;
  /** Starts the drag, with the entry's own icon under the pointer. */
  onDragStart: (event: PaletteDragEvent) => void;
}

/**
 * Start dragging a palette entry: the drag carries its value under `type`, and
 * the entry's own icon — its first `<svg>` — is drawn under the pointer.
 * @param event - The entry's `dragstart`.
 * @param type - The type the drag carries the value under, such as
 * `application/x-mechanics-piece`.
 * @param value - What the entry adds.
 */
export function startPaletteDrag(
  event: PaletteDragEvent,
  type: string,
  value: string,
): void {
  const { dataTransfer, currentTarget } = event;
  dataTransfer.effectAllowed = 'copy';
  // Firefox starts no drag that carries nothing.
  dataTransfer.setData(type, value);
  const icon = currentTarget.querySelector('svg');
  if (icon) {
    const box = icon.getBoundingClientRect();
    dataTransfer.setDragImage(icon, box.width / 2, box.height / 2);
  }
}

/** What {@link createPaletteTransfer} is given. */
export interface PaletteTransferOptions<K extends string> {
  /** The type a drag carries the kind under: `application/x-<site>-piece`. */
  type: string;
  /**
   * Whether a value carried by a drag is a kind of this palette.
   * @param value - What the drag carries.
   * @returns True for a kind of this palette.
   */
  isKind: (value: string) => value is K;
  /**
   * Put one where the drag is let go.
   * @param kind - What the drag carries.
   * @param at - Where it is let go, in the canvas's points.
   * @param event - The drop, for a modifier such as Alt.
   */
  drop: (kind: K, at: Point, event: PaletteDragEvent) => void;
}

/** A palette's entries dragged onto its canvas. */
export interface PaletteTransfer<K extends string> {
  /** The type the drag carries a kind under. */
  type: string;
  /**
   * What makes an entry draggable.
   * @param kind - What the entry adds.
   * @returns The props of the entry's button.
   */
  dragProps: (kind: K) => PaletteDragProps;
  /**
   * Let a drag carrying a kind be dropped here; any other drag is left alone.
   * @param event - The canvas's `dragover`.
   */
  allowDrop: (event: PaletteDragEvent) => void;
  /**
   * Put the kind a drag carries where it is let go.
   * @param event - The canvas's `drop`.
   * @param svg - The canvas's drawing, to read the pointer in its points.
   */
  drop: (event: PaletteDragEvent, svg: SVGSVGElement | null) => void;
}

/**
 * Dragging a palette's entries onto the canvas: the entries' props, and the
 * canvas's `dragover` and `drop`.
 * @param options - See {@link PaletteTransferOptions}.
 * @returns See {@link PaletteTransfer}.
 */
export function createPaletteTransfer<K extends string>(
  options: PaletteTransferOptions<K>,
): PaletteTransfer<K> {
  const { type, isKind } = options;
  return {
    type,
    dragProps: (kind) => ({
      draggable: true,
      onDragStart: (event) => {
        startPaletteDrag(event, type, kind);
      },
    }),
    allowDrop: (event) => {
      if (!event.dataTransfer.types.includes(type)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    drop: (event, svg) => {
      const kind = event.dataTransfer.getData(type);
      if (!isKind(kind)) return;
      event.preventDefault();
      const at = svgPointAt(svg, event.clientX, event.clientY);
      if (at !== null) options.drop(kind, at, event);
    },
  };
}

/** What {@link createInHand} is given. */
export interface InHandOptions<K> {
  /** The kind taken from the palette, null when none is. */
  taken: Cell<K | null>;
  /** Where the pointer is over the canvas while a kind is taken, in points. */
  at: Cell<Point | null>;
  /**
   * Put one of the kind in hand where the canvas is pressed.
   * @param kind - The kind in hand.
   * @param at - Where, in the canvas's points.
   * @param event - The press, for a modifier such as Alt.
   */
  put: (kind: K, at: Point, event: PalettePointerEvent) => void;
  /**
   * Whether a press must be left to the canvas even with a kind in hand: a
   * caption being typed, which the press only ends.
   * @default () => false
   */
  busy?: () => boolean;
  /**
   * What taking a kind does besides, within the same batch: taking the select
   * tool, so the press is not read by another tool.
   * @default undefined
   */
  onTake?: () => void;
  /** `batch` from the site's signals. */
  signals: Pick<SignalTools, 'batch'>;
}

/** The kind taken from a palette, and the canvas's gestures around it. */
export interface InHand<K> {
  /**
   * Take a kind, so each press on the canvas puts one there; the kind already
   * in hand is put back instead.
   * @param kind - The kind.
   */
  take: (kind: K) => void;
  /** Put back the kind in hand. */
  release: () => void;
  /**
   * A press on the canvas, heard before anything on it: with a kind in hand,
   * a left press puts one there and goes no further.
   * @param event - The press, heard as it goes down.
   * @param svg - The canvas's drawing, to read the pointer in its points.
   */
  press: (event: PalettePointerEvent, svg: SVGSVGElement | null) => void;
  /**
   * Follow the pointer over the canvas while a kind is in hand, so it is
   * drawn where it would go.
   * @param event - The move.
   * @param svg - The canvas's drawing, to read the pointer in its points.
   */
  follow: (event: PalettePointerEvent, svg: SVGSVGElement | null) => void;
  /** The pointer has left the canvas: nothing is drawn where it was. */
  leave: () => void;
}

/**
 * Keep the kind a palette's click takes in hand, kept on the site's signals:
 * a left press on the canvas puts one there — on a piece or a caption too,
 * which are not grabbed while a kind is in hand — and it stays in hand for the
 * next press. The right button and the wheel still move the view.
 * @param options - See {@link InHandOptions}.
 * @returns See {@link InHand}.
 */
export function createInHand<K>(options: InHandOptions<K>): InHand<K> {
  const { taken, at, put, busy = () => false, onTake, signals } = options;
  const release = () => {
    signals.batch(() => {
      taken.value = null;
      at.value = null;
    });
  };
  return {
    take: (kind) => {
      if (taken.peek() === kind) {
        release();
        return;
      }
      signals.batch(() => {
        onTake?.();
        taken.value = kind;
      });
    },
    release,
    press: (event, svg) => {
      const kind = taken.peek();
      if (kind === null || event.button !== 0 || busy()) return;
      event.stopPropagation();
      event.preventDefault();
      const point = svgPointAt(svg, event.clientX, event.clientY);
      if (point !== null) put(kind, point, event);
    },
    follow: (event, svg) => {
      if (taken.peek() === null) return;
      at.value = svgPointAt(svg, event.clientX, event.clientY);
    },
    leave: () => {
      if (at.peek() !== null) at.value = null;
    },
  };
}
