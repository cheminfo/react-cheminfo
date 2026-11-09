/**
 * The deployment that saved a figure, so the figure can be opened again in
 * exactly the build that wrote it.
 *
 * A site always opens a figure with its latest build. When that build no
 * longer shows the figure as it was, the deployment that saved it still does:
 * Cloudflare Pages keeps every deployment at an address of its own
 * (`savedRevision.ts`).
 */

/** The running site and its deployment, as `useHostConnection` names them. */
let running: { site: string; deployment: string } | undefined;

/**
 * Name the site running on the page and the build it runs, so every figure of
 * that site the page writes records the deployment that saved it.
 * @param site - The site, as the family names it, e.g. `draw`.
 * @param build - The build that is running, `BUILD_INFO` from
 * `react-cheminfo/build-info`.
 * @returns What forgets it again, unless another has taken its place.
 */
export function setFigureRevision(site: string, build: unknown): () => void {
  const deployment = deploymentOf(build);
  if (deployment === undefined) return () => undefined;
  const named = { site, deployment };
  running = named;
  return () => {
    if (running === named) running = undefined;
  };
}

/**
 * The deployment a figure of a site written now records.
 * @param site - The site the figure belongs to.
 * @returns The running deployment, or `undefined` when the page runs another
 * site or no deployment of Cloudflare Pages.
 */
export function figureRevision(site: string): string | undefined {
  return running?.site === site ? running.deployment : undefined;
}

function deploymentOf(build: unknown): string | undefined {
  if (typeof build !== 'object' || build === null) return undefined;
  const { deployment } = build as { deployment?: unknown };
  if (typeof deployment !== 'string' || !URL.canParse(deployment)) {
    return undefined;
  }
  return new URL(deployment).origin;
}
