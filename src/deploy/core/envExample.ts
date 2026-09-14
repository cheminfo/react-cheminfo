import type { DeployProblem } from './types.ts';

/**
 * Report what an `.env.example` fails to offer the operator: the two variables
 * the deploy script rewrites, and one commented `COMPOSE_FILE` line per mode.
 * @param text - The content of `.env.example`.
 * @param expected - The compose files the repository is expected to ship.
 * @param problems - Where each problem found is appended.
 */
export function readEnvExample(
  text: string,
  expected: readonly string[],
  problems: DeployProblem[],
): void {
  for (const name of ['IMAGE_NAME', 'IMAGE_TAG']) {
    if (!new RegExp(String.raw`^#?\s*${name}=`, 'm').test(text)) {
      problems.push({
        file: '.env.example',
        line: 0,
        kind: 'missing-env-example',
        message: `${name} is not declared, so the operator cannot see what the deploy script sets`,
        hint: `add a ${name}= line`,
      });
    }
  }

  for (const name of expected) {
    const offered = new RegExp(
      String.raw`^#\s*COMPOSE_FILE=${escapeRegExp(name)}(?:\s|$)`,
      'm',
    );
    if (!offered.test(text)) {
      problems.push({
        file: '.env.example',
        line: 0,
        kind: 'missing-env-example',
        message: `no commented COMPOSE_FILE line offers ${name}`,
        hint: `add a commented COMPOSE_FILE=${name} line`,
      });
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
}
