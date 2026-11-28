/**
 * Asking a tool server a question on its JSON route, and reading the card its
 * answer carries, for a site's browser suite. A server answers a few calls at
 * a time and tells the next one to come back in a moment, so a call is asked
 * again until it is answered.
 */

import type { APIRequestContext } from '@playwright/test';

import { pollUntil } from '../../playwright/poll.ts';

/**
 * The key of what an answer carries for the view to frame, as
 * cheminfo-mcp-server writes it.
 */
export const CARD_META_KEY = 'org.cheminfo/embed';

/** What a call of a tool answers, as far as a spec reads it. */
export interface ToolAnswer {
  result: Record<string, unknown>;
  _meta: Record<string, unknown>;
}

/** The card an answer carries, and the answer itself. */
export interface ToolCard {
  /** The card's address. */
  url: string;
  /** The address of the page the card opens in full. */
  page: string;
  /** The whole answer, for whatever else a spec reads in it. */
  answer: ToolAnswer;
}

/** How long a tool is asked. */
export interface ToolCallOptions {
  /**
   * How long a busy server is asked again, in milliseconds; `0` asks once.
   * @default 30000
   */
  timeout?: number;
}

/**
 * Call a tool on its JSON route, `POST <server>/v1/tools/<tool>`, until it
 * answers 200.
 * @param request - Playwright's API client.
 * @param server - The server's origin, or `''` for the suite's `baseURL`.
 * @param tool - The tool's name.
 * @param data - Its arguments.
 * @param options - See {@link ToolCallOptions}.
 * @returns The answer.
 */
export async function readToolAnswer(
  request: APIRequestContext,
  server: string,
  tool: string,
  data: Record<string, unknown>,
  options: ToolCallOptions = {},
): Promise<ToolAnswer> {
  const { timeout = 30_000 } = options;
  return pollUntil(
    async () => {
      const response = await request.post(`${server}/v1/tools/${tool}`, {
        data,
      });
      if (response.status() !== 200) {
        throw new Error(`answered ${response.status()}`);
      }
      return (await response.json()) as ToolAnswer;
    },
    timeout,
    `${tool} did not answer`,
  );
}

/**
 * Call a tool until it answers, and read the card its answer carries.
 * @param request - Playwright's API client.
 * @param server - The server's origin, or `''` for the suite's `baseURL`.
 * @param tool - The tool's name.
 * @param data - Its arguments.
 * @param options - See {@link ToolCallOptions}.
 * @returns The card's two addresses, and the answer.
 * @throws {Error} `<tool> answered with no card`.
 */
export async function readToolCard(
  request: APIRequestContext,
  server: string,
  tool: string,
  data: Record<string, unknown>,
  options: ToolCallOptions = {},
): Promise<ToolCard> {
  const answer = await readToolAnswer(request, server, tool, data, options);
  // An answer that failed carries no `_meta` at all.
  const meta = answer._meta as Record<string, unknown> | undefined;
  const embed = meta?.[CARD_META_KEY] as
    { url: string; page: string } | undefined;
  if (!embed) throw new Error(`${tool} answered with no card`);
  return { url: embed.url, page: embed.page, answer };
}
