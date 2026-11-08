import { parseJsonObject } from './json.ts';
import type { DeployProblem } from './types.ts';

/** A Vite config, whichever build it describes: `vite.overlay.config.ts` too. */
const VITE_CONFIG = /(?:^|\/)vite(?:\.[\w-]+)?\.config\.[cm]?[jt]s$/;

/**
 * A `sourcemap` or a `minify` option, and the value it is set to, up to the
 * comma, the brace or the line that ends it.
 */
const OPTION =
  /(?<![\w$])(?<quote>['"]?)(?<key>sourcemap|minify)\k<quote>\s*:\s*(?<value>[^\s,}][^\n,}]*)/g;

/** The characters a string literal opens with. */
const QUOTES = new Set(["'", '"', '`']);

/**
 * Report a Vite config whose build hands every reader the code the site was
 * built from.
 *
 * A production build is minified and writes no source map unless its config
 * says otherwise, and that is what a site ships: bundles that run, not the
 * files they were made from. A source map gives those files back, verbatim, to
 * anybody who asks for the `.map` beside a bundle — `hidden` only drops the
 * comment pointing at it, and `inline` writes it into the bundle itself — and
 * an unminified bundle keeps every name and comment of the code it came from.
 * So `sourcemap` may only ever be `false`, wherever in the config it is
 * written (`build`, `rollupOptions.output`, `worker`), and `minify` may never
 * be. No page shows either, so it is read off the config, before any build is
 * made.
 * @param byPath - Every file that was read, by repository path; each Vite
 * config among them is checked.
 * @param problems - Where each problem found is appended.
 */
export function readViteBuild(
  byPath: ReadonlyMap<string, string>,
  problems: DeployProblem[],
): void {
  for (const [path, text] of byPath) {
    if (!isViteConfig(path)) continue;
    const code = withoutComments(text);
    for (const match of code.matchAll(OPTION)) {
      const key = match.groups?.key;
      const value = (match.groups?.value ?? '').trim();
      const line = code.slice(0, match.index).split('\n').length;
      if (key === 'sourcemap' && value !== 'false') {
        problems.push({
          file: path,
          line,
          kind: 'shipped-source-map',
          message: `sourcemap is ${value}, so the build writes maps that hand every reader the code the site was built from`,
          hint: 'remove sourcemap, or set it to false: a deployed build carries no map',
        });
      } else if (key === 'minify' && value === 'false') {
        problems.push({
          file: path,
          line,
          kind: 'unminified-bundle',
          message:
            'minify is false, so the bundle ships as written, with every name and comment of the code the site was built from',
          hint: 'remove minify: false — a production build is minified by default',
        });
      }
    }
  }
}

/**
 * Whether a file is a Vite config, whatever build it names.
 * @param path - A path relative to the repository root.
 * @returns True for `vite.config.ts`, `frontend/vite.overlay.config.mjs` and
 * the like; false for `vitest.config.ts`.
 */
export function isViteConfig(path: string): boolean {
  return VITE_CONFIG.test(path);
}

/**
 * Where a repository keeps its Vite configs: at its root, in `frontend`, and
 * in every workspace its `package.json` declares. A `packages/*` entry is
 * returned as written, for the caller to expand against the file system.
 * @param packageJson - The root `package.json`, unparsed, when there is one.
 * @returns The directories, relative to the root, `.` first and each once.
 */
export function viteConfigDirectories(
  packageJson: string | undefined,
): string[] {
  const directories = new Set(['.', 'frontend']);
  for (const entry of declaredWorkspaces(
    parseJsonObject(packageJson)?.workspaces,
  )) {
    if (typeof entry !== 'string') continue;
    const directory = entry.replace(/^\.\//, '').replace(/\/+$/, '');
    if (directory !== '' && directory !== '.') directories.add(directory);
  }
  return [...directories];
}

/**
 * The workspaces of a `package.json`, in either of the forms npm and yarn
 * read: a list, or an object holding the list as `packages`.
 * @param value - The `workspaces` field, as parsed.
 * @returns Its entries, unchecked.
 */
function declaredWorkspaces(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (
    typeof value === 'object' &&
    value !== null &&
    'packages' in value &&
    Array.isArray(value.packages)
  ) {
    return value.packages;
  }
  return [];
}

/**
 * The code of a config with its comments blanked out, so an option written in
 * a comment is not read as set. Every comment character becomes a space and
 * every line break stays, so an offset in the result is the same offset in the
 * file. Strings are kept whole, since a glob holds the very characters that
 * open and close a comment.
 * @param text - The config file.
 * @returns The same text, comments blanked.
 */
function withoutComments(text: string): string {
  let code = '';
  let index = 0;
  while (index < text.length) {
    const char = text.charAt(index);
    const comment = commentEnd(text, index);
    if (comment !== undefined) {
      code += text.slice(index, comment).replaceAll(/[^\n]/g, ' ');
      index = comment;
    } else if (QUOTES.has(char)) {
      const end = endOfString(text, index);
      code += text.slice(index, end);
      index = end;
    } else {
      code += char;
      index++;
    }
  }
  return code;
}

/**
 * Where a comment opening at an offset ends.
 * @param text - The config file.
 * @param start - The offset to look at.
 * @returns The offset just past the comment, its line break kept out, or
 * undefined when no comment opens there.
 */
function commentEnd(text: string, start: number): number | undefined {
  if (text.charAt(start) !== '/') return undefined;
  const next = text.charAt(start + 1);
  if (next === '/') {
    const end = text.indexOf('\n', start);
    return end === -1 ? text.length : end;
  }
  if (next === '*') {
    const end = text.indexOf('*/', start + 2);
    return end === -1 ? text.length : end + 2;
  }
  return undefined;
}

/**
 * Where a string literal ends. A quote that is never closed ends at the line,
 * as it would in a broken file, so one stray quote cannot swallow the rest.
 * @param text - The config file.
 * @param start - The offset of the opening quote.
 * @returns The offset just past the closing quote.
 */
function endOfString(text: string, start: number): number {
  const quote = text.charAt(start);
  for (let index = start + 1; index < text.length; index++) {
    const char = text.charAt(index);
    if (char === '\\') {
      index++;
    } else if (char === quote) {
      return index + 1;
    } else if (char === '\n' && quote !== '`') {
      return index;
    }
  }
  return text.length;
}
