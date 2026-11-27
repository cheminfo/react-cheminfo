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
import { gradientDefs } from './gradients.ts';
import { escapeAttribute, number } from './markup.ts';
import { figureBox } from './pageGrid.ts';
import { primitiveMarkup } from './primitiveMarkup.ts';
import type { Primitive, Scene, SceneItem } from './primitives.ts';
import { spinClass, spinRuns } from './spinning.ts';
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
  return `${backgroundMarkup(scene, options)}${gradientDefs(scene)}<g fill="none" stroke="${style.color}" stroke-width="${number(style.lineWidth)}" stroke-linecap="round" stroke-linejoin="round" font-family="${escapeAttribute(style.fontFamily)}">${parts.join('')}</g>`;
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
    spinRuns(primitives)
      .map(({ spins, primitives: run }) => {
        const inner = run.map((one) => primitiveMarkup(one, style, hex));
        return spins
          ? `<g class="${spinClass(spins)}">${inner.join('')}</g>`
          : inner.join('');
      })
      .join('');
  const motion = motionOf(item);
  // A piece whose paddle or platform alone moves keeps the rest still.
  if (motion && item.primitives.some(motion.alone)) {
    const still = item.primitives.filter(
      (primitive) => !motion.alone(primitive),
    );
    const moving = item.primitives.filter(motion.alone);
    return `<g cd:${kind}="${id}"${label}${ink}${faded}>${markup(still)}<g${motion.markup}>${markup(moving)}</g></g>`;
  }
  const whole = motion?.markup ?? '';
  return `<g cd:${kind}="${id}"${label}${ink}${faded}${whole}>${markup(item.primitives)}</g>`;
}

// How a piece moves, and which of its primitives move alone when some do: a
// stir bar turns, a stirrer's paddle under its shaft; a flask on an orbital
// shaker swirls, the shaker's platform over its casing.
function motionOf(
  item: SceneItem,
): { markup: string; alone: (primitive: Primitive) => boolean } | undefined {
  if (item.turning !== undefined) {
    return { markup: turningMarkup(item.turning), alone: turnsAlone };
  }
  if (item.swirling !== undefined) {
    return { markup: swirlingMarkup(item.swirling), alone: swirlsAlone };
  }
  return undefined;
}

function turnsAlone(primitive: Primitive): boolean {
  return primitive.kind === 'path' && primitive.turns === true;
}

function swirlsAlone(primitive: Primitive): boolean {
  return primitive.kind === 'path' && primitive.swirls === true;
}

// What sets a piece swirling on the orbit of an orbital shaker.
function swirlingMarkup(orbit: number): string {
  return ` class="glass-swirling" style="--glass-orbit: ${number(orbit)}px"`;
}

// What sets a stir bar turning about the upright, the way it lies.
function turningMarkup(lying: number): string {
  return ` class="glass-turning" style="--glass-lying: ${number(lying)}deg"`;
}

function labelMarkup(options: SvgOptions, kind: string, id: string): string {
  const label = options.labels?.get(`${kind}:${id}`);
  return label === undefined ? '' : ` aria-label="${escapeAttribute(label)}"`;
}
