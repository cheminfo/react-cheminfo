import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';

import { IMAGE, repository, service } from './deployRepository.ts';

/**
 * The lines of compose.yaml reported for a required env_file.
 * @param envFile - What is written under the service, from `env_file:` on.
 * @returns The line of each required-env-file problem.
 */
function requiredLines(envFile: string): number[] {
  const problems = findDeployProblems(
    repository({ 'compose.yaml': service(envFile) }),
    { imageName: IMAGE },
  );
  const lines: number[] = [];
  for (const problem of problems) {
    expect(problem.kind).toBe('required-env-file');

    lines.push(problem.line);
  }
  return lines;
}

test('the short form is required, as a string and as a list of paths', () => {
  expect(requiredLines('    env_file: .env\n')).toStrictEqual([7]);
  expect(requiredLines("    env_file: ['.env']\n")).toStrictEqual([7]);
  expect(requiredLines('    env_file:\n      - .env\n')).toStrictEqual([7]);
});

test('the long form is accepted only when every entry says required: false', () => {
  expect(
    requiredLines(
      '    env_file:\n      - path: .env\n        required: false\n',
    ),
  ).toStrictEqual([]);
  expect(
    requiredLines('    env_file: [{ path: .env, required: false }]\n'),
  ).toStrictEqual([]);
  expect(requiredLines('    env_file:\n      - path: .env\n')).toStrictEqual([
    7,
  ]);
  expect(
    requiredLines(
      '    env_file:\n      - path: .env\n        required: true\n',
    ),
  ).toStrictEqual([7]);
});

test('one required entry among optional ones is reported once', () => {
  const mixed = `    env_file:
      - path: .env
        required: false
      - secrets.env
      - path: local.env
        required: false
`;

  expect(requiredLines(mixed)).toStrictEqual([7]);
});

test('an env_file merged from an anchor is reported on the anchor line', () => {
  const merged = `x-env: &env
  env_file: .env
${service('    <<: *env\n')}`;

  const problems = findDeployProblems(repository({ 'compose.yaml': merged }), {
    imageName: IMAGE,
  });

  expect(problems.map((problem) => [problem.kind, problem.line])).toStrictEqual(
    [['required-env-file', 2]],
  );
});
