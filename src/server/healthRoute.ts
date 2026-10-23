import type { FastifyInstance } from 'fastify';

import { ALLOW_ORIGIN, HIDDEN } from './routeOptions.ts';

/** Options of {@link healthRoute}. */
export interface HealthRouteOptions {
  /**
   * More fields for the answer, read locally and cheaply: a probe every 30 s
   * must never wait on another service, or a dependency that is down rolls back
   * a good release. `status` is always `ok`, whatever this returns.
   * @default undefined - the answer is `{ status: 'ok' }`
   */
  extra?: () => Record<string, unknown> | Promise<Record<string, unknown>>;
}

/**
 * Answer `GET /health`, what the container's health check and the server's
 * deploy script probe before they keep a new container.
 *
 * It is at the root, never versioned, because it probes the process rather than
 * the API contract. It logs nothing, or a probe every 30 s fills the log; it is
 * kept out of the API's documentation; and it is open to any origin, like
 * everything else a site serves.
 *
 *   await healthRoute(app);
 * @param fastify - The server.
 * @param options - Extra fields for the answer.
 */
export async function healthRoute(
  fastify: FastifyInstance,
  options: HealthRouteOptions = {},
): Promise<void> {
  const { extra } = options;
  fastify.get(
    '/health',
    { logLevel: 'silent', schema: HIDDEN },
    async (_request, reply) => {
      const fields = extra === undefined ? {} : await extra();
      return reply.header(ALLOW_ORIGIN, '*').send({ ...fields, status: 'ok' });
    },
  );
}
