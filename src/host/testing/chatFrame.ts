/**
 * A chat around a site's card, for the site's end-to-end tests: the card is
 * framed as a chat draws a tool's answer, and the page holding the frames
 * records what the card tells it and reads what it puts on the clipboard.
 *
 * The frames are the chat's own: the MCP Apps sandbox proxy holds the view, a
 * `srcdoc` frame sandboxed to its scripts, its downloads and the windows it
 * opens, whose own frame loads the card. The card runs in an opaque origin, a
 * window it opens leaves the sandbox, the full screen and the clipboard are
 * delegated to it down the frames, and each frame takes the height the card
 * reports.
 */

import type { FrameLocator, Page } from '@playwright/test';

import { escapeAttribute } from '../../share/core/escape.ts';

/** What the page holding the frames heard from the card. */
export interface ChatFrameLog {
  /** Every height the card reported, in pixels, in order. */
  heights: number[];
  /** How many times the card asked for its full page. */
  expanded: number;
  /** Every message the card posted, in order, whatever its type. */
  messages: unknown[];
}

/** How {@link frameAsChat} frames a card. */
export interface ChatFrameOptions {
  /**
   * The width of the chat's frame, in pixels.
   * @default 958
   */
  width?: number;
}

/**
 * Frame a card as a chat does. The page is first opened on `/health` of the
 * card's origin — of the test's `baseURL` when the address is relative — so
 * it may read what the card puts on the clipboard.
 * @param page - The page holding the frames.
 * @param url - The card's address.
 * @param options - See {@link ChatFrameOptions}.
 * @returns The card's frame.
 */
export async function frameAsChat(
  page: Page,
  url: string,
  options: ChatFrameOptions = {},
): Promise<FrameLocator> {
  const { width = 958 } = options;
  await page.goto(URL.canParse(url) ? new URL('/health', url).href : '/health');
  await page.setContent(chatPage(url, width));
  return page
    .frameLocator('#proxy')
    .frameLocator('#view')
    .frameLocator('#card');
}

/**
 * What the page holding the frames heard so far, `frameAsCard`'s included.
 * @param page - The page.
 * @returns The heights reported, the requests for the full page, and every
 * message.
 */
export function readChatFrameLog(page: Page): Promise<ChatFrameLog> {
  return page.evaluate(
    () =>
      (globalThis as unknown as { chatFrameLog: ChatFrameLog }).chatFrameLog,
  );
}

/**
 * The last height the framed card reported, to poll until it settles.
 * @param page - The page holding the frames.
 * @returns The height in pixels, or undefined before the first report.
 */
export async function readLastHeight(page: Page): Promise<number | undefined> {
  const { heights } = await readChatFrameLog(page);
  return heights.at(-1);
}

/**
 * Put a text of the test's own on the clipboard, so a copy that writes
 * nothing is not mistaken for the one before it.
 * @param page - The page holding the frames.
 */
export async function resetClipboard(page: Page): Promise<void> {
  await page.evaluate(() => navigator.clipboard.writeText('(nothing yet)'));
}

/**
 * The text on the clipboard, as the page reads it.
 * @param page - The page.
 * @returns The text.
 */
export function readClipboardText(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText());
}

/**
 * The types of what is on the clipboard.
 * @param page - The page.
 * @returns The types, e.g. `image/png`.
 */
export function readClipboardTypes(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const types: string[] = [];
    for (const item of await navigator.clipboard.read()) {
      types.push(...item.types);
    }
    return types;
  });
}

/**
 * The script of a page holding a card's frame, as a chat's page records what
 * the card tells it: into the log {@link readChatFrameLog} reads.
 */
export const FRAME_LOG_SCRIPT = `
globalThis.chatFrameLog = { heights: [], expanded: 0, messages: [] };
addEventListener('message', (event) => {
  globalThis.chatFrameLog.messages.push(event.data);
  if (event.data?.type === 'cheminfo:embed-height') globalThis.chatFrameLog.heights.push(event.data.height);
  if (event.data?.type === 'cheminfo:embed-expand') globalThis.chatFrameLog.expanded += 1;
});
`;

/** The sandbox of the chat's frame holding the proxy page. */
const PROXY_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox';

/** The sandbox the proxy page gives the view. */
const VIEW_SANDBOX =
  'allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox';

/**
 * The page holding the frames: the proxy's frame, and the script recording
 * what the card tells it.
 * @param url - The card's address.
 * @param width - The width of the chat's frame, in pixels.
 * @returns The page's HTML.
 */
function chatPage(url: string, width: number): string {
  const view = `<!doctype html><body style="margin:0"><iframe id="card" src="${escapeAttribute(url)}" allow="fullscreen *; clipboard-write *" style="display:block;width:100%;border:0"></iframe>${relay('card')}</body>`;
  const proxy = `<!doctype html><body style="margin:0"><iframe id="view" sandbox="${VIEW_SANDBOX}" allow="fullscreen *; clipboard-write *" srcdoc="${escapeAttribute(view)}" style="display:block;width:100%;border:0"></iframe>${relay('view')}</body>`;
  return `<iframe id="proxy" sandbox="${PROXY_SANDBOX}" allow="fullscreen; clipboard-write" srcdoc="${escapeAttribute(proxy)}" style="width:${width}px;height:900px;border:0"></iframe><script>${FRAME_LOG_SCRIPT}</script>`;
}

/**
 * The script a frame relays the card's messages up with, taking the height
 * the card reports for the frame it holds.
 * @param frame - The id of the frame it holds.
 * @returns The script.
 */
function relay(frame: string): string {
  return `<script>
addEventListener('message', (event) => {
  if (event.data?.type === 'cheminfo:embed-height') {
    document.getElementById('${frame}').style.height = event.data.height + 'px';
  }
  parent.postMessage(event.data, '*');
});
</script>`;
}
