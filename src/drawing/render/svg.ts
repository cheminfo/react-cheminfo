/**
 * A scene written as SVG markup, in the order the editor paints it.
 *
 * Each object is a group, `<g cd:glass="g1">`, `<g cd:atom="a1">`, naming the
 * object of the drawing it draws; the atoms and bonds of a molecule stand in
 * the molecule's group. A piece of glassware that runs carries its motion,
 * held still unless the page showing it sets it moving. The markup only
 * draws: what the drawing holds is stated in the metadata of the native SVG.
 */

import { splitColor } from '../core/palette.ts';
import type { Box, FigureSize } from '../core/types.ts';

import { primitivesBounds } from './bounds.ts';
import { captionMarkup } from './captionMarkup.ts';
import { escapeAttribute, escapeText, number } from './markup.ts';
import { RUN_FADE, bubbleDelay, runTiming } from './motion.ts';
import { figureBox } from './pageGrid.ts';
import { imageTransform } from './pictures.ts';
import type {
  LinePrimitive,
  PathPrimitive,
  Primitive,
  Scene,
  SceneItem,
} from './primitives.ts';
import type { DrawingStyle } from './style.ts';

/** The namespace of the attributes a drawing writes. */
export const DRAW_NAMESPACE = 'https://draw.cheminfo.org/ns/1';

/** A molecule of the drawing, as its group in the SVG names it. */
export interface MoleculeGroup {
  /** Identifier of the group, `m1`, `m2`… */
  id: string;
  /** The atoms in it. */
  atoms: readonly string[];
  /** The bonds in it. */
  bonds: readonly string[];
}

/** How the drawing is written. */
export interface SvgOptions {
  /** The drawing style, for the ink, the line width and the font. */
  style: DrawingStyle;
  /**
   * How the atoms and bonds are grouped into molecules.
   * @default [] — each atom and bond on its own
   */
  molecules?: readonly MoleculeGroup[];
  /**
   * The `aria-label` of each object named by one, by `kind:id`.
   * @default undefined — no object is labelled
   */
  labels?: ReadonlyMap<string, string>;
  /**
   * The figure's size, centred on the drawing.
   * @default undefined — the drawing and its padding
   */
  figure?: FigureSize;
}

/**
 * The drawing markup of a scene, without the `<svg>` element around it: every
 * object in the order the editor paints it, so what is drawn over another
 * object in the editor is drawn over it in any SVG viewer. The atoms and bonds
 * of a molecule stand in its group, written where its first one is painted.
 * @param scene - The scene.
 * @param options - Grouping and attributes.
 * @returns The markup of the drawing's groups.
 */
export function sceneBody(scene: Scene, options: SvgOptions): string {
  const { style, molecules = [] } = options;
  const groups = moleculeGroups(scene, molecules);
  const parts: string[] = [];
  for (const item of scene.items) {
    const group = groups.get(item);
    if (!group) {
      parts.push(itemMarkup(item, options));
    } else if (group.items[0] === item) {
      const inner = group.items.map((member) => itemMarkup(member, options));
      parts.push(
        `<g cd:molecule="${escapeAttribute(group.molecule.id)}"${labelMarkup(options, 'molecule', group.molecule.id)}>${inner.join('')}</g>`,
      );
    }
  }
  return `${backgroundMarkup(scene, options)}<g fill="none" stroke="${style.color}" stroke-width="${number(style.lineWidth)}" stroke-linecap="round" stroke-linejoin="round" font-family="${escapeAttribute(style.fontFamily)}">${parts.join('')}</g>`;
}

/**
 * The markup a sheet of the paper shows: the items that reach it, over the
 * background filling the sheet edge to edge.
 * @param scene - The scene.
 * @param sheet - The sheet.
 * @param options - Grouping and attributes.
 * @returns The markup.
 */
export function sheetBody(
  scene: Scene,
  sheet: Box,
  options: SvgOptions,
): string {
  const items = scene.items.filter((item) => {
    const box = primitivesBounds(item.primitives);
    return box !== undefined && boxesMeet(box, sheet);
  });
  const { background, ...style } = options.style;
  return `${background ? backgroundRect(sheet, background) : ''}${sceneBody(
    { ...scene, items },
    { ...options, style },
  )}`;
}

function boxesMeet(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

/** A molecule of the drawing, and the items it paints, in paint order. */
interface PaintedMolecule {
  /** The molecule's group. */
  molecule: MoleculeGroup;
  /** Its bonds and atoms that draw something. */
  items: SceneItem[];
}

function moleculeGroups(
  scene: Scene,
  molecules: readonly MoleculeGroup[],
): Map<SceneItem, PaintedMolecule> {
  const byObject = new Map<string, PaintedMolecule>();
  for (const molecule of molecules) {
    const group: PaintedMolecule = { molecule, items: [] };
    for (const id of molecule.bonds) byObject.set(`bond:${id}`, group);
    for (const id of molecule.atoms) byObject.set(`atom:${id}`, group);
  }
  const groups = new Map<SceneItem, PaintedMolecule>();
  for (const item of scene.items) {
    const group = byObject.get(`${item.owner.kind}:${item.owner.id}`);
    if (!group) continue;
    group.items.push(item);
    groups.set(item, group);
  }
  return groups;
}

function backgroundMarkup(scene: Scene, options: SvgOptions): string {
  const background = options.style.background;
  if (!background) return '';
  return backgroundRect(figureBox(scene, options.figure), background);
}

function backgroundRect(box: Box, background: string): string {
  const { x, y, width, height } = box;
  const { hex, opacity } = splitColor(background);
  const alpha = opacity < 1 ? ` fill-opacity="${number(opacity)}"` : '';
  return `<rect cd:background="true" x="${number(x)}" y="${number(y)}" width="${number(width)}" height="${number(height)}" fill="${hex}"${alpha}/>`;
}

function itemMarkup(item: SceneItem, options: SvgOptions): string {
  const kind = item.owner.kind;
  const id = escapeAttribute(item.owner.id);
  const { style } = options;
  const label = labelMarkup(options, kind, item.owner.id);
  const { hex, opacity } = splitColor(item.color ?? style.color);
  const ink = item.color ? ` stroke="${hex}"` : '';
  const faded = opacity < 1 ? ` opacity="${number(opacity)}"` : '';
  const markup = (primitives: readonly Primitive[]) =>
    primitives
      .map((primitive) => primitiveMarkup(primitive, style, hex))
      .join('');
  // A piece whose paddle alone turns keeps the rest still.
  if (item.turning !== undefined && item.primitives.some(turnsAlone)) {
    const still = item.primitives.filter((primitive) => !turnsAlone(primitive));
    const paddle = item.primitives.filter(turnsAlone);
    return `<g cd:${kind}="${id}"${label}${ink}${faded}>${markup(still)}<g${turningMarkup(item.turning)}>${markup(paddle)}</g></g>`;
  }
  const turning = item.turning === undefined ? '' : turningMarkup(item.turning);
  return `<g cd:${kind}="${id}"${label}${ink}${faded}${turning}>${markup(item.primitives)}</g>`;
}

function turnsAlone(primitive: Primitive): boolean {
  return primitive.kind === 'path' && primitive.turns === true;
}

// What sets a stir bar turning about the upright, the way it lies.
function turningMarkup(lying: number): string {
  return ` class="glass-turning" style="--glass-lying: ${number(lying)}deg"`;
}

/**
 * One primitive as an SVG element.
 * @param primitive - The primitive.
 * @param style - The drawing style, for the line width.
 * @param ink - The colour it is drawn in, `#rrggbb`.
 * @returns The element's markup.
 */
export function primitiveMarkup(
  primitive: Primitive,
  style: DrawingStyle,
  ink: string = style.color,
): string {
  switch (primitive.kind) {
    case 'line':
      return `<line x1="${number(primitive.from.x)}" y1="${number(primitive.from.y)}" x2="${number(primitive.to.x)}" y2="${number(primitive.to.y)}"${strokeMarkup(primitive, style)}/>`;
    case 'polygon':
      return `<polygon points="${primitive.points.map((point) => `${number(point.x)},${number(point.y)}`).join(' ')}" fill="${ink}" stroke="none"/>`;
    case 'path':
      return pathMarkup(primitive, style);
    case 'dot':
      return `<circle cx="${number(primitive.x)}" cy="${number(primitive.y)}" r="${number(primitive.r)}" fill="${ink}" stroke="none"/>`;
    case 'text':
      return `<text x="${number(primitive.x)}" y="${number(primitive.y)}" font-size="${number(primitive.size)}" fill="${primitive.color ?? ink}" stroke="none">${escapeText(primitive.text)}</text>`;
    case 'caption':
      return captionMarkup(primitive, ink);
    case 'image': {
      const transform = imageTransform(primitive);
      const turn = transform ? ` transform="${transform}"` : '';
      return `<image x="${number(primitive.x)}" y="${number(primitive.y)}" width="${number(primitive.width)}" height="${number(primitive.height)}" preserveAspectRatio="none"${turn} xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${escapeAttribute(primitive.href)}"/>`;
    }
    default:
      return '';
  }
}

// A run is written hidden, so a program that reads no style leaves it out,
// and a run drawn where it stands is written a second time, as the still copy
// a figure held still shows.
function pathMarkup(primitive: PathPrimitive, style: DrawingStyle): string {
  const paint = `${strokeMarkup(primitive, style)}${fillMarkup(primitive)}`;
  const { d, flow, bubble } = primitive;
  if (flow) {
    const timing = runTiming(flow);
    const clock = `begin="${timing.begin}" dur="${timing.dur}" repeatCount="${timing.repeatCount}"`;
    const run = `<path class="glass-run" display="none" d="${d}"${paint}><animateMotion path="${escapeAttribute(flow.path)}" ${clock}/><animate attributeName="opacity" values="${RUN_FADE.values}" keyTimes="${RUN_FADE.keyTimes}" ${clock}/></path>`;
    return flow.still
      ? `<path class="glass-stands" d="${d}"${paint}/>${run}`
      : run;
  }
  const rising =
    bubble === undefined
      ? ''
      : ` class="glass-bubble" style="animation-delay: ${bubbleDelay(bubble)}"`;
  return `<path${rising} d="${d}"${paint}/>`;
}

function strokeMarkup(
  primitive: LinePrimitive | PathPrimitive,
  style: DrawingStyle,
): string {
  const width =
    (primitive.width === style.lineWidth
      ? ''
      : ` stroke-width="${number(primitive.width)}"`) +
    ('color' in primitive && primitive.color && primitive.outline !== false
      ? ` stroke="${primitive.color}"`
      : '');
  if (!primitive.dash) return width;
  return `${width} stroke-dasharray="${primitive.dash.map((value) => number(value)).join(' ')}" stroke-linecap="butt"`;
}

// A fill is written as a colour and an opacity, never as `#rrggbbaa`, which
// Illustrator, Office and older Inkscape ignore.
function fillMarkup(primitive: PathPrimitive): string {
  const stroke = primitive.outline === false ? ' stroke="none"' : '';
  if (!primitive.fill) return stroke;
  const { hex, opacity } = splitColor(primitive.fill);
  const alpha = opacity < 1 ? ` fill-opacity="${number(opacity)}"` : '';
  return ` fill="${hex}"${alpha}${stroke}`;
}

function labelMarkup(options: SvgOptions, kind: string, id: string): string {
  const label = options.labels?.get(`${kind}:${id}`);
  return label === undefined ? '' : ` aria-label="${escapeAttribute(label)}"`;
}
