#!/usr/bin/env node
/*
 * Check a catalog directory: `en.json` is the source of truth, and every other
 * locale beside it must answer to the same keys with the same placeholders.
 *
 * Wire it as an npm script:
 *   "check-messages": "cheminfo-check-messages src/locales"
 *
 * Usage: check-messages.mjs [directory...] [--quiet]
 *   directory   the catalog directories to check, `src/locales` when none is
 *               given
 *   --quiet     say nothing when every catalog is clean
 *
 * It reports, per locale: a key English does not declare, a placeholder the
 * translation adds or drops, a message left empty, and — as a count rather
 * than a fault — the keys still missing. It also refuses an ICU plural or
 * select, which the page's formatter does not load: a message with branches is
 * written as one key per branch instead.
 *
 * Exits 1 when anything is reported, 2 when it was called wrongly, 0 otherwise.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import process from 'node:process';

import { countOf, usageError } from './cli.mjs';

const TOOL = 'check-messages';
const SOURCE_LOCALE = 'en';
const DEFAULT_DIRECTORY = 'src/locales';
const PLACEHOLDER = /\{(?<name>[^{}]*)\}/g;

process.exit(main(process.argv.slice(2)));

/**
 * Run the check.
 * @param {string[]} argv - The arguments, without the node and script paths.
 * @returns {number} The status to exit with.
 */
function main(argv) {
  const directories = [];
  let quiet = false;
  for (const argument of argv) {
    if (argument === '--quiet') {
      quiet = true;
    } else if (argument.startsWith('--')) {
      return usageError(TOOL, `unknown option ${argument}`);
    } else {
      directories.push(argument);
    }
  }
  if (directories.length === 0) directories.push(DEFAULT_DIRECTORY);

  const problems = [];
  const lines = [];
  for (const directory of directories) {
    const report = checkDirectory(directory);
    if (typeof report === 'string') return usageError(TOOL, report);
    problems.push(...report.problems);
    lines.push(...report.lines);
  }

  for (const problem of problems) process.stdout.write(`${problem}\n`);
  if (problems.length > 0) {
    process.stdout.write(`\n${TOOL}: ${countOf(problems.length, 'problem')}\n`);
    return 1;
  }
  if (!quiet) {
    for (const line of lines) process.stdout.write(`${line}\n`);
  }
  return 0;
}

/**
 * Check one catalog directory.
 * @param {string} directory - Where `en.json` and its locales live.
 * @returns {{problems: string[], lines: string[]} | string} What was found, or
 * the reason the directory could not be read.
 */
function checkDirectory(directory) {
  let entries;
  try {
    entries = readdirSync(directory);
  } catch {
    return `cannot read ${directory}`;
  }
  const source = readCatalog(join(directory, `${SOURCE_LOCALE}.json`));
  if (typeof source === 'string') return source;

  const problems = [];
  const lines = [];
  for (const problem of catalogProblems(source, directory, SOURCE_LOCALE)) {
    problems.push(problem);
  }
  const keys = Object.keys(source);
  lines.push(`${directory}: ${countOf(keys.length, 'message')} in English`);

  for (const entry of entries.toSorted()) {
    if (!entry.endsWith('.json')) continue;
    const locale = basename(entry, '.json');
    if (locale === SOURCE_LOCALE) continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) continue;
    const catalog = readCatalog(path);
    if (typeof catalog === 'string') {
      problems.push(catalog);
      continue;
    }
    problems.push(
      ...catalogProblems(catalog, directory, locale),
      ...localeProblems(source, catalog, path),
    );
    const translated = keys.filter((key) => hasOwn(catalog, key)).length;
    lines.push(
      `  ${locale}: ${translated}/${keys.length} translated${
        translated === keys.length
          ? ''
          : `, ${countOf(keys.length - translated, 'message')} still in English`
      }`,
    );
  }
  return { problems, lines };
}

/**
 * What is wrong with a catalog read on its own.
 * @param {Record<string, unknown>} catalog - The messages.
 * @param {string} directory - Where it lives, for the report.
 * @param {string} locale - Which locale it is.
 * @returns {string[]} One line per problem.
 */
function catalogProblems(catalog, directory, locale) {
  const problems = [];
  const where = join(directory, `${locale}.json`);
  for (const [key, message] of Object.entries(catalog)) {
    if (typeof message !== 'string') {
      problems.push(`${where}: ${key} is not a string`);
      continue;
    }
    if (message.trim() === '') {
      problems.push(`${where}: ${key} is empty`);
    }
    for (const name of placeholders(message)) {
      if (name.includes(',')) {
        problems.push(
          `${where}: ${key} uses an ICU plural or select, which the page does not load a formatter for — write one key per branch`,
        );
        break;
      }
      if (!/^\w+$/.test(name)) {
        problems.push(`${where}: ${key} has a malformed placeholder {${name}}`);
      }
    }
  }
  return problems;
}

/**
 * What is wrong with a translation against the English it translates.
 * @param {Record<string, string>} source - The English messages.
 * @param {Record<string, unknown>} catalog - The translation.
 * @param {string} where - Its path, for the report.
 * @returns {string[]} One line per problem.
 */
function localeProblems(source, catalog, where) {
  const problems = [];
  for (const [key, message] of Object.entries(catalog)) {
    if (!hasOwn(source, key)) {
      problems.push(`${where}: ${key} is not a key of English`);
      continue;
    }
    if (typeof message !== 'string') continue;
    const wanted = placeholders(source[key]);
    const written = placeholders(message);
    for (const name of wanted) {
      if (!written.has(name)) {
        problems.push(`${where}: ${key} drops the placeholder {${name}}`);
      }
    }
    for (const name of written) {
      if (!wanted.has(name)) {
        problems.push(`${where}: ${key} adds the placeholder {${name}}`);
      }
    }
  }
  return problems;
}

/**
 * The names a message fills in.
 * @param {string} message - The message.
 * @returns {Set<string>} Every `{name}` it writes.
 */
function placeholders(message) {
  const names = new Set();
  for (const match of message.matchAll(PLACEHOLDER)) {
    names.add(match.groups.name);
  }
  return names;
}

/**
 * Read one catalog file.
 * @param {string} path - Where it is.
 * @returns {Record<string, unknown> | string} The messages, or why they could
 * not be read.
 */
function readCatalog(path) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return `cannot read ${path}`;
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return `${path}: ${error instanceof Error ? error.message : 'is not JSON'}`;
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return `${path}: is not an object of messages`;
  }
  return parsed;
}

function hasOwn(catalog, key) {
  return Object.hasOwn(catalog, key);
}
