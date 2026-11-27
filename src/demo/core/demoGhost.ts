/**
 * What a demo draws under its pointer while it drags, as the browser draws a
 * faint copy of what is dragged: the image the page chose, or a copy of the
 * element that keeps its look outside its place in the page.
 */

import type { DemoPoint } from './demoEvents.ts';

/** The image a page gave its drag, and the point of it under the pointer. */
export interface DragImage {
  element: Element;
  x: number;
  y: number;
}

/** What is drawn under the demo's pointer while it drags. */
export interface Ghost {
  move: (point: DemoPoint) => void;
  remove: () => void;
}

/**
 * The image the page chose for its drag, held by the point it named.
 * @param image - The image, and its point under the pointer.
 * @param grab - Where the drag started.
 * @returns How to move the image, and to take it away.
 */
export function createImageGhost(image: DragImage, grab: DemoPoint): Ghost {
  const holder = document.createElement('div');
  holder.className = 'demo-drag-ghost demo-drag-ghost--image';
  holder.setAttribute('aria-hidden', 'true');
  holder.append(image.element.cloneNode(true));
  document.body.append(holder);
  return holderGhost(holder, { x: image.x, y: image.y }, grab);
}

/**
 * A faint copy of what is dragged, held where it was grabbed.
 * @param source - What is dragged.
 * @param grab - Where it was grabbed.
 * @returns How to move the copy, and to take it away.
 */
export function createGhost(source: Element, grab: DemoPoint): Ghost {
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
  return holderGhost(holder, offset, grab);
}

/**
 * Move a holder already in the page with the pointer, the point `offset` of
 * it under the pointer.
 * @param holder - The element drawn under the pointer.
 * @param offset - Which point of it the pointer holds.
 * @param grab - Where the drag started.
 * @returns How to move it, and to take it away.
 */
function holderGhost(
  holder: HTMLElement,
  offset: DemoPoint,
  grab: DemoPoint,
): Ghost {
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
