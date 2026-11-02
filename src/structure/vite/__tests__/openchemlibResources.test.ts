import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, test } from 'vitest';

import {
  OCL_CONFORMER_RESOURCES,
  OCL_PREDICTOR_RESOURCES,
  keptResources,
  openchemlibResources,
} from '../openchemlibResources.ts';

const RESOURCES = {
  '/resources/cod/torsionAngles.txt': 'a',
  '/resources/forcefield/mmff94/angle.csv': 'b',
  '/resources/toxpredictor/m1.txt': 'c',
  '/resources/druglikeness/fragments.txt': 'd',
};

const made: string[] = [];

afterEach(() => {
  while (made.length > 0) {
    rmSync(made.pop() as string, { force: true, recursive: true });
  }
});

/**
 * A site root with an installed openchemlib carrying the resources above.
 * @returns The root.
 */
function siteRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-ocl-'));
  made.push(root);
  const dist = join(root, 'node_modules', 'openchemlib', 'dist');
  mkdirSync(dist, { recursive: true });
  writeFileSync(
    join(root, 'node_modules', 'openchemlib', 'package.json'),
    JSON.stringify({ name: 'openchemlib', main: 'dist/openchemlib.js' }),
  );
  writeFileSync(join(dist, 'openchemlib.js'), '');
  writeFileSync(join(dist, 'resources.json'), JSON.stringify(RESOURCES));
  writeFileSync(join(root, 'package.json'), '{}');
  return root;
}

function resolveConfig(
  plugin: ReturnType<typeof openchemlibResources>,
  root: string,
): void {
  const hook = plugin.configResolved as (config: object) => void;
  hook({ root, publicDir: join(root, 'public') });
}

test('keptResources keeps the keys under the prefixes asked for', () => {
  expect(keptResources(RESOURCES, OCL_CONFORMER_RESOURCES)).toStrictEqual({
    '/resources/cod/torsionAngles.txt': 'a',
    '/resources/forcefield/mmff94/angle.csv': 'b',
  });
  expect(keptResources(RESOURCES, OCL_PREDICTOR_RESOURCES)).toStrictEqual({
    '/resources/toxpredictor/m1.txt': 'c',
    '/resources/druglikeness/fragments.txt': 'd',
  });
});

test('the plugin writes the kept resources into public/', () => {
  const root = siteRoot();
  resolveConfig(openchemlibResources({ keep: OCL_CONFORMER_RESOURCES }), root);
  const written = JSON.parse(
    readFileSync(join(root, 'public', 'openchemlib-resources.json'), 'utf8'),
  ) as unknown;

  expect(written).toStrictEqual({
    '/resources/cod/torsionAngles.txt': 'a',
    '/resources/forcefield/mmff94/angle.csv': 'b',
  });
});

test('the file can be named', () => {
  const root = siteRoot();
  resolveConfig(
    openchemlibResources({
      keep: OCL_PREDICTOR_RESOURCES,
      file: 'ocl/resources.json',
    }),
    root,
  );

  expect(existsSync(join(root, 'public', 'ocl', 'resources.json'))).toBe(true);
});

test('a prefix that matches nothing fails the build', () => {
  const root = siteRoot();

  expect(() => {
    resolveConfig(openchemlibResources({ keep: ['/resources/none/'] }), root);
  }).toThrow(/No OpenChemLib resource matched \/resources\/none\//);
});

test('the untrimmed copy Vite emits is dropped, and nothing else', () => {
  const directory = mkdtempSync(join(tmpdir(), 'cheminfo-ocl-out-'));
  made.push(directory);
  writeFileSync(
    join(directory, 'resources-AbC12.json'),
    JSON.stringify(RESOURCES),
  );
  writeFileSync(join(directory, 'resources-other.json'), '{"a":1}');
  const plugin = openchemlibResources({ keep: OCL_CONFORMER_RESOURCES });
  const hook = plugin.writeBundle as (
    output: { dir?: string },
    bundle: Record<string, unknown>,
  ) => void;
  hook(
    { dir: directory },
    { 'resources-AbC12.json': {}, 'resources-other.json': {} },
  );

  expect(existsSync(join(directory, 'resources-AbC12.json'))).toBe(false);
  expect(existsSync(join(directory, 'resources-other.json'))).toBe(true);
});
