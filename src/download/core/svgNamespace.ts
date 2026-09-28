/**
 * The namespace every SVG element is created in.
 *
 * `document.createElementNS` needs it to make an element the browser draws
 * rather than an unknown tag, and a file written out needs it declared on the
 * root or nothing will open it.
 */
// eslint-disable-next-line unicorn/prefer-https -- the SVG namespace is a fixed identifier, not a URL to fetch
export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
