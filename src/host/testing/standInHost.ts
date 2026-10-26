/**
 * A whole host, for a tool's end-to-end tests: a page on another origin that
 * frames the tool, answers its `hello` with a private port, sends it requests,
 * and records what comes back.
 *
 * It is written the way an electronic lab notebook would write one: it checks
 * that `hello` came from its frame and from the tool's origin, and connects
 * only then. A real server serves it on `127.0.0.1` while the tool runs on
 * `localhost`, so every message crosses a real origin boundary — and it has to
 * be a real server: Chrome takes a page that Playwright answers itself for a
 * public one, and a public page may not frame a local site.
 */

import type { Server } from 'node:http';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { HelloMessage } from '../core/protocol.ts';

/** A running stand-in host. */
export interface StandInHost {
  /** Where the host page is served, e.g. `http://127.0.0.1:53211`. */
  origin: string;
  /**
   * The address of a host page that frames `toolUrl` in `#tool` and, once the
   * tool has said `hello`, sends `requests` through the port it hands over.
   * @param toolUrl - The tool's address, `?embed=1` included.
   * @param requests - What to send on the port, in order.
   * @returns The address to open.
   */
  pageUrl: (toolUrl: string, requests: readonly unknown[]) => string;
  /** Stop serving. */
  close: () => Promise<void>;
}

/** What the host page recorded, read with {@link readStandInHostLog}. */
export interface StandInHostLog {
  /** The tool's `hello`, or `null` before it came. */
  hello: HelloMessage | null;
  /** Every message the tool sent on the port, in order: results and outputs. */
  results: unknown[];
}

/**
 * Serve the host page on a free port of `127.0.0.1`.
 * @returns The host; close it when the tests are done.
 */
export async function startStandInHost(): Promise<StandInHost> {
  // A setup carrying a spectrum is tens of kilobytes of address, past the
  // 16 KiB Node allows a request's head by default.
  const server: Server = createServer(
    { maxHeaderSize: MAX_SETUP_BYTES },
    (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(HOST_PAGE);
    },
  );
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address() as AddressInfo;
  const origin = `http://127.0.0.1:${port}`;

  return {
    origin,
    pageUrl: (toolUrl, requests) => {
      const setup = encodeURIComponent(JSON.stringify({ toolUrl, requests }));
      return `${origin}/?setup=${setup}`;
    },
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
}

/**
 * Read what the host page recorded. Runs in the page: hand it to Playwright's
 * `page.evaluate`, as `page.evaluate(readStandInHostLog)`.
 * @returns The log.
 */
export function readStandInHostLog(): StandInHostLog {
  return (globalThis as unknown as { hostLog: StandInHostLog }).hostLog;
}

/**
 * Send one more request on the port, once the tool has connected — a `get`
 * after the user has worked. Runs in the page, as
 * `page.evaluate(sendStandInHostRequest, request)`.
 * @param request - What to send.
 * @returns Whether there was a port to send it on.
 */
export function sendStandInHostRequest(request: unknown): boolean {
  const { hostPort } = globalThis as unknown as {
    hostPort: MessagePort | null;
  };
  hostPort?.postMessage(request);
  return hostPort !== null;
}

/** How long the page's address may be, in bytes: Chrome's own limit is 2 MB. */
const MAX_SETUP_BYTES = 2 * 1024 * 1024;

/**
 * The page. Its setup is its own `?setup=`, so one page serves every test, and
 * it listens before it frames, so the tool's `hello` cannot be missed.
 */
const HOST_PAGE = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Stand-in host</title></head>
<body>
<iframe id="tool" title="The framed tool" style="width: 1280px; height: 800px"></iframe>
<script>
const { toolUrl, requests } = JSON.parse(new URLSearchParams(location.search).get('setup'));
const toolOrigin = new URL(toolUrl).origin;
const frame = document.querySelector('#tool');
globalThis.hostLog = { hello: null, results: [] };
globalThis.hostPort = null;
globalThis.addEventListener('message', (event) => {
  if (event.source !== frame.contentWindow || event.origin !== toolOrigin) return;
  if (event.data?.type !== 'cheminfo:hello') return;
  globalThis.hostLog.hello = event.data;
  const channel = new MessageChannel();
  globalThis.hostPort = channel.port1;
  channel.port1.onmessage = (answer) => {
    globalThis.hostLog.results.push(answer.data);
  };
  frame.contentWindow.postMessage(
    { type: 'cheminfo:connect', version: 1, host: { name: 'Stand-in host' } },
    toolOrigin,
    [channel.port2],
  );
  for (const request of requests) channel.port1.postMessage(request);
});
frame.src = toolUrl;
</script>
</body>
</html>`;
