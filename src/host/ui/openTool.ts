/**
 * Open a tool on its own site, in a new tab, carrying data: a framed tool's
 * structure for a visitor who wants the whole site, or what a Send menu sends
 * another site of the family.
 */

import { errorMessage } from '../../error/core/toError.ts';
import type {
  LoadOutcome,
  ToolConnection,
  ToolDocument,
} from '../core/connectTool.ts';
import { REQUEST_TIMEOUT, connectTool } from '../core/connectTool.ts';
import { toolPageUrl } from '../core/toolPage.ts';

import { HELLO_TIMEOUT } from './useFramedTool.ts';

/** What {@link openTool} opens, and what it hands over. */
export interface OpenToolOptions {
  /** The address; the tab opens the same page without the framing. */
  url: string;
  /** How the host introduces itself to the tool. */
  host: string;
  /**
   * What the tab is handed once the tool greets it: the document, a function
   * building it once the tab is open — a large one takes the time the tool
   * takes to load — or `null` to open the page as it is.
   */
  document: ToolDocument | (() => Promise<ToolDocument>) | null;
  /**
   * Told, in one sentence, when the document could not be built, or the tool
   * refused it or never answered.
   * @default undefined — nobody is told
   */
  onError?: (message: string) => void;
}

/** What a tool that greeted nobody, or never answered, is reported as. */
const NOT_ANSWERED = 'The tool did not answer in time.';

/**
 * Open the tool's own page in a new tab and, when there is a document, hand
 * it over through the host protocol: the tool greets the window that opened
 * it as it greets a parent frame. The connection is closed once the tool has
 * answered, or has had its time to.
 *
 * Call it from a click: a browser opens a tab only then, which is why a
 * document that takes time to build is passed as a function.
 * @param options - See {@link OpenToolOptions}.
 * @returns `false` when the browser would not open the tab.
 */
export function openTool(options: OpenToolOptions): boolean {
  const { url, host, document, onError } = options;
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
  void handOver(connection, document)
    .then(
      (outcome) => {
        if (outcome.status === 'refused') onError?.(outcome.error.message);
        if (outcome.status === 'dropped') onError?.(NOT_ANSWERED);
      },
      (error: unknown) => {
        onError?.(errorMessage(error));
      },
    )
    .finally(() => {
      connection.close();
    });
  return true;
}

async function handOver(
  connection: ToolConnection,
  document: ToolDocument | (() => Promise<ToolDocument>),
): Promise<LoadOutcome> {
  const ready = typeof document === 'function' ? await document() : document;
  // The tool's time to greet and to answer runs from when there is something
  // to hand it.
  const timer = setTimeout(() => {
    connection.close();
  }, HELLO_TIMEOUT + REQUEST_TIMEOUT);
  try {
    // Only the data: nothing the opener takes back is asked of the tab.
    return await connection.load({
      document: ready.document,
      items: ready.items,
    });
  } finally {
    clearTimeout(timer);
  }
}
