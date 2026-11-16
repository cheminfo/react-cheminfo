/**
 * A stand-in for a site a page frames — in a panel, or over the whole page:
 * a page that says `hello` to the window framing it, records the documents it
 * is handed, and answers a `get` with the values a test gives it. It is served
 * at the deployed site's own address, so the host talks to the origin it
 * talks to in production, and no other site has to run for the tests.
 */

import type { Frame, Page } from '@playwright/test';

/** How long a frame is waited for, in milliseconds. */
const FRAME_DEADLINE = 15_000;

/** One value the stand-in hands back. */
interface StandInValue {
  kind: string;
  value: unknown;
}

/** What the stand-in says of itself, and what it hands back. */
export interface StandInTool {
  name: string;
  outputs: ReadonlyArray<{ key: string; kind: string }>;
  /** What a `get` is answered with, by output key. */
  values?: Readonly<Record<string, StandInValue>>;
  /** Sent unasked once a document accepting them is shown, by output key. */
  pushed?: Readonly<Record<string, StandInValue>>;
  /** The works `hello` asks to be cited for. */
  cite?: readonly unknown[];
  /** The help `hello` carries. */
  help?: { title: string; body: readonly string[]; link?: string };
  /** The settings it says it holds, and takes a host's changes to. */
  settings?: Readonly<Record<string, string>>;
}

/** What the stand-in recorded, read with {@link readToolLog}. */
export interface ToolLog {
  loads: Array<{
    document: string;
    items: Array<{ kind: string; value: { molfile: string } }>;
    accept?: string[];
  }>;
  gets: Array<{ keys: string[] }>;
  settings: Array<Record<string, string>>;
}

/**
 * Serve the stand-in in place of a site, for every page of it.
 * @param page - The page under test.
 * @param host - The site's host, e.g. `3d.cheminfo.org`.
 * @param tool - What the stand-in says and hands back.
 */
export async function standInTool(
  page: Page,
  host: string,
  tool: StandInTool,
): Promise<void> {
  // On the context, so a tab the page opens on the site is served too.
  await page.context().route(`https://${host}/**`, (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: standInPage(tool),
    }),
  );
}

/**
 * The frame the stand-in of a site runs in, once the panel has opened it and
 * the stand-in has started its log.
 * @param page - The page under test.
 * @param host - The site's host.
 * @returns The frame.
 */
export async function toolFrame(page: Page, host: string): Promise<Frame> {
  return toolFrameAt(page, `https://${host}/`);
}

/**
 * The frame of a stand-in opened at an address, when the page frames the same
 * site twice — a panel, and the whole page switched to the site.
 * @param page - The page under test.
 * @param address - The frame's address, or how it starts.
 * @returns The frame.
 */
export async function toolFrameAt(page: Page, address: string): Promise<Frame> {
  const frame = await openedFrame(page, address, Date.now() + FRAME_DEADLINE);
  // The frame has its address before its script has run.
  await frame.waitForFunction(() => 'toolLog' in globalThis);
  return frame;
}

/**
 * The frame of the site the whole page has switched to, once its stand-in
 * runs: a panel framing the same site may be open underneath.
 * @param page - The page under test.
 * @returns The frame.
 */
export async function switchedFrame(page: Page): Promise<Frame> {
  const element = await page.locator('.tool-switch__frame').elementHandle();
  const frame = await element?.contentFrame();
  if (!frame) throw new Error('The page has not switched to a site.');
  await frame.waitForFunction(() => 'toolLog' in globalThis);
  return frame;
}

/**
 * Read what the stand-in recorded. Runs in the frame, as
 * `frame.evaluate(readToolLog)`.
 * @returns The log.
 */
export function readToolLog(): ToolLog {
  return (globalThis as unknown as { toolLog: ToolLog }).toolLog;
}

async function openedFrame(
  page: Page,
  address: string,
  deadline: number,
): Promise<Frame> {
  const frame = page.frames().find((item) => item.url().startsWith(address));
  if (frame !== undefined) return frame;
  if (Date.now() > deadline) throw new Error(`No frame opened at ${address}.`);
  await new Promise((resolve) => {
    setTimeout(resolve, 50);
  });
  return openedFrame(page, address, deadline);
}

function standInPage(tool: StandInTool): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Stand-in for ${tool.name}</title></head>
<body>
<p>Stand-in for ${tool.name}</p>
<script>
const tool = ${JSON.stringify(tool)};
const values = { ...tool.pushed, ...tool.values };
globalThis.toolLog = { loads: [], gets: [], settings: [] };
let settings = tool.settings;
let port = null;
function sayIfConnected() {
  if (settings && port) port.postMessage({ type: 'settings', settings });
}
globalThis.changeSettings = (changed) => {
  settings = { ...settings, ...changed };
  sayIfConnected();
};
// The window framing the page, or the one that opened it in a tab.
const host = globalThis.parent === globalThis ? globalThis.opener : globalThis.parent;
globalThis.addEventListener('message', (event) => {
  if (event.source !== host || event.data?.type !== 'cheminfo:connect') return;
  port = event.ports[0];
  port.onmessage = ({ data }) => {
    if (data.type === 'load') {
      globalThis.toolLog.loads.push(data);
      port.postMessage({ type: 'result', id: data.id, ok: true, used: [{ key: 'structure', kind: data.items[0]?.kind }] });
      const accepted = data.accept ?? [];
      const items = Object.entries(tool.pushed ?? {})
        .filter(([key]) => accepted.includes(key))
        .map(([key, item]) => ({ key, ...item }));
      if (items.length > 0) port.postMessage({ type: 'output', document: data.document, items });
    } else if (data.type === 'get') {
      globalThis.toolLog.gets.push(data);
      const items = data.keys.flatMap((key) => (values[key] ? [{ key, ...values[key] }] : []));
      port.postMessage({ type: 'result', id: data.id, ok: true, items });
    } else if (data.type === 'settings') {
      globalThis.toolLog.settings.push(data.settings);
      port.postMessage({ type: 'result', id: data.id, ok: true, used: [] });
      globalThis.changeSettings(data.settings);
    }
  };
  sayIfConnected();
});
host?.postMessage({
  type: 'cheminfo:hello',
  version: 1,
  tool: { name: tool.name, origin: location.origin, build: null, inputs: [{ key: 'structure', kinds: ['chem.molfile'] }], outputs: tool.outputs, cite: tool.cite, help: tool.help },
}, '*');
</script>
</body>
</html>`;
}
