#!/usr/bin/env node
/*
 * Report every page of a build a search engine cannot tell apart from the rest
 * of the site: a missing or repeated title, a description outside the room a
 * result gives it, an absent canonical, card or crawl path, a sitemap naming a
 * page the build never wrote, and a social card pointing at a file that is not
 * there.
 *
 * It reads the build rather than the route table, because the defects that
 * actually cost us ranking were never in the prose — they were a site whose
 * head injector was never wired, which writes one generic page for every
 * address and looks entirely correct in the source. `routeProblems` from
 * `react-cheminfo/core` checks the prose; this checks that it arrived.
 *
 * Wire it as an npm script, after the build:
 *   "check-seo": "node node_modules/react-cheminfo/bin/check-seo.mjs dist"
 *
 * Usage: check-seo.mjs [directory] [--quiet]
 *   directory   the build output, `dist` when none is given
 *   --quiet     say nothing when the build is clean
 *
 * A page carrying `<!--cheminfo:head-->` has its head written per request by a
 * server, so its own tags are that server's business and are reported as
 * deferred rather than missing. Everything the build still owns is checked.
 *
 * Exits 1 when anything is reported, 2 when it was called wrongly, 0 otherwise.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';

import { PAGE_HEAD_MARKER, withheldPhrase } from '../lib/core.js';

import { countOf, usageError } from './cli.mjs';

const TOOL = 'check-seo';
const SKIPPED = new Set(['assets', 'node_modules']);
const DESCRIPTION_MIN = 110;
const DESCRIPTION_MAX = 160;

const roots = [];
let quiet = false;

for (const argument of process.argv.slice(2)) {
  if (argument === '--quiet') {
    quiet = true;
  } else if (argument.startsWith('-')) {
    process.exit(usageError(TOOL, `unknown option: ${argument}`));
  } else {
    roots.push(argument);
  }
}
const root = roots[0] ?? 'dist';
if (roots.length > 1) {
  process.exit(usageError(TOOL, 'one directory at a time'));
}

const stats = statSync(root, { throwIfNoEntry: false });
if (stats === undefined || !stats.isDirectory()) {
  process.exit(usageError(TOOL, `no such build directory: ${root}`));
}

const named = sitemapAddresses();
const pages = [];
collect(root, pages);
if (pages.length === 0) {
  process.exit(usageError(TOOL, `no HTML page under ${root}`));
}

const problems = [];
const deferred = [];
const excluded = [];
const written = new Set(pages.map((page) => page.address));
const titles = new Map();
const descriptions = new Map();

for (const page of pages) {
  const html = readFileSync(page.file, 'utf8');
  const at = page.address;

  // A page that takes itself out of the index has nothing to be indexed under,
  // and an admin site is right to do it. Saying its head is wrong would be
  // reporting a decision as a defect.
  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) {
    excluded.push(at);
    continue;
  }

  if (html.includes(PAGE_HEAD_MARKER)) {
    deferred.push(at);
    continue;
  }
  checkHead(at, html);

  if (!/<html[^>]*\slang="[^"]+"/i.test(html)) {
    problems.push(`${at}: no lang on <html>.`);
  }
  if (!html.includes('application/ld+json')) {
    problems.push(`${at}: no structured-data block.`);
  }
  if (!/<noscript[\s>]/i.test(html)) {
    problems.push(
      `${at}: no <noscript> crawl path — a crawler that does not render sees an empty page.`,
    );
  }
  const keywords = tag(html, /<meta\s+name="keywords"\s+content="([^"]*)"/i);
  if (keywords !== undefined) {
    problems.push(
      `${at}: a keywords meta tag — no search engine has read one since 2009.`,
    );
  }
}

// A build whose every page defers its head is the shell of a site a server
// writes the head of: the sitemap it serves names addresses this build was
// never going to write, and the card, the structured data and the crawl path
// arrive with the page rather than with the file. There is nothing here to
// check, and checking it anyway would report a correct site as broken — that
// server's own route tests are what covers it.
const served = deferred.length + excluded.length === pages.length;
if (!served) checkSiteFiles();

let report = '';
for (const problem of problems) report += `${problem}\n`;

if (problems.length > 0) {
  report += `${countOf(problems.length, 'problem')} in ${countOf(pages.length, 'page')}\n`;
  process.stdout.write(report);
  process.exit(1);
}
if (!quiet) {
  if (served && deferred.length === 0) {
    process.stdout.write(
      `${countOf(pages.length, 'page')} answering noindex: deliberately out of the index\n`,
    );
  } else if (served) {
    process.stdout.write(
      `${countOf(pages.length, 'page')} writing its head per request: covered by the server's own route tests, not here\n`,
    );
  } else {
    const note =
      deferred.length === 0
        ? ''
        : `, ${countOf(deferred.length, 'page')} writing its head per request`;
    process.stdout.write(
      `no indexing problem in ${countOf(pages.length, 'page')}${note}\n`,
    );
  }
}

/**
 * Check the tags a result, a card and a canonical are built from.
 * @param {string} at - The address the page was written at.
 * @param {string} html - The page.
 */
function checkHead(at, html) {
  const title = tag(html, /<title>([\s\S]*?)<\/title>/i);
  if (title === undefined || title.trim() === '') {
    problems.push(`${at}: no title.`);
  } else {
    const first = titles.get(title);
    if (first === undefined) titles.set(title, at);
    else problems.push(`${at}: the title repeats the one at ${first}.`);
  }

  const description = tag(
    html,
    /<meta\s+name="description"\s+content="([^"]*)"/i,
  );
  if (description === undefined || description === '') {
    problems.push(`${at}: no description.`);
  } else {
    if (description.length < DESCRIPTION_MIN) {
      problems.push(
        `${at}: the description is ${description.length} characters — at least ${DESCRIPTION_MIN}.`,
      );
    }
    if (description.length > DESCRIPTION_MAX) {
      problems.push(
        `${at}: the description is ${description.length} characters — at most ${DESCRIPTION_MAX}.`,
      );
    }
    const first = descriptions.get(description);
    if (first === undefined) descriptions.set(description, at);
    else problems.push(`${at}: the description repeats the one at ${first}.`);
  }

  const withheld =
    withheldPhrase(title ?? '') ?? withheldPhrase(description ?? '');
  if (withheld !== undefined) {
    problems.push(
      `${at}: the snippet says "${withheld}" — a site names no repository, tracker or licence of ours.`,
    );
  }

  const canonical = tag(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  if (canonical === undefined) {
    problems.push(`${at}: no canonical address.`);
  } else if (canonical.includes('?')) {
    problems.push(`${at}: the canonical carries a query string.`);
  }

  for (const property of ['og:title', 'og:description', 'og:url']) {
    const pattern = new RegExp(
      String.raw`<meta\s+property="${property}"\s+content="[^"]`,
      'i',
    );
    if (!pattern.test(html)) problems.push(`${at}: no ${property}.`);
  }
  if (!/<meta\s+name="twitter:card"/i.test(html)) {
    problems.push(`${at}: no twitter:card, so a shared link unfurls bare.`);
  }

  // A translated page points at its own language too, so a set that is there
  // at all must name every address the build wrote for this page. One that
  // points at a file nothing wrote is a soft 404 on every language at once,
  // and a set missing its own address is ignored whole.
  const alternates = [
    ...html.matchAll(
      /<link\s+rel="alternate"\s+hreflang="([^"]*)"\s+href="([^"]*)"/gi,
    ),
  ];
  if (alternates.length > 0) {
    let self = false;
    for (const [, hreflang, href] of alternates) {
      const own = ownPath(href ?? '');
      if (own === undefined) continue;
      if (own === at) self = true;
      if (!written.has(own)) {
        problems.push(
          `${at}: hreflang="${hreflang}" points at ${own}, which the build never wrote.`,
        );
      }
    }
    if (!self) {
      problems.push(
        `${at}: the hreflang set does not name this address — a set that leaves out the page it is on is ignored whole.`,
      );
    }
    const prefix = /^\/(?<language>[a-z]{2}(?:-[A-Za-z]{2,8})?)(?:\/|$)/.exec(
      at,
    );
    const named = prefix?.groups?.language;
    const declared = tag(html, /<html[^>]*\slang="([^"]*)"/i);
    if (
      named !== undefined &&
      alternates.some(([, hreflang]) => hreflang === named) &&
      declared !== named
    ) {
      problems.push(
        `${at}: the address says ${named} and <html lang> says ${declared ?? 'nothing'} — a page whose lang lies is offered to the wrong reader.`,
      );
    }
  }

  const image = tag(html, /<meta\s+property="og:image"\s+content="([^"]*)"/i);
  if (image === undefined) {
    problems.push(`${at}: no og:image.`);
  } else {
    const own = ownPath(image);
    if (own !== undefined && !exists(join(root, own))) {
      problems.push(
        `${at}: og:image names ${own}, which the build never wrote.`,
      );
    }
  }
}

/** Check the two files a crawler asks for before it reads any page. */
function checkSiteFiles() {
  const robots = join(root, 'robots.txt');
  const sitemap = join(root, 'sitemap.xml');

  if (!exists(robots)) {
    problems.push('robots.txt: not in the build.');
  } else {
    const named = /^\s*Sitemap:\s*(\S+)\s*$/im.exec(
      readFileSync(robots, 'utf8'),
    );
    if (named !== null && !exists(sitemap)) {
      problems.push(
        `robots.txt names ${named[1]}, which the build never wrote — a sitemap that answers 404 is reported on every fetch.`,
      );
    }
  }

  if (!exists(sitemap)) {
    problems.push('sitemap.xml: not in the build.');
    return;
  }
  const xml = readFileSync(sitemap, 'utf8');
  const claimed = new Set();
  let listed = 0;
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    listed++;
    const own = ownPath(match[1] ?? '');
    if (own !== undefined) claimed.add(own === '' ? '/' : own);
    if (own !== undefined && !written.has(own === '' ? '/' : own)) {
      problems.push(
        `sitemap.xml lists ${match[1]}, which the build never wrote.`,
      );
    }
  }
  if (listed === 0) problems.push('sitemap.xml lists no address.');

  // The other direction, which is the one that quietly costs traffic: a page
  // the build wrote and the sitemap never named is a page nothing links a
  // crawler to but the crawl path, and it is the long tail — an element, a
  // space group, an exercise — that goes missing first.
  for (const page of pages) {
    if (deferred.includes(page.address) || excluded.includes(page.address)) {
      continue;
    }
    if (!claimed.has(page.address)) {
      problems.push(
        `${page.address}: written by the build and named in no sitemap entry.`,
      );
    }
  }
}

/**
 * The part of an address this build is answerable for.
 * @param {string} target - An absolute address, or a path.
 * @returns {string | undefined} Its path, or `undefined` when it is somebody
 * else's host.
 */
function ownPath(target) {
  if (!URL.canParse(target)) {
    return target.startsWith('/') ? trimSlash(target) : undefined;
  }
  return trimSlash(new URL(target).pathname);
}

/**
 * @param {string} path - A path.
 * @returns {string} The same path without its trailing slash, `/` kept.
 */
function trimSlash(path) {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * @param {string} html - The page.
 * @param {RegExp} pattern - A pattern whose first group is the value.
 * @returns {string | undefined} The value, or `undefined` when it is absent.
 */
function tag(html, pattern) {
  return pattern.exec(html)?.[1];
}

/**
 * @param {string} path - A path.
 * @returns {boolean} Whether anything is there.
 */
function exists(path) {
  return statSync(path, { throwIfNoEntry: false }) !== undefined;
}

/**
 * Add every built page under a path to the list, with the address it answers.
 *
 * A folder's `index.html` is always a page. Any other `.html` file is one only
 * when the sitemap names its address, as every prerendered `<route>.html` is:
 * a demo the build emits or a document copied from `public` is not a page of
 * the site, and holding it to a page's head would report a correct build.
 * @param {string} path - A directory of the build.
 * @param {Array<{ file: string, address: string }>} pages - Collected so far.
 */
function collect(path, pages) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIPPED.has(entry.name)) continue;
    const next = join(path, entry.name);
    if (entry.isDirectory()) {
      collect(next, pages);
    } else if (entry.name.endsWith('.html')) {
      const page = relative(root, next).replace(/\.html$/, '');
      const address = trimSlash(`/${page.replace(/(?:^|\/)index$/, '')}`);
      if (entry.name === 'index.html' || named.has(address)) {
        pages.push({ file: next, address });
      }
    }
  }
}

/**
 * Read which addresses of this build the sitemap names.
 * @returns {Set<string>} Every address of this build the sitemap names.
 */
function sitemapAddresses() {
  const sitemap = join(root, 'sitemap.xml');
  const addresses = new Set();
  if (!exists(sitemap)) return addresses;
  for (const match of readFileSync(sitemap, 'utf8').matchAll(
    /<loc>(?<loc>[^<]+)<\/loc>/g,
  )) {
    const own = ownPath(match.groups?.loc ?? '');
    if (own !== undefined) addresses.add(own === '' ? '/' : own);
  }
  return addresses;
}
