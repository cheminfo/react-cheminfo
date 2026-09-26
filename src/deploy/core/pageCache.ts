import type { DeployProblem } from './types.ts';

/** The page cache policy of a static-web-server site, at the repository root. */
export const PAGE_CACHE_CONFIG = 'sws.toml';

/** The nginx configuration of a site served by nginx. */
export const NGINX_CONFIG = 'nginx.conf';

const NO_CACHE =
  /cache-control[\s:=]+["']?[^"'\n]*(?:no-cache|no-store|max-age=0)/i;

/**
 * Report a server that lets a browser keep the page itself.
 *
 * A page names the hashed bundles of the build that wrote it, so a browser
 * still holding a copy from an earlier deploy asks the new image for files it
 * does not have; the request falls through to the page, the browser refuses to
 * run HTML as a module, and the site comes up blank until the copy expires.
 * Nothing on the server can see it and no test can either, because a test
 * always loads a page and its bundles from the same build. So it is read off
 * the server's configuration instead: static-web-server hands pages out with
 * `max-age=86400` of its own, and nginx says nothing and lets the browser
 * guess, so both have to be told. The bundles, named by their content, are the
 * one thing worth keeping.
 * @param dockerfile - The Dockerfile, which says what serves the build.
 * @param byPath - Every file that was read, by repository path.
 * @param problems - Where each problem found is appended.
 */
export function readPageCache(
  dockerfile: string,
  byPath: ReadonlyMap<string, string>,
  problems: DeployProblem[],
): void {
  if (dockerfile.includes('static-web-server')) {
    readStaticWebServer(dockerfile, byPath, problems);
  } else if (/^FROM\s+\S*nginx/im.test(dockerfile)) {
    readNginx(byPath, problems);
  }
}

function readStaticWebServer(
  dockerfile: string,
  byPath: ReadonlyMap<string, string>,
  problems: DeployProblem[],
): void {
  const named = /^\s*ENV\s+SERVER_CONFIG_FILE=(?<path>\S+)/m.exec(dockerfile);
  const destination = named?.groups?.path;
  if (destination === undefined) {
    problems.push({
      file: 'Dockerfile',
      line: lineOf(dockerfile, /static-web-server/),
      kind: 'cacheable-page',
      message:
        'static-web-server keeps every page in the browser for a day, so each deploy blanks the site for anyone who came by before it',
      hint: `COPY ${PAGE_CACHE_CONFIG} /etc/sws.toml and set SERVER_CONFIG_FILE to it`,
    });
    return;
  }

  const copied = new RegExp(
    String.raw`^\s*COPY\s+(?:--\S+\s+)*${escapeRegExp(PAGE_CACHE_CONFIG)}\s+${escapeRegExp(destination)}\s*$`,
    'm',
  );
  if (!copied.test(dockerfile)) {
    problems.push({
      file: 'Dockerfile',
      line: lineOf(dockerfile, /^\s*ENV\s+SERVER_CONFIG_FILE=/m),
      kind: 'cacheable-page',
      message: `SERVER_CONFIG_FILE names ${destination}, which nothing puts there`,
      hint: `COPY ${PAGE_CACHE_CONFIG} ${destination}`,
    });
    return;
  }

  readNoCacheRule(PAGE_CACHE_CONFIG, byPath, problems);
}

function readNginx(
  byPath: ReadonlyMap<string, string>,
  problems: DeployProblem[],
): void {
  readNoCacheRule(NGINX_CONFIG, byPath, problems);
}

function readNoCacheRule(
  path: string,
  byPath: ReadonlyMap<string, string>,
  problems: DeployProblem[],
): void {
  const text = byPath.get(path);
  if (text === undefined) {
    problems.push({
      file: path,
      line: 0,
      kind: 'cacheable-page',
      message: 'the server has no page cache policy to read',
      hint: `commit ${path} at the repository root, telling the browser to check the page on every visit`,
    });
    return;
  }
  if (!NO_CACHE.test(text)) {
    problems.push({
      file: path,
      line: 0,
      kind: 'cacheable-page',
      message: 'no rule stops a browser from keeping the page between deploys',
      hint: 'give the page Cache-Control: no-cache, and keep the long life for the hashed bundles alone',
    });
  }
}

function lineOf(text: string, pattern: RegExp): number {
  const match = pattern.exec(text);
  if (match === null) return 0;
  return text.slice(0, match.index).split('\n').length;
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
}
