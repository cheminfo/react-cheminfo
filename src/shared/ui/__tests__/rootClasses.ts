/** The class a root-className test hands every component. */
export const PROBE = 'probe';

/**
 * The class names on the first element of some markup, in the order they are
 * written.
 * @param html - Markup rendered by a component.
 * @returns The names on its root element; `['']` when it carries none.
 */
export function rootClasses(html: string): string[] {
  const root = /^<[a-z]+\b[^>]*>/u.exec(html)?.[0] ?? '';
  const names = /\sclass="(?<names>[^"]*)"/u.exec(root)?.groups?.names ?? '';
  return names.split(' ');
}

/** Does nothing: the components are rendered to be read, never edited. */
export function noop(): void {
  // Nothing is edited: only the markup is read.
}
