import type { ComposeService } from './composeDocument.ts';
import { readComposeDocument } from './composeDocument.ts';
import { carriesMarker } from './markers.ts';
import type { DeployProblem } from './types.ts';

/** The rules a compose file is read against, resolved from the options. */
interface ComposeRules {
  /** The package this repository publishes, when it is checked. */
  imageName: string | undefined;
  /** Image prefixes built elsewhere, exempt from the tag rule. */
  foreignImages: readonly string[];
  /** Whether every service we build must declare a healthcheck. */
  requireHealthcheck: boolean;
  /** The lowercased marker that waives a service's healthcheck. */
  healthcheckMarker: string;
  /** The lowercased marker that waives an image's tag rules. */
  pinMarker: string;
}

const OWN_IMAGE = /^\$\{IMAGE_NAME:-(?<name>[^}]+)\}:\$\{IMAGE_TAG:-[^}]+\}$/;

/**
 * Report what one compose file gets wrong: whether it parses, its images, its
 * build contexts, its `env_file` entries and its healthchecks.
 * @param name - The file, as a report names it.
 * @param text - Its content.
 * @param rules - What the file is checked against.
 * @param problems - Where each problem found is appended, in reading order.
 */
export function readComposeFile(
  name: string,
  text: string,
  rules: ComposeRules,
  problems: DeployProblem[],
): void {
  const document = readComposeDocument(text);
  if (document.error !== undefined) {
    problems.push({
      file: name,
      line: document.error.line,
      kind: 'invalid-compose',
      message: `the file is not valid YAML: ${document.error.message}`,
      hint: 'fix the YAML; docker compose config reports the same error',
    });
    return;
  }

  const found: DeployProblem[] = [];
  const report = (
    line: number,
    problem: Pick<DeployProblem, 'kind' | 'message' | 'hint'>,
  ) => found.push({ file: name, line, ...problem });

  for (const service of document.services) {
    const { image, build } = service.value;
    const own =
      typeof image === 'string'
        ? OWN_IMAGE.exec(image)?.groups?.name
        : undefined;

    if (typeof image === 'string') {
      const line = service.lineOf('image');
      const problem =
        own === undefined
          ? foreignImageProblem(
              image,
              carriesMarker(document.lines, line - 1, rules.pinMarker),
              rules,
            )
          : ownImageProblem(own, rules);
      if (problem !== undefined) report(line, problem);
    }

    if (
      'env_file' in service.value &&
      requiresEnvFile(service.value.env_file)
    ) {
      report(service.lineOf('env_file'), {
        kind: 'required-env-file',
        message:
          'env_file is required, so compose fails on a checkout that has no .env yet',
        hint: 'write env_file: [{ path: .env, required: false }]',
      });
    }

    if (own === undefined) continue;
    if (build === undefined || build === null) {
      report(service.line, {
        kind: 'missing-build',
        message: `service ${service.name} carries no build context, so it cannot be built from the checkout`,
        hint: 'add build: . next to image:',
      });
    }
    if (rules.requireHealthcheck && !isProbed(service, document.lines, rules)) {
      report(service.line, {
        kind: 'missing-healthcheck',
        message: `service ${service.name} declares no healthcheck, so the deploy script cannot tell a broken container from a good one`,
        hint: 'add a healthcheck probing the health endpoint',
      });
    }
  }

  problems.push(...found.toSorted((one, other) => one.line - other.line));
}

function ownImageProblem(
  name: string,
  rules: ComposeRules,
): Pick<DeployProblem, 'kind' | 'message' | 'hint'> | undefined {
  if (rules.imageName === undefined || name === rules.imageName) {
    return undefined;
  }
  return {
    kind: 'wrong-image-name',
    message: `IMAGE_NAME defaults to ${name}, which this repository never publishes`,
    hint: `default it to ${rules.imageName}`,
  };
}

function foreignImageProblem(
  value: string,
  waived: boolean,
  rules: ComposeRules,
): Pick<DeployProblem, 'kind' | 'message' | 'hint'> | undefined {
  // Somebody else builds it and this site tracks it on purpose.
  if (waived) return undefined;

  const bare = value.replace(/^docker\.io\/(?:library\/)?/, '');
  const isForeign = rules.foreignImages.some(
    (prefix) => value.startsWith(prefix) || bare.startsWith(prefix),
  );
  if (!isForeign) {
    return {
      kind: 'unpinned-image',
      message: `image ${value} gives the deploy script no tag to select`,
      hint: `write \${IMAGE_NAME:-ghcr.io/<owner>/<repo>}:\${IMAGE_TAG:-latest}`,
    };
  }
  if (value.endsWith(':latest') || !value.includes(':')) {
    return {
      kind: 'floating-sidecar',
      message: `third-party image ${value} is not pinned, so a rebuild is not reproducible`,
      hint: 'pin the sidecar to an exact version',
    };
  }
  return undefined;
}

/**
 * Whether compose fails when a listed file is absent: a bare path is required,
 * and so is a `{ path }` entry unless it says `required: false`.
 * @param value - The service's `env_file`, in its short or long form.
 * @returns True when any entry is required.
 */
function requiresEnvFile(value: unknown): boolean {
  const entries: unknown[] = Array.isArray(value) ? value : [value];
  for (const entry of entries) {
    if (typeof entry !== 'object' || entry === null) return true;
    if ((entry as { required?: unknown }).required !== false) return true;
  }
  return false;
}

/**
 * Whether Docker will report the service's health: it declares a healthcheck
 * that is not disabled, or a comment inside it carries the waiver.
 * @param service - The service.
 * @param lines - The file, split into lines.
 * @param rules - The marker that waives the healthcheck.
 * @returns True when the deploy script has a health to read, or needs none.
 */
function isProbed(
  service: ComposeService,
  lines: readonly string[],
  rules: ComposeRules,
): boolean {
  const [first, last] = service.lines;
  for (let line = first; line <= last; line++) {
    if (
      (lines[line - 1] ?? '').toLowerCase().includes(rules.healthcheckMarker)
    ) {
      return true;
    }
  }

  const { healthcheck } = service.value;
  if (typeof healthcheck !== 'object' || healthcheck === null) return false;
  const { disable, test } = healthcheck as {
    disable?: unknown;
    test?: unknown;
  };
  if (disable === true) return false;
  const command = Array.isArray(test) ? test[0] : test;
  return command !== 'NONE';
}
