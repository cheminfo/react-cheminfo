import type { DeployProblem } from './types.ts';

/** The scripts a repository's own `package.json` declares, as npm would run them. */
type Scripts = Record<string, string>;

/**
 * Report a repository that can bundle, and so publish, code nothing tested.
 *
 * A bundle is what gets published, so `npm run build` is the gate: the unit and
 * static checks, then the browser suite, then `build-only`, which is the pure
 * bundle. The split is what makes the gate possible at all — three callers need
 * the bundle without the suites, and the image build is one of them: it has no
 * browser, and a source build on a deploy host must not re-run a suite CI
 * already ran. A Dockerfile left on `npm run build` therefore either dies in
 * the container or, worse, the `build` it calls was never a gate and the image
 * carries untested code to the registry. Neither is visible until a deploy.
 * @param packageJson - The repository's root `package.json`, unparsed.
 * @param dockerfile - Its Dockerfile, when it has one.
 * @param problems - Where each problem found is appended.
 */
export function readBuildGate(
  packageJson: string | undefined,
  dockerfile: string | undefined,
  problems: DeployProblem[],
): void {
  if (packageJson === undefined) return;
  const scripts = parseScripts(packageJson);
  if (scripts === undefined) return;

  const build = scripts.build;
  if (build !== undefined && !/\bnpm run test\b/.test(build)) {
    problems.push({
      file: 'package.json',
      line: lineOf(packageJson, '"build"'),
      kind: 'ungated-build',
      message:
        'build writes a bundle without running the tests, so a broken site can be published',
      hint: 'build: "npm run test && npm run test-e2e && npm run build-only", with the bundle in build-only',
    });
  }
  if (build !== undefined && scripts['build-only'] === undefined) {
    problems.push({
      file: 'package.json',
      line: lineOf(packageJson, '"build"'),
      kind: 'missing-build-only',
      message: 'there is no build-only, so nothing can bundle without the gate',
      hint: 'move the bundle to build-only and leave build as the gate in front of it',
    });
  }

  const test = scripts.test;
  if (test !== undefined && /\bnpm run test-e2e\b/.test(test)) {
    problems.push({
      file: 'package.json',
      line: lineOf(packageJson, '"test"'),
      kind: 'test-runs-e2e',
      message:
        'test runs the browser suite, which build runs next: it runs twice and a failure does not say which gate it came from',
      hint: 'leave test-e2e out of test; build is "npm run test && npm run test-e2e && npm run build-only"',
    });
  }

  if (dockerfile === undefined) return;
  const line = gatedBuildLine(dockerfile);
  if (line !== undefined) {
    problems.push({
      file: 'Dockerfile',
      line,
      kind: 'gated-image-build',
      message:
        'the image build runs the gated build, which has no browser to run the browser suite in',
      hint: 'RUN npm run build-only — the image builds what CI tested, it does not test again',
    });
  }
}

/**
 * The line running the repository's own gated `build`, if the Dockerfile has
 * one. A workspace build (`-w frontend`) is a different script and stays pure.
 * @param dockerfile - The Dockerfile text.
 * @returns Its line number, counting from 1, or undefined.
 */
function gatedBuildLine(dockerfile: string): number | undefined {
  const lines = dockerfile.split('\n');
  for (const [index, text] of lines.entries()) {
    if (!/^\s*RUN\s.*\bnpm run build\b/.test(text)) continue;
    if (/\bnpm run build[\w:-]/.test(text)) continue;
    if (/(?:-w|--workspace)[\s=]/.test(text)) continue;
    return index + 1;
  }
  return undefined;
}

/**
 * The scripts block of a `package.json`.
 * @param text - The file, unparsed.
 * @returns Its scripts, or undefined when the file is not readable as one.
 */
function parseScripts(text: string): Scripts | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (typeof parsed !== 'object' || parsed === null) return undefined;
  const scripts = (parsed as { scripts?: unknown }).scripts;
  if (typeof scripts !== 'object' || scripts === null) return {};
  return scripts as Scripts;
}

/**
 * Where a report should point, so the reader lands on the script itself.
 * @param text - The file to search.
 * @param needle - The key to find.
 * @returns Its line, counting from 1, or 0 when it is not there.
 */
function lineOf(text: string, needle: string): number {
  const at = text.indexOf(needle);
  if (at === -1) return 0;
  return text.slice(0, at).split('\n').length;
}
