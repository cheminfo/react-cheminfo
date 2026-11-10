/**
 * The layout jsdom does not do, stated by a test: where a box sits, and where
 * each character of a run of words was set.
 */

import { vi } from 'vitest';

import { SVG_NAMESPACE } from '../svgNamespace.ts';

/** Where the characters of a run of words were set, one cell each. */
export interface TypeSetting {
  /** The left edge of the first character of every line. */
  left: number;
  /** The top edge of the first line. */
  top: number;
  /** How wide each character is. */
  advance: number;
  /** How tall each line is. */
  height: number;
  /**
   * How many characters fit on one line.
   * @default every character on one line
   */
  perLine?: number;
}

const settings = new WeakMap<Text, TypeSetting>();

/**
 * A box on the page, as `getBoundingClientRect` reports it.
 * @param left - Its left edge.
 * @param top - Its top edge.
 * @param width - Its width.
 * @param height - Its height.
 * @returns The box.
 */
export function rect(
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

/**
 * Say where the browser put an element.
 * @param element - The element.
 * @param left - Its left edge.
 * @param top - Its top edge.
 * @param width - Its width.
 * @param height - Its height.
 * @returns The element.
 */
export function placeAt<T extends Element>(
  element: T,
  left: number,
  top: number,
  width: number,
  height: number,
): T {
  element.getBoundingClientRect = () => rect(left, top, width, height);
  return element;
}

/**
 * A box holding one drawing, shown at a size from the top left of the page.
 * @param id - The box's `id`.
 * @param width - How wide the drawing is shown, and its view box.
 * @param height - How tall.
 * @returns The box, not yet in the document.
 */
export function figureBox(
  id: string,
  width: number,
  height: number,
): HTMLDivElement {
  const box = document.createElement('div');
  box.id = id;
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  box.append(placeAt(svg, 0, 0, width, height));
  return box;
}

/**
 * Say where the browser set the characters of a run. A newline is collapsed,
 * as `white-space: normal` collapses it, and measures nothing.
 * @param node - The run.
 * @param setting - Where its characters are.
 * @returns The run.
 */
export function typeset(node: Text, setting: TypeSetting): Text {
  settings.set(node, setting);
  return node;
}

/**
 * Make every range the page creates measure the characters it spans, from
 * what {@link typeset} said about them. Restored by `vi.restoreAllMocks()`.
 */
export function measureRanges(): void {
  const create = document.createRange.bind(document);
  vi.spyOn(document, 'createRange').mockImplementation(() => {
    const range = create();
    range.getBoundingClientRect = () => rangeBox(range);
    return range;
  });
}

/**
 * The box a range of one run covers.
 * @param range - The range.
 * @returns The union of its characters' boxes, empty where none is set.
 */
function rangeBox(range: Range): DOMRect {
  const node = range.startContainer;
  if (!(node instanceof Text)) return rect(0, 0, 0, 0);
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (let index = range.startOffset; index < range.endOffset; index++) {
    const box = characterBox(node, index);
    if (box === undefined) continue;
    left = Math.min(left, box.left);
    top = Math.min(top, box.top);
    right = Math.max(right, box.right);
    bottom = Math.max(bottom, box.bottom);
  }
  if (!Number.isFinite(left)) return rect(0, 0, 0, 0);
  return rect(left, top, right - left, bottom - top);
}

function characterBox(node: Text, index: number): DOMRect | undefined {
  const setting = settings.get(node);
  if (setting === undefined || node.data[index] === '\n') return undefined;
  const { left, top, advance, height } = setting;
  const perLine = setting.perLine ?? node.data.length;
  const line = Math.floor(index / perLine);
  const column = index % perLine;
  return rect(left + column * advance, top + line * height, advance, height);
}
