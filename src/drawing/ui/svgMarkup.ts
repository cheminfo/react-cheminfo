/**
 * Static SVG elements written out as markup, for an image that is no part of
 * the page — a cursor — drawn by the same components as the palette.
 */

import type { ReactElement, ReactNode } from 'react';
import { Fragment, isValidElement } from 'react';

/** The attributes SVG spells in camel case, which are written as they are. */
const CAMEL_ATTRIBUTES: ReadonlySet<string> = new Set([
  'viewBox',
  'preserveAspectRatio',
]);

/**
 * The markup of an SVG drawing given as elements; a component is called with
 * its props, so it must use no hook.
 * @param node - The drawing.
 * @returns Its markup.
 */
export function svgMarkup(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return escapeText(String(node));
  }
  if (Array.isArray(node)) {
    let markup = '';
    for (const child of node as ReactNode[]) markup += svgMarkup(child);
    return markup;
  }
  if (!isValidElement(node)) return '';
  const { type, props } = node as ReactElement<Record<string, unknown>>;
  if (type === Fragment) return svgMarkup(props.children as ReactNode);
  if (typeof type === 'function') {
    return svgMarkup((type as (props: unknown) => ReactNode)(props));
  }
  if (typeof type !== 'string') return '';
  let attributes = '';
  for (const [name, value] of Object.entries(props)) {
    if (name === 'children') continue;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value === true
    ) {
      attributes += ` ${attributeName(name)}="${escapeAttribute(String(value))}"`;
    }
  }
  return `<${type}${attributes}>${svgMarkup(props.children as ReactNode)}</${type}>`;
}

function attributeName(name: string): string {
  if (name === 'className') return 'class';
  if (CAMEL_ATTRIBUTES.has(name) || name.includes('-')) return name;
  return name.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function escapeText(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttribute(text: string): string {
  return escapeText(text).replaceAll('"', '&quot;');
}
