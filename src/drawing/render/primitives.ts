/**
 * What a drawing is drawn with: lines, polygons, paths, dots, text, captions and images, each in its owner's item of the scene.
 */

import type { Span } from '../core/richText.ts';
import type { Box, Point } from '../core/types.ts';

import type { ImagePrimitive } from './pictures.ts';

/** A straight stroke. */
export interface LinePrimitive {
  /** The kind of primitive. */
  kind: 'line';
  /** One end. */
  from: Point;
  /** The other end. */
  to: Point;
  /** Stroke width, in points. */
  width: number;
  /**
   * Dash and gap lengths, in points, for a dashed stroke.
   * @default undefined — solid
   */
  dash?: readonly number[];
}

/** A filled polygon: the body of a wedge, an arrowhead. */
export interface PolygonPrimitive {
  /** The kind of primitive. */
  kind: 'polygon';
  /** The corners, in order. */
  points: Point[];
}

/** A stroked or filled path: a bracket, a curly arrow, the walls of a piece. */
export interface PathPrimitive {
  /** The kind of primitive. */
  kind: 'path';
  /** SVG path data, in points. */
  d: string;
  /** Stroke width, in points. */
  width: number;
  /** Every point the path passes through or bends towards, for its bounds. */
  extent: Point[];
  /**
   * Dash and gap lengths, in points, for a dashed stroke.
   * @default undefined — solid
   */
  dash?: readonly number[];
  /**
   * What fills a closed path, `#rrggbb` or `#rrggbbaa`.
   * @default undefined — not filled
   */
  fill?: string;
  /**
   * False for a filled path drawn without its outline.
   * @default true
   */
  outline?: false;
  /**
   * The colour of its stroke, `#rrggbb`, when not the ink of what it belongs
   * to: the wisps of vapour off a coloured liquid.
   * @default the item's ink
   */
  color?: string;
  /**
   * The place of a rising bubble in its stream, from the bottom: the screen
   * sets it rising, a step behind the one under it; a file draws it still.
   * @default undefined — not a bubble
   */
  bubble?: number;
  /**
   * Whether it alone turns while its piece runs, the rest still: a stirrer's
   * paddle under its shaft. Set moving it turns; a file holds it still.
   * @default undefined — the whole piece turns, as a stir bar does
   */
  turns?: true;
  /**
   * The run of a bubble carried by running water, of one rising through a
   * boiling liquid, of a falling drop: the screen moves it along the path,
   * given from where it is drawn, a whole run every `duration` seconds,
   * `begin` seconds into it. Where it cannot move — in a file, on a screen
   * asking for less motion — it is left out, or drawn where it stands when
   * `still` says so.
   * @default undefined — it stays where it is
   */
  flow?: { path: string; begin: number; duration: number; still?: boolean };
}

/** A filled dot: an unpaired electron, half a lone pair. */
export interface DotPrimitive {
  /** The kind of primitive. */
  kind: 'dot';
  /** Centre, in points. */
  x: number;
  /** Centre, in points. */
  y: number;
  /** Radius, in points. */
  r: number;
}

/** A run of text. */
export interface TextPrimitive {
  /** The kind of primitive. */
  kind: 'text';
  /** The characters. */
  text: string;
  /** Left end, in points. */
  x: number;
  /** Baseline, in points. */
  y: number;
  /** Font size, in points. */
  size: number;
  /**
   * Its own ink, `#rrggbb`, where its meaning sets the colour.
   * @default the ink of its object
   */
  color?: string;
  /**
   * What it says about its atom when it is no part of the atom's label: the
   * mark of a stereo group, or the atom-atom map number.
   * @default undefined — the atom's label
   */
  role?: 'stereo-group' | 'atom-map';
}

/**
 * A caption: lines of styled runs, each line one SVG text element that the
 * renderer flows and aligns itself.
 */
export interface CaptionPrimitive {
  /** The kind of primitive. */
  kind: 'caption';
  /** Where the lines are aligned, in points. */
  x: number;
  /** The baseline of the first line, in points. */
  y: number;
  /** How the lines line up on `x`. */
  anchor: 'start' | 'middle' | 'end';
  /** The font size, in points. */
  size: number;
  /** The CSS font family. */
  family: string;
  /** The baseline of each line, in points. */
  baselines: number[];
  /** The largest font size of each line, in points, for the bounds. */
  sizes: number[];
  /** The runs of each line. */
  lines: Span[][];
  /** The width each line takes, in points, for the bounds. */
  widths: number[];
  /** The clockwise turn about `x`, `y`, in degrees. */
  rotation: number;
}

/** Anything a drawing is rendered into. */
export type Primitive =
  | LinePrimitive
  | PolygonPrimitive
  | PathPrimitive
  | DotPrimitive
  | TextPrimitive
  | CaptionPrimitive
  | ImagePrimitive;

/** What a group of primitives draws. */
/** What an item of the scene draws: a kind of the site's, and an identifier. */
export interface SceneOwner<K extends string = string> {
  /** The kind of object: an object type, or what else the site draws. */
  kind: K;
  /** Its identifier. */
  id: string;
}

/** The primitives of one object. */
export interface SceneItem<K extends string = string> {
  /** The object drawn. */
  owner: SceneOwner<K>;
  /** How it is drawn. */
  primitives: Primitive[];
  /**
   * Its ink, `#rrggbb` or `#rrggbbaa`.
   * @default the drawing's ink
   */
  color?: string;
  /**
   * For a stir bar a running stirrer turns, the way it lies, in degrees: set
   * moving, it turns about the upright; a file holds it still.
   * @default undefined — it stays still
   */
  turning?: number;
}

/** A whole rendered drawing. */
export interface Scene<K extends string = string> {
  /** Every object, in the order it is drawn, the last on top. */
  items: Array<SceneItem<K>>;
  /** The box every primitive fits in; empty for an empty drawing. */
  bounds: Box;
}
