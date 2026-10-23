import type { FastifyInstance } from 'fastify';

/** Options of {@link listenSite}. */
export interface ListenSiteOptions {
  /** The port to listen on. */
  port: number;
  /**
   * The interface to listen on.
   * @default '0.0.0.0' - every interface, as a container needs
   */
  host?: string;
  /**
   * Run once the server has closed on a signal: stop what the server does not
   * own itself, such as a scheduler or a write queue started beside it.
   * @default undefined - nothing more is stopped
   */
  onClose?: () => void | Promise<void>;
  /**
   * The signals that close the server.
   * @default ['SIGTERM', 'SIGINT'] - what `docker stop` and a terminal send
   */
  signals?: readonly NodeJS.Signals[];
}

/**
 * Listen, and close cleanly when the container is stopped.
 *
 * On the first signal the server closes — its `onClose` hooks stop the worker
 * pools it owns — then `onClose` runs. A close that fails is logged and leaves
 * `process.exitCode` at 1 rather than surfacing as an unhandled rejection, and
 * the process ends on its own once nothing is left running. A server that
 * cannot listen is logged, closed and reported the same way.
 *
 *   await listenSite(app, { port: config.port, host: config.host });
 * @param app - The server, built and not yet listening.
 * @param options - Where to listen, and what else to stop.
 * @throws {Error} When the server cannot listen, after it has been closed.
 */
export async function listenSite(
  app: FastifyInstance,
  options: ListenSiteOptions,
): Promise<void> {
  const {
    port,
    host = '0.0.0.0',
    onClose,
    signals = ['SIGTERM', 'SIGINT'],
  } = options;

  const stop = () => {
    for (const signal of signals) process.off(signal, stop);
    void shutDown(app, onClose);
  };
  for (const signal of signals) process.once(signal, stop);

  try {
    await app.listen({ port, host });
  } catch (error) {
    for (const signal of signals) process.off(signal, stop);
    app.log.error(error, `the server could not listen on ${host}:${port}`);
    process.exitCode = 1;
    await shutDown(app, onClose);
    throw error;
  }
}

/**
 * Close the server, then run what else has to stop, reporting a failure of
 * either through the log and the exit code.
 * @param app - The server.
 * @param onClose - What else to stop.
 */
async function shutDown(
  app: FastifyInstance,
  onClose: (() => void | Promise<void>) | undefined,
): Promise<void> {
  try {
    await app.close();
  } catch (error) {
    app.log.error(error, 'the server did not close cleanly');
    process.exitCode = 1;
  }
  if (onClose === undefined) return;
  try {
    await onClose();
  } catch (error) {
    app.log.error(error, 'what runs beside the server did not stop cleanly');
    process.exitCode = 1;
  }
}
