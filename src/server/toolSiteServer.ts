import type { FastifyInstance, FastifyServerOptions } from 'fastify';

import { siteById } from '../ecosystem/core/lookup.ts';
import type { SiteId } from '../ecosystem/core/sites.ts';

import type { ServerConfig } from './config.ts';
import type { ListenSiteOptions } from './listenSite.ts';
import { listenSite } from './listenSite.ts';
import { readRepositoryVersion } from './repositoryVersion.ts';
import { DEFAULT_RESERVED } from './routeOptions.ts';
import { staticSite } from './staticSite.ts';

/** What a site's API is registered with. */
export interface ToolSiteContext {
  /** The site, as `ECOSYSTEM_SITES` names it. */
  siteId: SiteId;
  /** Its host, `osiris.cheminfo.org`: what the tool server and its documentation are called. */
  name: string;
  /** The release the repository is at. */
  version: string;
  /** The configuration the server was built with. */
  config: ServerConfig;
}

/** Options of {@link toolSiteServer}. */
export interface ToolSiteServerOptions {
  /** The site, as `ECOSYSTEM_SITES` names it. */
  siteId: SiteId;
  /** The configuration, from `readServerConfig`. */
  config: ServerConfig;
  /**
   * Register the API beside the pages: the tool routes of
   * `cheminfo-mcp-server` under `/v1`, their documentation at `/docs`.
   */
  registerApi: (
    app: FastifyInstance,
    context: ToolSiteContext,
  ) => void | Promise<void>;
  /**
   * Addresses the site does not have any more, and the one that does their
   * work; the query is carried over.
   * @default {}
   */
  redirects?: Readonly<Record<string, string>>;
  /**
   * Whether, and how, Fastify logs.
   * @default true
   */
  logger?: FastifyServerOptions['logger'];
  /**
   * Address prefixes the API answers, which never answer a page.
   * @default ['/v1/', '/docs']
   */
  reserved?: readonly string[];
  /**
   * The release the API reports.
   * @default the root `package.json` of the repository the process runs in
   */
  version?: string;
}

/**
 * Build a tool site's server without listening: the API the site registers,
 * then the same build the static host serves, by the static hosts' rules.
 *
 * The page never calls the API — it computes in the browser — so the server only
 * adds: the tools under `/v1` for chats and MCP clients, documented at `/docs`.
 *
 *   const app = await toolSiteServer({
 *     siteId: 'osiris',
 *     config,
 *     registerApi: (app, { name, version }) => registerTools(app, name, version),
 *   });
 * @param options - The site, its configuration and its API.
 * @returns The server, ready to listen or to be injected in tests.
 */
export async function toolSiteServer(
  options: ToolSiteServerOptions,
): Promise<FastifyInstance> {
  const {
    siteId,
    config,
    registerApi,
    redirects = {},
    logger = true,
    reserved = DEFAULT_RESERVED,
  } = options;
  // An optional peer, installed only by a site that has a server.
  const { fastify } = await import('fastify');
  const app = fastify({ logger, trustProxy: config.trustProxy });
  const version = options.version ?? readRepositoryVersion(process.cwd());
  await registerApi(app, {
    siteId,
    name: siteById(siteId).host,
    version,
    config,
  });
  await app.register(staticSite, {
    root: config.root,
    trackingScript: config.trackingScript,
    redirects,
    reserved,
    basePath: config.basePath,
  });
  return app;
}

/**
 * Build a site's server from its configuration, listen where it says, and close
 * cleanly when the container is stopped — the whole of a `main.ts`:
 *
 *   await startToolServer(buildServer, readServerConfig(process.env, SITE));
 * @param build - Builds the server, e.g. with {@link toolSiteServer}.
 * @param config - The configuration, from `readServerConfig`.
 * @param options - What else to stop, and on which signals.
 * @returns The server, listening.
 * @throws {Error} When the server cannot listen, after it has been closed.
 */
export async function startToolServer(
  build: (config: ServerConfig) => FastifyInstance | Promise<FastifyInstance>,
  config: ServerConfig,
  options: Pick<ListenSiteOptions, 'onClose' | 'signals'> = {},
): Promise<FastifyInstance> {
  const app = await build(config);
  await listenSite(app, { ...options, port: config.port, host: config.host });
  return app;
}
