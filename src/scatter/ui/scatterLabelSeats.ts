/**
 * The seats a word is offered around what it names: the four beside it, then
 * rings further out, the first free one taken.
 */

import type { LabelBox, LabelBoxField } from './scatterLabelBoxes.ts';
import type {
  PlacedScatterLabel,
  ScatterLabelPlacementOptions,
} from './scatterLabelPlacement.ts';
import type { ScatterPixelLabel } from './scatterLabels.ts';

/** What {@link freeSeat} needs beyond the word itself. */
export interface SeatSearch {
  /** Radius of the dot the word belongs to, in pixels. */
  radius: number;
  /** Whether the word may first sit centred on what it names. */
  centered: boolean;
  /** How far the word may be moved before it is dropped, in pixels. */
  shift: number;
  /** The rectangle no word may leave. */
  bounds: ScatterLabelPlacementOptions['bounds'];
  /** The words already written. */
  field: LabelBoxField;
}

/**
 * The nearest place this word can go without landing on one already written,
 * or `undefined` when there is none within reach.
 * @param label - The word and what it names.
 * @param width - How wide it will be drawn, in pixels.
 * @param height - How tall.
 * @param search - See {@link SeatSearch}.
 * @returns The rectangle it takes, or nothing when none is free.
 */
export function freeSeat(
  label: ScatterPixelLabel,
  width: number,
  height: number,
  search: SeatSearch,
): LabelBox | undefined {
  const { radius, centered, shift, bounds, field } = search;
  const clear = radius + SEAT_GAP;
  const near: LabelBox[] = centered
    ? [box(label.x, label.y, width, height)]
    : [];
  near.push(
    box(label.x + clear + width / 2, label.y, width, height),
    box(label.x - clear - width / 2, label.y, width, height),
    box(label.x, label.y - clear - height / 2, width, height),
    box(label.x, label.y + clear + height / 2, width, height),
  );
  for (const seat of near) {
    if (free(seat, bounds, field)) return seat;
  }

  for (let step = SEAT_STEP; step <= shift; step += SEAT_STEP) {
    for (let index = 0; index < SEAT_DIRECTIONS.length; index += 2) {
      const across = SEAT_DIRECTIONS[index] ?? 0;
      const down = SEAT_DIRECTIONS[index + 1] ?? 0;
      const seat = box(
        label.x + across * (step + width / 2),
        label.y + down * (step + height / 2),
        width,
        height,
      );
      if (free(seat, bounds, field)) return seat;
    }
  }
  return undefined;
}

/**
 * Whether a seat is inside the frame and free of every word already written.
 * @param seat - Where the word would go.
 * @param bounds - The rectangle it has to stay inside, if any.
 * @param field - The words already placed.
 * @returns Whether it may be written there.
 */
function free(
  seat: LabelBox,
  bounds: ScatterLabelPlacementOptions['bounds'],
  field: LabelBoxField,
): boolean {
  if (bounds !== undefined) {
    if (seat.left < bounds.x || seat.right > bounds.x + bounds.width) {
      return false;
    }
    if (seat.top < bounds.y || seat.bottom > bounds.y + bounds.height) {
      return false;
    }
  }
  return field.fits(seat);
}

/**
 * How the word is drawn once its seat is known.
 * @param seat - The rectangle it took.
 * @param label - The word and what it names.
 * @param radius - Radius of the dot it stands beside.
 * @returns Where the text goes, which end of it is pinned, and where a line
 * back to its subject reaches it.
 */
export function written(
  seat: LabelBox,
  label: ScatterPixelLabel,
  radius: number,
): Omit<PlacedScatterLabel, keyof ScatterPixelLabel> {
  const edgeX = Math.min(Math.max(label.x, seat.left), seat.right);
  const edgeY = Math.min(Math.max(label.y, seat.top), seat.bottom);
  const across = label.x - edgeX;
  const down = label.y - edgeY;
  const away = Math.hypot(across, down);
  const middle = (seat.left + seat.right) / 2;
  // Pinned at the end nearest its subject, so the word grows away from the dot
  // rather than back over it.
  const anchor = away <= radius ? 'middle' : nearestSide(middle, label.x);
  const placed = {
    textX:
      anchor === 'start' ? seat.left : anchor === 'end' ? seat.right : middle,
    textY: (seat.top + seat.bottom) / 2,
    anchor,
  } as const;
  return away > LEADER_FROM
    ? { ...placed, leader: { x: edgeX, y: edgeY } }
    : placed;
}

/**
 * Which end of a word to pin, given which side of its subject it sits on.
 * @param middle - The middle of the word, horizontally.
 * @param subject - Where what it names sits, horizontally.
 * @returns The anchor to draw it with.
 */
function nearestSide(
  middle: number,
  subject: number,
): 'start' | 'middle' | 'end' {
  if (middle > subject + 1) return 'start';
  if (middle < subject - 1) return 'end';
  return 'middle';
}

/**
 * The rectangle of a word of this size, centred on a point.
 * @param centerX - Middle of the rectangle, horizontally.
 * @param centerY - Middle of it, vertically.
 * @param width - How wide it is.
 * @param height - How tall.
 * @returns The rectangle.
 */
function box(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
): LabelBox {
  return {
    left: centerX - width / 2,
    right: centerX + width / 2,
    top: centerY - height / 2,
    bottom: centerY + height / 2,
  };
}

/** How far a word sits clear of the dot it belongs to, in pixels. */
const SEAT_GAP = 3;

/** How far apart the rings of seats searched after the near four are. */
const SEAT_STEP = 10;

/**
 * The directions a word is pushed in, as unit vectors, tried in this order:
 * sideways first, because text runs sideways and a name pushed left or right
 * still reads as belonging to the dot beside it, then the diagonals, then
 * straight up and down last — a word directly above a dot is the one most
 * easily read as belonging to the dot above it instead.
 */
const SEAT_DIRECTIONS = Float64Array.from([
  1, 0, -1, 0, 0.87, -0.5, -0.87, -0.5, 0.87, 0.5, -0.87, 0.5, 0.5, -0.87, -0.5,
  -0.87, 0.5, 0.87, -0.5, 0.87, 0, -1, 0, 1,
]);

/**
 * How far a word has to have moved before a line is drawn back to its subject:
 * just short of the first ring, so a word in one of the four seats beside its
 * own dot gets no line and every word that had to leave them gets one. A word
 * beside its dot needs no line and gains only clutter from one; a word pushed
 * across a crowd is anybody's until the line says whose.
 */
const LEADER_FROM = 8;
