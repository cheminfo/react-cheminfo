import { expect, test } from 'vitest';

import type {
  MoleculesTokenCheck,
  MoleculesTokenVerdict,
} from '../moleculesToken.ts';
import { issueTokenCommand, tokensToFix } from '../tokenFix.ts';

function check(variable: string, verdict: MoleculesTokenVerdict) {
  return {
    variable,
    sources: [],
    verdict,
    message: null,
    source: null,
    hint: null,
    email: null,
    issuedAt: null,
    lastUsedAt: null,
    checkedAt: 0,
  } satisfies MoleculesTokenCheck;
}

test('only a token none, refused or another source’s has to be replaced', () => {
  const checks = [
    check('A', 'ok'),
    check('B', 'otherSource'),
    check('C', 'refused'),
    check('D', 'unset'),
    check('E', 'uncheckable'),
    check('F', 'unanswered'),
  ];

  expect(tokensToFix(checks).map(({ variable }) => variable)).toStrictEqual([
    'B',
    'C',
    'D',
  ]);
});

test('the command names the first source, quoted, and leaves the email to write', () => {
  expect(issueTokenCommand({ sources: ['NP Atlas', 'NPAtlas'] })).toBe(
    "npm run tokens -- issue 'NP Atlas' EMAIL",
  );
  expect(issueTokenCommand({ sources: [] })).toBe(
    "npm run tokens -- issue 'SOURCE' EMAIL",
  );
});
