import semver from 'semver';

import { lineOf, parseJsonObject, stringEntries } from './json.ts';
import type { DeployProblem } from './types.ts';

/**
 * The React major the whole family runs. One number, in one place: a site that
 * resolves anything else is reporting a resolution nobody asked for.
 */
export const REACT_MAJOR = 19;

/**
 * The packages that must resolve to exactly one copy. The two runtime ones
 * because two copies are a blank page; the two type packages because two copies
 * are a type error in a file nobody edited.
 */
const SINGLE_COPY = [
  'react',
  'react-dom',
  '@types/react',
  '@types/react-dom',
] as const;

/** One package as the lock file resolved it. */
interface Resolved {
  /** Where npm put it, as the lock keys it. */
  path: string;
  /** The exact version it resolved to. */
  version: string;
}

/** What the root `package.json` says about a package. */
interface Declared {
  /** The range a direct dependency asks for, if it is one. */
  dependency?: string;
  /** The range the `overrides` block pins, if it pins one. */
  override?: string;
}

/**
 * Report every way a repository would resolve React twice, or resolve a React
 * that is not the family's.
 *
 * Two physical copies of `react` make every component from the offending
 * subtree call hooks against a dispatcher the active renderer never populated,
 * and the app dies at first render on `Cannot read properties of null (reading
 * 'useEffect')` — a blank page with the correct title and the correct CSS,
 * which reads like a routing or a build bug and is neither. Two copies of
 * `@types/react` are the same mistake one layer up: `tsc` rejects a component
 * crossing between them, in a file nobody touched.
 *
 * The cause is almost never a direct dependency. It is a *transitive* peer
 * range that stopped before the current major — `@blueprintjs/core` depends on
 * `react-popper@2`, whose peers stop at `^18` — so npm honours the stale range,
 * installs an older React for that subtree and hoists it. Nothing fails at
 * install, nothing fails at build, and the bundle silently grows by a second
 * copy of React. The fix is a pin in the root `overrides`, which is why a lock
 * holding such a peer without one is reported even while the tree happens to be
 * clean today: it is one fresh resolve away from not being.
 * @param packageJson - The repository's root `package.json`, unparsed.
 * @param packageLock - Its `package-lock.json`, unparsed.
 * @param problems - Where each problem found is appended.
 */
export function readReactCopies(
  packageJson: string | undefined,
  packageLock: string | undefined,
  problems: DeployProblem[],
): void {
  const lock = parseJsonObject(packageLock);
  if (lock === undefined) return;
  const packages = lock.packages;
  if (typeof packages !== 'object' || packages === null) return;
  const entries = Object.entries(packages as Record<string, unknown>);

  const resolved = resolvedCopies(entries);
  // A repository with no React at all is not a React repository.
  if (resolved.get('react')?.length === undefined) return;

  const declared = declarations(packageJson);

  for (const name of SINGLE_COPY) {
    const copies = resolved.get(name);
    if (copies === undefined || copies.length === 0) continue;
    if (copies.length > 1) {
      problems.push({
        file: 'package-lock.json',
        line: lineOf(packageLock, `"${copies[1]?.path ?? name}"`),
        kind: 'duplicate-react',
        message: `${name} resolves to ${copies.length} copies: ${copies
          .map((copy) => `${copy.version} at ${copy.path}`)
          .join(', ')}`,
        hint: `pin ${name} in the root overrides, then reinstall from scratch — npm install alone keeps the stale tree on disk`,
      });
    }
    for (const copy of copies) {
      const major = semver.major(semver.coerce(copy.version) ?? '0.0.0');
      if (major !== REACT_MAJOR) {
        problems.push({
          file: 'package-lock.json',
          line: lineOf(packageLock, `"${copy.path}"`),
          kind: 'stray-react-major',
          message: `${name} resolves to ${copy.version} at ${copy.path}, and the family runs React ${REACT_MAJOR}`,
          hint: `declare ^${REACT_MAJOR} and pin it in the root overrides`,
        });
      }
    }
  }

  const stale = stalePeer(entries);
  if (stale !== undefined) {
    for (const name of ['react', 'react-dom'] as const) {
      if (declared.get(name)?.override !== undefined) continue;
      problems.push({
        file: 'package.json',
        line: lineOf(packageJson, '"dependencies"'),
        kind: 'unpinned-react',
        message: `${stale.name} asks for ${stale.key} ${stale.range}, which excludes React ${REACT_MAJOR}, and nothing pins ${name}`,
        hint: `add "overrides": { "react": "^${REACT_MAJOR}…", "react-dom": "^${REACT_MAJOR}…" } to the root package.json`,
      });
    }
  }

  for (const name of SINGLE_COPY) {
    const entry = declared.get(name);
    if (entry?.override === undefined || entry.dependency === undefined) {
      continue;
    }
    if (entry.override !== entry.dependency) {
      problems.push({
        file: 'package.json',
        line: lineOf(packageJson, `"${name}"`),
        kind: 'conflicting-react-pin',
        message: `${name} is pinned to ${entry.override} while it is depended on as ${entry.dependency}, so npm install fails with EOVERRIDE`,
        hint: `write the same range in both: the override and the dependency are one decision`,
      });
    }
  }
}

/**
 * Every real copy of each tracked package, in lock order. A workspace link is
 * not a copy — it is the repository pointing at itself.
 * @param entries - The lock's `packages`, as entries.
 * @returns The copies found, keyed by package name.
 */
function resolvedCopies(
  entries: ReadonlyArray<[string, unknown]>,
): Map<string, Resolved[]> {
  const found = new Map<string, Resolved[]>();
  for (const [path, value] of entries) {
    if (typeof value !== 'object' || value === null) continue;
    const entry = value as { version?: unknown; link?: unknown };
    if (entry.link === true) continue;
    if (typeof entry.version !== 'string') continue;
    for (const name of SINGLE_COPY) {
      if (
        path !== `node_modules/${name}` &&
        !path.endsWith(`/node_modules/${name}`)
      ) {
        continue;
      }
      const copies = found.get(name) ?? [];
      copies.push({ path, version: entry.version });
      found.set(name, copies);
    }
  }
  return found;
}

/**
 * The first package in the lock whose React peer stopped before the family's
 * major — the thing that makes npm resolve a second copy.
 * @param entries - The lock's `packages`, as entries.
 * @returns What asks for what, or undefined when every peer admits the major.
 */
function stalePeer(
  entries: ReadonlyArray<[string, unknown]>,
): { name: string; key: string; range: string } | undefined {
  for (const [path, value] of entries) {
    if (typeof value !== 'object' || value === null) continue;
    const entry = value as {
      peerDependencies?: unknown;
      peerDependenciesMeta?: unknown;
    };
    const peers = entry.peerDependencies;
    if (typeof peers !== 'object' || peers === null) continue;
    const meta = (entry.peerDependenciesMeta ?? {}) as Record<
      string,
      { optional?: unknown } | undefined
    >;
    for (const key of ['react', 'react-dom']) {
      const range = (peers as Record<string, unknown>)[key];
      if (typeof range !== 'string') continue;
      if (meta[key]?.optional === true) continue;
      if (admitsMajor(range)) continue;
      return { name: path.replace(/^.*node_modules\//, ''), key, range };
    }
  }
  return undefined;
}

/**
 * Whether a range admits any release of the family's React major. A range that
 * cannot be parsed is given the benefit of the doubt: a checker that accuses on
 * a spelling it does not know teaches people to ignore it.
 * @param range - The peer range, as written.
 * @returns True when some version of the major satisfies it.
 */
function admitsMajor(range: string): boolean {
  try {
    return (
      semver.intersects(range, `>=${REACT_MAJOR}.0.0 <${REACT_MAJOR + 1}.0.0`, {
        includePrerelease: true,
      }) ||
      semver.satisfies(`${REACT_MAJOR}.0.0`, range, { includePrerelease: true })
    );
  } catch {
    return true;
  }
}

/**
 * What the root `package.json` asks for and what it pins, per tracked package.
 * @param packageJson - The file, unparsed.
 * @returns The declaration of each tracked package that has one.
 */
function declarations(packageJson: string | undefined): Map<string, Declared> {
  const found = new Map<string, Declared>();
  const parsed = parseJsonObject(packageJson);
  if (parsed === undefined) return found;
  const dependencies = {
    ...stringEntries(parsed.dependencies),
    ...stringEntries(parsed.devDependencies),
  };
  const overrides = stringEntries(parsed.overrides);
  for (const name of SINGLE_COPY) {
    const dependency = dependencies[name];
    const override = overrides[name];
    if (dependency === undefined && override === undefined) continue;
    found.set(name, { dependency, override });
  }
  return found;
}
