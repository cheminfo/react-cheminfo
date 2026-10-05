import type { DeployProblem } from './types.ts';

/** The workflow that publishes this repository's image, at its fixed path. */
export const DOCKER_IMAGE_WORKFLOW = '.github/workflows/docker-image.yml';

const TAG_VERSION = /^\s*tag-version:\s*(?<value>.+?)\s*$/m;
const INSTALL = /^\s*RUN\s+npm\s+ci\b/;
const RETRIES = /^\s*ENV\s+.*\bNPM_CONFIG_FETCH_RETRIES=/;
const STAGE = /^\s*FROM\s+/i;
// Written with an escaped brace so it is not read as an interpolation here.
const GUARDED = `\${{ github.event_name == 'push' && github.ref_name || '' }}`;

/**
 * Report a repository whose image is never published with a `latest` tag.
 *
 * The shared workflow derives `:<version>`, `:<major>.<minor>`, `:<major>` and
 * `:latest` from `tag-version` alone; given nothing it publishes a single
 * `:HEAD` and no `latest`. Compose files default to `${IMAGE_TAG:-latest}`, so
 * the deploy then has nothing to pull and builds the image on the deploy host
 * instead — which is how a registry blip, a build timeout or an out-of-memory
 * kill becomes an outage, reported against npm rather than against the missing
 * tag. The workflow, the release and the push all succeed, so nothing says so.
 * @param workflow - The docker-image workflow, or undefined when there is none.
 * @param problems - Where each problem found is appended.
 */
export function readPublishedImage(
  workflow: string | undefined,
  problems: DeployProblem[],
): void {
  if (workflow === undefined) {
    problems.push({
      file: DOCKER_IMAGE_WORKFLOW,
      line: 0,
      kind: 'unpublishable-image',
      message:
        'nothing publishes an image, so every deploy builds one on the server',
      hint: 'add docker-image.yml, calling the shared workflow on a v* tag with a guarded tag-version',
    });
    return;
  }

  const match = TAG_VERSION.exec(workflow);
  if (match?.groups === undefined) {
    problems.push({
      file: DOCKER_IMAGE_WORKFLOW,
      line: lineOf(workflow, /docker-image\.yml@docker-image/),
      kind: 'unpublishable-image',
      message:
        'no tag-version, so the package gets a single :HEAD and no :latest for a compose file to pull',
      hint: `with: tag-version: ${GUARDED}`,
    });
    return;
  }

  const value = match.groups.value ?? '';
  // Either guard keeps a branch name out: `event_name == 'push'` fires only for
  // the tag push, and `ref_type == 'tag'` only when the ref is one. What is
  // refused is the bare ref, which a manual run hands over as a branch.
  const guarded = value.includes('event_name') || value.includes('ref_type');
  if (value.includes('github.ref_name') && !guarded) {
    problems.push({
      file: DOCKER_IMAGE_WORKFLOW,
      line: lineOf(workflow, TAG_VERSION),
      kind: 'unpublishable-image',
      message:
        'tag-version is the bare ref, which on a manual run is a branch name split as if it were a semver',
      hint: `guard it: ${GUARDED}`,
    });
  }
}

/**
 * Report a build stage that installs with npm's own patience.
 *
 * A deploy with no image to pull builds from source on the deploy host, so the
 * whole dependency closure comes over the network at the one moment nothing may
 * fail. npm's two default retries are capped at a minute and spent in under
 * twenty seconds, which is short enough that an ordinary blip reads as a broken
 * repository — so each stage that installs says how long it is willing to try.
 * @param dockerfile - The Dockerfile.
 * @param problems - Where each problem found is appended.
 */
export function readInstallRetries(
  dockerfile: string,
  problems: DeployProblem[],
): void {
  const lines = dockerfile.split('\n');
  let patient = false;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? '';
    // ENV does not cross a FROM, so each stage answers for itself.
    if (STAGE.test(line)) {
      patient = false;
    } else if (RETRIES.test(line)) {
      patient = true;
    } else if (INSTALL.test(line) && !patient) {
      problems.push({
        file: 'Dockerfile',
        line: index + 1,
        kind: 'brittle-install',
        message:
          "npm ci installs with npm's two default retries, so a network blip of twenty seconds fails the deploy",
        hint: 'ENV NPM_CONFIG_FETCH_RETRIES=5 NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 above it, in this stage',
      });
      patient = true;
    }
  }
}

function lineOf(text: string, pattern: RegExp): number {
  const match = pattern.exec(text);
  if (match === null) return 0;
  return text.slice(0, match.index).split('\n').length;
}
