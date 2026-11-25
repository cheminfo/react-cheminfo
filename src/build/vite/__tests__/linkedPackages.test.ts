import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, test } from 'vitest';

import { createPackageCollector } from '../bundledPackages.ts';

const made: string[] = [];

afterEach(() => {
  while (made.length > 0) {
    rmSync(made.pop() as string, { force: true, recursive: true });
  }
});

/**
 * Write a manifest, and a licence beside it.
 * @param directory - The package's folder.
 * @param manifest - Its `package.json`.
 * @param license - Its licence text.
 * @default no licence file
 */
function writePackage(directory: string, manifest: object, license?: string) {
  mkdirSync(join(directory, 'lib'), { recursive: true });
  writeFileSync(join(directory, 'package.json'), JSON.stringify(manifest));
  if (license !== undefined) writeFileSync(join(directory, 'LICENSE'), license);
}

test('a package linked from a checkout is listed by its own manifest; the project’s own modules are not', () => {
  const disk = mkdtempSync(join(tmpdir(), 'cheminfo-linked-'));
  made.push(disk);
  const site = join(disk, 'websites', 'site');
  writePackage(site, { name: 'site', version: '0.0.0', private: true });
  writePackage(
    join(disk, 'image-js'),
    {
      name: 'image-js',
      version: '1.7.1',
      license: 'MIT',
      repository: 'image-js/image-js',
    },
    'The MIT License',
  );
  writePackage(join(site, 'node_modules', 'zod'), {
    name: 'zod',
    version: '4.0.0',
    license: 'MIT',
  });
  const collector = createPackageCollector(() => site);

  collector.record({
    'index.js': {
      type: 'chunk',
      modules: {
        [join(disk, 'image-js', 'lib', 'index.js')]: { renderedLength: 10 },
        [`${join(disk, 'image-js', 'lib', 'worker.js')}?worker`]: {
          renderedLength: 10,
        },
        [join(site, 'node_modules', 'zod', 'lib', 'index.js')]: {
          renderedLength: 10,
        },
        [join(site, 'src', 'App.tsx')]: { renderedLength: 100 },
        'virtual:module': { renderedLength: 5 },
      },
    },
  });
  collector.write(disk);

  expect(
    JSON.parse(readFileSync(join(disk, 'packages.json'), 'utf8')),
  ).toStrictEqual([
    { name: 'image-js', version: '1.7.1', license: 'MIT', own: true },
    { name: 'zod', version: '4.0.0', license: 'MIT', own: false },
  ]);
  expect(readFileSync(join(disk, 'licenses.txt'), 'utf8')).toContain(
    'image-js 1.7.1 (MIT)',
  );
});

test('a private package beside the project, such as a backend the frontend imports from, is not listed', () => {
  const disk = mkdtempSync(join(tmpdir(), 'cheminfo-linked-'));
  made.push(disk);
  const frontend = join(disk, 'chemcalc', 'frontend');
  const backend = join(disk, 'chemcalc', 'backend');
  writePackage(frontend, { name: 'frontend', version: '0.0.0', private: true });
  writePackage(
    backend,
    {
      name: 'chemcalc-backend',
      version: '2.3.0',
      license: 'MIT',
      private: true,
    },
    'The MIT License',
  );
  writePackage(join(disk, 'mf-parser'), {
    name: 'mf-parser',
    version: '3.4.0',
    license: 'MIT',
    repository: 'cheminfo/mfjs',
  });
  const collector = createPackageCollector(() => frontend);

  collector.record({
    'index.js': {
      type: 'chunk',
      modules: {
        [join(backend, 'src', 'formulas.ts')]: { renderedLength: 10 },
        [join(disk, 'mf-parser', 'lib', 'index.js')]: { renderedLength: 10 },
      },
    },
  });
  collector.write(disk);

  expect({
    packages: JSON.parse(readFileSync(join(disk, 'packages.json'), 'utf8')),
    licenses: readFileSync(join(disk, 'licenses.txt'), 'utf8').includes(
      'chemcalc-backend',
    ),
  }).toStrictEqual({
    packages: [
      { name: 'mf-parser', version: '3.4.0', license: 'MIT', own: true },
    ],
    licenses: false,
  });
});
