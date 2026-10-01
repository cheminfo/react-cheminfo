import { expect, test } from 'vitest';

import { routeProblems } from '../routeProblems.ts';
import type { RouteMeta } from '../routes.ts';

const DESCRIPTION =
  'Draw a structure and read its degree of unsaturation, with the contribution of every element of the formula shown beside it.';
const OTHER =
  'Count the rings and the pi bonds of a structure you draw, and watch the two numbers part company when sulfur is drawn beyond its valence.';

function route(overrides: Partial<RouteMeta> = {}): RouteMeta {
  return {
    path: '/',
    title: 'Degree of unsaturation, from a formula',
    description: DESCRIPTION,
    ...overrides,
  };
}

test('a table written to the limits reports nothing', () => {
  expect(
    routeProblems([
      route(),
      route({
        path: '/learn',
        title: 'The formula alone gives it',
        description: OTHER,
      }),
    ]),
  ).toStrictEqual([]);
});

test('an empty table is reported once', () => {
  expect(routeProblems([])).toStrictEqual([
    'the table is empty: a site answers at least one route.',
  ]);
});

test('a title longer than sixty characters is reported with its length', () => {
  const title =
    'Degree of unsaturation, read off a molecular formula or a drawn structure';

  expect(routeProblems([route({ title })])).toStrictEqual([
    '/: the title is 73 characters, and the site name is appended to it — at most 60 survives a result whole.',
  ]);
});

test('an empty title is reported instead of its length', () => {
  expect(routeProblems([route({ title: '  ' })])).toStrictEqual([
    '/: the title is empty.',
  ]);
});

test('a description under a hundred and ten characters is reported', () => {
  expect(
    routeProblems([route({ description: 'Read the degree of unsaturation.' })]),
  ).toStrictEqual([
    '/: the description is 32 characters — at least 110, or the result says half of what the page is.',
  ]);
});

test('a description over a hundred and sixty characters is reported', () => {
  const description = `${DESCRIPTION} ${OTHER}`;

  expect(routeProblems([route({ description })])).toStrictEqual([
    `/: the description is ${description.length} characters — at most 160, or the sentence is cut off in the result itself.`,
  ]);
});

test('two pages sharing a title name the page that claimed it first', () => {
  expect(
    routeProblems([route(), route({ path: '/learn', description: OTHER })]),
  ).toStrictEqual(['/learn: the title repeats the one at /.']);
});

test('two pages sharing a description name the page that claimed it first', () => {
  expect(
    routeProblems([
      route(),
      route({ path: '/learn', title: 'Walk through it' }),
    ]),
  ).toStrictEqual(['/learn: the description repeats the one at /.']);
});

test('a snippet promising a licence is reported', () => {
  const description =
    'What this tool counts from a formula, the libraries it borrows, how to cite it, and the licence the code is published under.';

  expect(routeProblems([route({ description })])).toStrictEqual([
    '/: the snippet says "licence" — a site names no repository, tracker or licence of ours.',
  ]);
});

test('a snippet sending the reader to an issue tracker is reported', () => {
  const description =
    'What this tool counts from a formula and from a structure, the libraries it borrows, how to cite it and where to report a problem.';

  expect(routeProblems([route({ description })])).toStrictEqual([
    '/: the snippet says "report a problem" — a site names no repository, tracker or licence of ours.',
  ]);
});

test('a title calling the site open source is reported', () => {
  expect(
    routeProblems([route({ title: 'An open-source unsaturation counter' })]),
  ).toStrictEqual([
    '/: the snippet says "open-source" — a site names no repository, tracker or licence of ours.',
  ]);
});

test('every problem of one route is reported, not only the first', () => {
  expect(
    routeProblems([
      route({ title: 'About — credits and licence', description: 'Short.' }),
    ]),
  ).toStrictEqual([
    '/: the description is 6 characters — at least 110, or the result says half of what the page is.',
    '/: the snippet says "licence" — a site names no repository, tracker or licence of ours.',
  ]);
});
