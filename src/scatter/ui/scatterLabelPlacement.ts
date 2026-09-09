/**
 * Where a word actually goes once the words beside it are taken into account.
 *
 * A name written at the thing it names is right until two things are close
 * together, and then both names are wrong: a map of forty groups whose crowds
 * overlap writes forty names on top of each other and a reader can read none
 * of them — the label layer's halo makes one word legible over dots, never
 * over another word.
 *
 * So the words are placed one at a time, best first: each takes the nearest
 * free seat around what it names, and a word that finds no seat within reach
 * is not written at all. Dropping is the point rather than a failure. Twelve
 * readable names beat forty unreadable ones, the twelve are the ones that
 * speak for the most samples, and the crowded name is still one hover away.
 *
 * It is arithmetic over pixels, so it sits beside the layer that draws it and
 * can be checked without rendering anything.
 */

import type { LabelBox } from './scatterLabelBoxes.ts';
import {
  LabelBoxField,
  labelBoxHeight,
  labelBoxWidth,
} from './scatterLabelBoxes.ts';
import type { ScatterPixelLabel } from './scatterLabels.ts';

/** One word, with the seat it was given. */
export interface PlacedScatterLabel extends ScatterPixelLabel {
  /** Where the word itself is written, which is no longer where its subject is. */
  textX: number;
  /** The vertical middle of the word. */
  textY: number;
  /** Which end of the word sits at `textX`. */
  anchor: 'start' | 'middle' | 'end';
  /**
   * Where a line drawn back to what the word names should reach it — the point
   * of the word's own rectangle nearest its subject. Left out when the word is
   * beside its subject already and a line would be clutter.
   * @default undefined — no line is drawn
   */
  leader?: { x: number; y: number };
}

/** How {@link placeScatterLabels} seats the words. */
export interface ScatterLabelPlacementOptions {
  /**
   * What the words are set in, in pixels — the same number the layer draws
   * them at, or the room kept for them is the wrong size.
   * @default 10
   */
  fontSize?: number;
  /**
   * Whether they are set in the heavier weight, which is wider.
   * @default false
   */
  bold?: boolean;
  /**
   * Whether a word wants to sit over the middle of what it names rather than
   * out to its right — which is what a group's name over its own crowd wants.
   * @default false
   */
  centered?: boolean;
  /**
   * Radius of the dot a word stands beside, which is what its first seat
   * clears.
   * @default 3.5
   */
  radius?: number;
  /**
   * How far a word may be moved from what it names, in pixels. Past this it is
   * dropped instead: a name floating eighty pixels from its dot in a crowded
   * map names whatever the reader guesses it does.
   * @default 40
   */
  shift?: number;
  /**
   * The rectangle words have to stay inside — the plot area, so a name never
   * hangs over an axis or off the figure.
   * @default undefined — words may go anywhere
   */
  bounds?: { x: number; y: number; width: number; height: number };
}

/**
 * The words that fit, each in its seat.
 *
 * Order of service is the weight a label carries — the size of the crowd a
 * group's name speaks for — and then the order they came in, so the same map
 * seats the same words every render and a name does not flicker between two
 * places as the pointer moves.
 * @param labels - The words and what they name, from `scatterPointLabels` or
 * `scatterGroupLabels`.
 * @param options - See {@link ScatterLabelPlacementOptions}.
 * @returns The words that found room, in the order they were given.
 */
export function placeScatterLabels(
  labels: readonly ScatterPixelLabel[],
  options: ScatterLabelPlacementOptions = {},
): PlacedScatterLabel[] {
  const { fontSize = 10, bold = false, centered = false } = options;
  const { radius = 3.5, shift = DEFAULT_SHIFT, bounds } = options;

  const height = labelBoxHeight(fontSize);
  const field = new LabelBoxField();
  const seated = new Array<PlacedScatterLabel | undefined>(labels.length);
  const order = placementOrder(labels);

  for (const index of order) {
    const label = labels[index];
    if (label === undefined) continue;
    const width = labelBoxWidth(label.text, fontSize, bold);
    const box = freeSeat(label, width, height, {
      radius,
      centered,
      shift,
      bounds,
      field,
    });
    if (box === undefined) continue;
    field.add(box);
    seated[index] = { ...label, ...written(box, label, radius) };
  }

  const placed: PlacedScatterLabel[] = [];
  for (const label of seated) {
    if (label !== undefined) placed.push(label);
  }
  return placed;
}

/** What {@link freeSeat} needs beyond the word itself. */
interface SeatSearch {
  radius: number;
  centered: boolean;
  shift: number;
  bounds: ScatterLabelPlacementOptions['bounds'];
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
function freeSeat(
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
function written(
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

/**
 * The order the words are served in: the heaviest first — a group's name
 * carries the size of its crowd — and ties in the order they were given, so
 * the answer never depends on how the sort was implemented.
 * @param labels - The words, in the order the caller gave them.
 * @returns Their indices, best served first.
 */
function placementOrder(labels: readonly ScatterPixelLabel[]): number[] {
  const order = new Array<number>(labels.length);
  for (let index = 0; index < labels.length; index++) order[index] = index;
  return order.toSorted((one, other) => {
    const first = labels[one]?.weight ?? 0;
    const second = labels[other]?.weight ?? 0;
    return second - first || one - other;
  });
}

/** How far a word sits clear of the dot it belongs to, in pixels. */
const SEAT_GAP = 3;

/** How far a word may be moved from what it names before it is dropped. */
const DEFAULT_SHIFT = 40;

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
