import type { APIRequestContext } from '@playwright/test';
import { expect, test } from 'vitest';

import { CARD_META_KEY, readToolAnswer, readToolCard } from '../toolCard.ts';

/** A titration, as equilibrium's card specs ask for it. */
const NAOH_BY_HCL = { analyte: 'NaOH', titrant: 'HCl' };

const CARD = {
  url: 'http://localhost:10602/titration?embed=1&card=1',
  page: 'http://localhost:10602/titration',
};

/**
 * A server answering each call with the next status of `statuses`, the last
 * one repeating.
 * @param statuses - The statuses, in order.
 * @param answer - What a 200 carries.
 * @returns The client, and the calls it received.
 */
function server(statuses: number[], answer: unknown) {
  const posted: unknown[][] = [];
  const request = {
    post: async (url: string, options: unknown) => {
      posted.push([url, options]);
      const status = statuses.length > 1 ? statuses.shift() : statuses[0];
      return { status: () => status, json: async () => answer };
    },
  } as unknown as APIRequestContext;
  return { request, posted };
}

test('a busy server is asked again until it answers, and the card is read', async () => {
  const answer = { result: { pH: 7 }, _meta: { [CARD_META_KEY]: CARD } };
  const { request, posted } = server([503, 503, 200], answer);

  const card = await readToolCard(
    request,
    'http://localhost:10602',
    'titrationCurve',
    NAOH_BY_HCL,
    { timeout: 20_000 },
  );

  expect(card).toStrictEqual({ ...CARD, answer });
  expect(posted).toStrictEqual([
    ['http://localhost:10602/v1/tools/titrationCurve', { data: NAOH_BY_HCL }],
    ['http://localhost:10602/v1/tools/titrationCurve', { data: NAOH_BY_HCL }],
    ['http://localhost:10602/v1/tools/titrationCurve', { data: NAOH_BY_HCL }],
  ]);
});

test("an answer with no card says which tool's it was", async () => {
  const { request } = server([200], { result: {}, _meta: {} });

  await expect(
    readToolCard(request, '', 'enumerateLibrary', {}),
  ).rejects.toThrow('enumerateLibrary answered with no card');
});

test('the answer itself is read whether it carries a card or not', async () => {
  const answer = { result: { smiles: 'CCO' }, _meta: {} };
  const { request, posted } = server([200], answer);

  await expect(
    readToolAnswer(request, '', 'smilesToMolecule', { smiles: 'CCO' }),
  ).resolves.toStrictEqual(answer);
  // An empty server is the suite's own baseURL.
  expect(posted[0]?.[0]).toBe('/v1/tools/smilesToMolecule');
});

test('a timeout of zero asks once, and a refusal fails with its status', async () => {
  const { request, posted } = server([400], {});

  await expect(
    readToolCard(request, '', 'compound', { cid: 5 }, { timeout: 0 }),
  ).rejects.toThrow('compound did not answer: answered 400');
  expect(posted).toHaveLength(1);
});
