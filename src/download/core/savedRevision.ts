/**
 * Where a figure opens in the deployment that saved it. Only a deployment of
 * the running site's own Pages project is ever opened — a file from anywhere
 * cannot send the reader to an address of its choosing.
 */

import { figureRevision } from './figureRevision.ts';
import { readFigureSource } from './figureSource.ts';

/**
 * Where a figure of the running site opens in the deployment that saved it:
 * the page it was drawn on, on that deployment's address.
 * @param svg - The figure, as an SVG document.
 * @param site - The site running on the page, e.g. `draw`.
 * @returns The address, or `undefined` when the figure names no deployment,
 * names the running one, or names one outside the running site's project.
 */
export function savedRevisionAddress(
  svg: string,
  site: string,
): string | undefined {
  const deployment = figureRevision(site);
  const source = readFigureSource(svg);
  if (deployment === undefined || source?.site !== site) return undefined;
  const { revision, href } = source;
  if (revision === undefined || !URL.canParse(revision)) return undefined;
  const saved = new URL(revision);
  if (saved.protocol !== 'https:' || saved.origin === deployment) {
    return undefined;
  }
  if (!sameProject(saved.host, new URL(deployment).host)) return undefined;
  const page = new URL(href);
  return new URL(`${page.pathname}${page.search}`, saved.origin).href;
}

// A deployment is `<id>.<project>.pages.dev`: two are of one project when all
// but their first label agree.
function sameProject(host: string, running: string): boolean {
  const labels = host.split('.');
  const own = running.split('.');
  if (labels.length !== 4 || own.length !== 4) return false;
  if (own[2] !== 'pages' || own[3] !== 'dev') return false;
  if (!/^[a-z\d-]+$/.test(labels[0] ?? '')) return false;
  return labels.slice(1).join('.') === own.slice(1).join('.');
}
