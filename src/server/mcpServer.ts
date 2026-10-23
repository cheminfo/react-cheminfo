import { createRequire } from 'node:module';

import type * as McpServer from 'cheminfo-mcp-server';

const require = createRequire(import.meta.url);

/**
 * `cheminfo-mcp-server`, an optional peer, loaded when a helper first needs
 * it, so `react-cheminfo/server` imports on a site that serves no tools.
 * @returns The module.
 */
export function mcpServer(): typeof McpServer {
  return require('cheminfo-mcp-server') as typeof McpServer;
}
