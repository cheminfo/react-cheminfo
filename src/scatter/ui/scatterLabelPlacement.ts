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

import {
  LabelBoxField,
  labelBoxHeight,
  labelBoxWidth,
} from './scatterLabelBoxes.ts';
import { freeSeat, written } from './scatterLabelSeats.ts';
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

/** How far a word may be moved from what it names before it is dropped. */
const DEFAULT_SHIFT = 40;
