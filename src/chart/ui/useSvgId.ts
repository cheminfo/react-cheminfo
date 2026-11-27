import { useId } from 'react';

/**
 * An id to name an SVG element by — a clip path, a gradient — unique on the
 * page and safe inside `url(#…)`.
 * @param prefix - What the id starts with, naming the figure it belongs to.
 * @returns The id, React's own stripped of everything but letters and digits.
 */
export function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replaceAll(/\W/g, '')}`;
}
