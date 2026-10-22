import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { MoleculesTokenCheck } from '../../core/moleculesToken.ts';
import { publicTokenCheck } from '../../core/moleculesToken.ts';
import { MoleculesTokenTable } from '../MoleculesTokenTable.tsx';

const CHECKED_AT = Date.UTC(2026, 9, 20, 20, 5);
const ISSUED_AT = Date.UTC(2026, 8, 1, 9, 30);
const USED_AT = Date.UTC(2026, 9, 20, 19, 59);

/** How the table writes an instant: in the reader's own time zone. */
const INSTANT = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const unchecked = {
  message: null,
  source: null,
  hint: null,
  email: null,
  issuedAt: null,
  lastUsedAt: null,
  checkedAt: CHECKED_AT,
};

const VALID: MoleculesTokenCheck = {
  ...unchecked,
  variable: 'MOLECULES_TOKEN_NPATLAS',
  sources: ['NP Atlas'],
  verdict: 'ok',
  source: 'NP Atlas',
  hint: 'mct_1a2b3c4d',
  email: 'chembio@cheminfo.org',
  issuedAt: ISSUED_AT,
  lastUsedAt: USED_AT,
};

const CHECKS: MoleculesTokenCheck[] = [
  VALID,
  {
    ...unchecked,
    variable: 'MOLECULES_TOKEN_LOTUS',
    sources: ['LOTUS'],
    verdict: 'otherSource',
    source: 'COCONUT',
    hint: 'mct_9f8e7d6c',
  },
  {
    ...unchecked,
    variable: 'MOLECULES_TOKEN_NPASS',
    sources: ['NPASS'],
    verdict: 'refused',
    message: 'this token was revoked',
  },
  {
    ...unchecked,
    variable: 'MOLECULES_TOKEN_CMAUP',
    sources: ['CMAUP'],
    verdict: 'unset',
  },
  {
    ...unchecked,
    variable: 'MOLECULES_TOKEN_MIBIG',
    sources: ['MIBiG'],
    verdict: 'unanswered',
    message: 'no answer within 5000 ms',
  },
];

/**
 * The text of each row's cells, tags dropped.
 * @param html - The rendered table.
 * @returns One array of cell texts per row of the body.
 */
function rows(html: string): string[][] {
  const body = /<tbody>(?<rows>.*)<\/tbody>/.exec(html)?.groups?.rows ?? '';
  return [...body.matchAll(/<tr[^>]*>(?<cells>.*?)<\/tr>/g)].map((row) =>
    [...(row.groups?.cells ?? '').matchAll(/<td>(?<cell>.*?)<\/td>/g)].map(
      (cell) => (cell.groups?.cell ?? '').replaceAll(/<[^>]+>/g, ''),
    ),
  );
}

test('each token reads as its variable, its source, its verdict and what molecules said', () => {
  const html = renderToStaticMarkup(
    <MoleculesTokenTable checks={CHECKS} onCheckAgain={() => undefined} />,
  );

  expect(rows(html)).toStrictEqual([
    [
      'MOLECULES_TOKEN_NPATLAS',
      'NP Atlas',
      'valid',
      `issued to chembio@cheminfo.org on ${INSTANT.format(ISSUED_AT)} · last used on ${INSTANT.format(USED_AT)} · mct_1a2b3c4d…`,
    ],
    [
      'MOLECULES_TOKEN_LOTUS',
      'LOTUS',
      'another source&#x27;s',
      'issued for COCONUT: what it sends is credited to that source · mct_9f8e7d6c…',
    ],
    ['MOLECULES_TOKEN_NPASS', 'NPASS', 'refused', 'this token was revoked'],
    [
      'MOLECULES_TOKEN_CMAUP',
      'CMAUP',
      'not set',
      'Set MOLECULES_TOKEN_CMAUP in the server&#x27;s .env.',
    ],
    ['MOLECULES_TOKEN_MIBIG', 'MIBiG', 'no answer', 'no answer within 5000 ms'],
  ]);
  expect(html).toContain(`Checked ${INSTANT.format(CHECKED_AT)}`);
  expect(html).toContain('data-testid="molecules-tokens-check"');
});

test('a public page shows no holder, no first characters and no button', () => {
  const html = renderToStaticMarkup(
    <MoleculesTokenTable
      checks={[{ ...publicTokenCheck(VALID), sources: [] }]}
    />,
  );

  expect(rows(html)).toStrictEqual([
    [
      'MOLECULES_TOKEN_NPATLAS',
      'any source',
      'valid',
      `for NP Atlas · issued on ${INSTANT.format(ISSUED_AT)} · last used on ${INSTANT.format(USED_AT)}`,
    ],
  ]);
  expect(html).not.toContain('molecules-tokens-check');
});

test('before the first check, the table says when it is made', () => {
  const html = renderToStaticMarkup(<MoleculesTokenTable checks={null} />);

  expect(html).toContain(
    'Not checked yet: the service that writes to molecules.cheminfo.org checks its tokens when it starts.',
  );
  expect(html).not.toContain('<table');
});

/**
 * The text of each code block, as it is copied.
 * @param html - The rendered table.
 * @returns One string per block.
 */
function blocks(html: string): string[] {
  return [...html.matchAll(/<pre[^>]*>(?<code>.*?)<\/pre>/gs)].map((block) =>
    (block.groups?.code ?? '').replaceAll('&#x27;', "'"),
  );
}

test('a token to replace comes with the three steps that replace it', () => {
  const html = renderToStaticMarkup(<MoleculesTokenTable checks={CHECKS} />);

  expect(html).toContain(
    'Set a valid token in MOLECULES_TOKEN_LOTUS, MOLECULES_TOKEN_NPASS, and MOLECULES_TOKEN_CMAUP',
  );
  expect(html).toContain(
    'Issue one token per source on the Admin page of molecules.cheminfo.org:',
  );
  expect(html).toContain('href="https://molecules.cheminfo.org/admin"');
  expect(blocks(html)).toStrictEqual([
    "npm run tokens -- issue 'LOTUS' EMAIL\nnpm run tokens -- issue 'NPASS' EMAIL\nnpm run tokens -- issue 'CMAUP' EMAIL",
    'MOLECULES_TOKEN_LOTUS=mct_…\nMOLECULES_TOKEN_NPASS=mct_…\nMOLECULES_TOKEN_CMAUP=mct_…',
    'docker compose up -d',
  ]);
  expect(html).not.toContain('A token is changed in the server');
});

test('a token not set reads in the singular, as a warning, at the address the site names', () => {
  const html = renderToStaticMarkup(
    <MoleculesTokenTable
      checks={[
        {
          ...unchecked,
          variable: 'MOLECULES_TOKEN',
          sources: ['Wikidata'],
          verdict: 'unset',
        },
      ]}
      moleculesUrl="https://molecules.fat.bb8.dev/"
    />,
  );

  expect(html).toContain('Set a valid token in MOLECULES_TOKEN');
  expect(html).toContain(
    'Issue a token on the Admin page of molecules.cheminfo.org:',
  );
  expect(html).toContain('Write it in the .env of this site&#x27;s server:');
  expect(html).toContain('href="https://molecules.fat.bb8.dev/admin"');
  expect(html).toMatch(/class="[^"]*-callout [^"]*-intent-warning/);
  expect(blocks(html).slice(0, 2)).toStrictEqual([
    "npm run tokens -- issue 'Wikidata' EMAIL",
    'MOLECULES_TOKEN=mct_…',
  ]);
});

test('with every token valid, no step is shown and the table says how a token is changed', () => {
  const html = renderToStaticMarkup(<MoleculesTokenTable checks={[VALID]} />);

  expect(html).not.toContain('molecules-tokens-fix');
  expect(html).toContain(
    'A token is changed in the server&#x27;s .env and read again when the service restarts.',
  );
});
