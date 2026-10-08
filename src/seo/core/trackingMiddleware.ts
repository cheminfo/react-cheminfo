import { injectTrackingScript } from './trackingScript.ts';

/** What a Cloudflare Pages Function hands its middleware, as far as it is read. */
export interface TrackingMiddlewareContext {
  /** The visitor's request. */
  request: Request;
  /** The project's variables; `TRACKING_SCRIPT` holds the analytics snippet. */
  env: { TRACKING_SCRIPT?: string };
  /** Serve the request from the build, as Pages would without a function. */
  next: () => Promise<Response>;
}

/**
 * Put the analytics snippet in every page a Cloudflare Pages site serves.
 *
 * Pages has no server and no entrypoint to write the deployment's snippet into
 * the build, so it is added per request instead, from the project's
 * `TRACKING_SCRIPT` variable — the deployment owns it, never the build. With
 * the variable unset, and for anything that is not a page, the response the
 * build gives is returned untouched. A site wires it in
 * `functions/_middleware.ts`:
 *
 *   export { onRequest } from 'react-cheminfo/pages';
 * @param context - The Pages Function context.
 * @returns The response, carrying the snippet when it is an HTML page.
 */
export async function trackingScriptMiddleware(
  context: TrackingMiddlewareContext,
): Promise<Response> {
  const response = await context.next();
  const snippet = context.env.TRACKING_SCRIPT?.trim() ?? '';
  if (
    snippet === '' ||
    context.request.method !== 'GET' ||
    response.status === 304 ||
    !response.headers.get('content-type')?.includes('text/html')
  ) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(injectTrackingScript(await response.text(), snippet), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
