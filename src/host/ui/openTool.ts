/**
 * Open a framed tool on its own site, in a new tab, carrying what the frame
 * shows: a visitor who wants the whole site keeps the structure they were
 * looking at.
 */

import type { ToolDocument } from '../core/connectTool.ts';
import { REQUEST_TIMEOUT, connectTool } from '../core/connectTool.ts';
import { toolPageUrl } from '../core/toolPage.ts';

import { HELLO_TIMEOUT } from './useFramedTool.ts';

/** What {@link openTool} opens, and what it hands over. */
export interface OpenToolOptions {
  /** The framed address; the tab opens the same page without the framing. */
  url: string;
  /** How the host introduces itself to the tool. */
  host: string;
  /**
   * What the tab is handed once the tool greets it, or `null` to open the
   * page as it is.
   */
  document: ToolDocument | null;
}

/**
 * Open the tool's own page in a new tab and, when there is a document, hand
 * it over through the host protocol: the tool greets the window that opened
 * it as it greets a parent frame. The connection is closed once the tool has
 * answered, or has had its time to.
 *
 * Call it from a click: a browser opens a tab only then.
 * @param options - See {@link OpenToolOptions}.
 * @returns `false` when the browser would not open the tab.
 */
export function openTool(options: OpenToolOptions): boolean {
  const { url, host, document } = options;
  const page = toolPageUrl(url);
  if (document === null) {
    // `noopener` makes `open` return null whether or not the tab opened.
    globalThis.open(page, '_blank', 'noopener');
    return true;
  }
  const opened = globalThis.open(page, '_blank');
  if (opened === null) return false;
  const connection = connectTool({
    frame: () => opened,
    origin: new URL(page).origin,
    host: { name: host },
    listen: (listener) => {
      globalThis.addEventListener('message', listener);
      return () => {
        globalThis.removeEventListener('message', listener);
      };
    },
  });
  const timer = setTimeout(() => {
    connection.close();
  }, HELLO_TIMEOUT + REQUEST_TIMEOUT);
  // Only the structure: nothing the frame takes back is asked of the tab.
  const handed = { document: document.document, items: document.items };
  void connection.load(handed).finally(() => {
    clearTimeout(timer);
    connection.close();
  });
  return true;
}
