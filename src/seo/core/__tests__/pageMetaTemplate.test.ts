import { expect, test } from 'vitest';

import { injectPageMeta } from '../pageMeta.ts';
import type { RouteMeta } from '../routes.ts';
import { PAGE_BODY_MARKER, PAGE_HEAD_MARKER, fill } from '../template.ts';

const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: '2D to 3D — conformers from a drawn structure',
    description: 'Draw a structure and turn it into 3D conformers.',
  },
  {
    path: '/about',
    title: 'About the browser conformer generator',
    description: 'What this tool computes, and how to cite it.',
  },
];

const OPTIONS = { site: '3d', routes: ROUTES, url: '/about' } as const;

const TITLE =
  '<title>About the browser conformer generator — 3d.cheminfo.org</title>';

/**
 * The head the marker is replaced by, whatever the page around it holds.
 * @param page - The template.
 * @returns What was written where the marker was.
 */
function headOf(page: string): string {
  const [before, after] = page.split(PAGE_HEAD_MARKER) as [string, string];
  const written = injectPageMeta(page, OPTIONS);
  return written.slice(before.length, written.length - after.length);
}

test('nothing the page holds around the marker reaches the head it is given', () => {
  const pages: Array<[string, string]> = [
    [
      'a byte order mark',
      `\uFEFF<head>${PAGE_HEAD_MARKER}</head><body></body>`,
    ],
    ['no head end', `<html><head>${PAGE_HEAD_MARKER}<body>hi`],
    ['an implicit head', `<html>${PAGE_HEAD_MARKER}<p>hi</p></html>`],
    [
      'two heads',
      `<head>${PAGE_HEAD_MARKER}</head><head><title>b</title></head><body>x</body>`,
    ],
    ['a fragment', PAGE_HEAD_MARKER],
    ['an unterminated comment', `<head><!-- draft\n${PAGE_HEAD_MARKER}</head>`],
    [
      'a head end a script quotes',
      `<head><script>const end = "</head>";</script>${PAGE_HEAD_MARKER}</head>`,
    ],
    [
      'a head end an attribute value carries',
      `<head><meta name="keywords" content="writing </head>" />${PAGE_HEAD_MARKER}</head>`,
    ],
  ];

  const expected = headOf(PAGE_HEAD_MARKER);

  expect(expected).toContain(TITLE);
  expect(
    pages.map(([shape, page]) => `${shape}: ${headOf(page)}`),
  ).toStrictEqual(pages.map(([shape]) => `${shape}: ${expected}`));
});

test('a title the body draws is left where it is', () => {
  const page = injectPageMeta(
    `<head>${PAGE_HEAD_MARKER}</head><body><svg><title>a benzene ring</title></svg></body>`,
    OPTIONS,
  );

  expect(page).toContain('<svg><title>a benzene ring</title></svg>');
  expect(page.match(/<title>/g)).toHaveLength(2);
});

test('the head is written once: the template carries no title and no description', () => {
  const page = injectPageMeta(
    `<!doctype html><html lang="en"><head><meta charset="utf-8" />${PAGE_HEAD_MARKER}</head><body><div id="root"></div></body></html>`,
    OPTIONS,
  );

  expect(page.match(/<title>/g)).toHaveLength(1);
  expect(page.match(/name="description"/g)).toHaveLength(1);
  expect(page.match(/rel="canonical"/g)).toHaveLength(1);
  expect(page.match(/og:title/g)).toHaveLength(1);
});

test('a dollar sequence in the route is written out, not expanded', () => {
  const page = injectPageMeta(`<head>${PAGE_HEAD_MARKER}</head>`, {
    site: 'regexp',
    routes: [
      {
        path: '/',
        title: 'Write $& and $<name>',
        description: 'Use $& for the whole match and $1 for a group.',
      },
    ],
    url: '/',
  });

  expect(page).toContain('<title>Write $&amp; and $&lt;name&gt; —');
  expect(page).toContain(
    'content="Use $&amp; for the whole match and $1 for a group."',
  );
});

test('a page carrying no marker is refused, never shipped headless', () => {
  expect(() =>
    injectPageMeta('<head><title>x</title></head><body></body>', OPTIONS),
  ).toThrow('the page carries no <!--cheminfo:head-->');
  expect(() => fill('<body></body>', PAGE_BODY_MARKER, '<noscript />')).toThrow(
    'the page carries no <!--cheminfo:body-->',
  );
});

test('a filled page cannot be filled a second time', () => {
  const once = injectPageMeta(`<head>${PAGE_HEAD_MARKER}</head>`, OPTIONS);

  expect(once).toContain(TITLE);
  expect(() => injectPageMeta(once, OPTIONS)).toThrow(
    'the page carries no <!--cheminfo:head-->',
  );
});
