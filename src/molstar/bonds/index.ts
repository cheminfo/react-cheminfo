/**
 * The longest bond molstar draws between two elements.
 *
 * Its own path because it is one small molstar module: a page that fills a
 * crystal's cell before the viewer has loaded completes its molecules by the
 * rule the viewer will join them by, without downloading the viewer.
 */

export { bondLimit } from './bondRule.ts';
