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

import { createPackageCollector } from '../bundledPackages.ts';

const made: string[] = [];

afterEach(() => {
  while (made.length > 0) {
    rmSync(made.pop() as string, { force: true, recursive: true });
  }
});

/**
 * A `node_modules` on disk, each package with what the collector reads.
 * @param packages - Its folder under the root, its manifest, its licence text.
 * @returns The root, and a module of one of those packages shipping `bytes`.
 */
function install(packages: Record<string, [object, string?]>) {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-packages-'));
  made.push(root);
  for (const [folder, [manifest, license]] of Object.entries(packages)) {
    const directory = join(root, folder);
    mkdirSync(join(directory, 'lib'), { recursive: true });
    writeFileSync(join(directory, 'package.json'), JSON.stringify(manifest));
    if (license !== undefined) {
      writeFileSync(join(directory, 'LICENSE'), license);
    }
  }
  return {
    root,
    module: (folder: string, bytes = 10) => ({
      [join(root, folder, 'lib/index.js')]: { renderedLength: bytes },
    }),
  };
}

test('the list holds what reached the bundle, sorted, with whose it is', () => {
  const { root, module } = install({
    'node_modules/zod': [{ name: 'zod', version: '4.0.0', license: 'MIT' }],
    'node_modules/ml-matrix': [
      {
        name: 'ml-matrix',
        version: '6.12.1',
        license: 'MIT',
        repository: 'mljs/matrix',
      },
    ],
    'node_modules/@zakodium/utils': [
      { name: '@zakodium/utils', version: '1.0.0', license: 'MIT' },
    ],
    'node_modules/shaken': [{ name: 'shaken', version: '1.0.0' }],
  });
  const collector = createPackageCollector();

  collector.record({
    'index.js': {
      type: 'chunk',
      modules: {
        ...module('node_modules/zod'),
        ...module('node_modules/ml-matrix'),
        ...module('node_modules/@zakodium/utils'),
        ...module('node_modules/shaken', 0),
        '\0vite/preload-helper': { renderedLength: 100 },
        [join(root, 'src/App.tsx')]: { renderedLength: 100 },
      },
    },
    'style.css': { type: 'asset' },
  });
  collector.write(root);

  expect(
    JSON.parse(readFileSync(join(root, 'packages.json'), 'utf8')),
  ).toStrictEqual([
    { name: '@zakodium/utils', version: '1.0.0', license: 'MIT', own: true },
    { name: 'ml-matrix', version: '6.12.1', license: 'MIT', own: true },
    { name: 'zod', version: '4.0.0', license: 'MIT', own: false },
  ]);
});

test('a worker bundle counts, and two versions of a package are two rows', () => {
  const { root, module } = install({
    'node_modules/pako': [{ name: 'pako', version: '2.1.0', license: 'MIT' }],
    'node_modules/jspdf/node_modules/pako': [
      { name: 'pako', version: '1.0.11', license: 'MIT' },
    ],
  });
  const collector = createPackageCollector();
  const { generateBundle } = collector.workerPlugin as unknown as {
    generateBundle: (options: unknown, bundle: object) => void;
  };

  collector.record({
    'a.js': { type: 'chunk', modules: module('node_modules/pako') },
  });
  generateBundle(
    {},
    {
      'worker.js': {
        type: 'chunk',
        modules: module('node_modules/jspdf/node_modules/pako'),
      },
    },
  );
  collector.write(root);

  expect(
    JSON.parse(readFileSync(join(root, 'packages.json'), 'utf8')),
  ).toStrictEqual([
    { name: 'pako', version: '1.0.11', license: 'MIT', own: false },
    { name: 'pako', version: '2.1.0', license: 'MIT', own: false },
  ]);
});

test('the licence texts carry each package and its own text', () => {
  const { root, module } = install({
    'node_modules/ml-matrix': [
      { name: 'ml-matrix', version: '6.12.1', license: 'MIT' },
      'Copyright (c) the ml.js authors',
    ],
    'node_modules/fft.js': [{ name: 'fft.js', version: '4.0.4' }],
  });
  const collector = createPackageCollector();

  collector.record({
    'a.js': {
      type: 'chunk',
      modules: {
        ...module('node_modules/ml-matrix'),
        ...module('node_modules/fft.js'),
      },
    },
  });
  collector.write(root);

  const texts = readFileSync(join(root, 'licenses.txt'), 'utf8');

  expect(texts).toContain('ml-matrix 6.12.1 (MIT)');
  expect(texts).toContain('Copyright (c) the ml.js authors');
  expect(texts).toContain('fft.js 4.0.4');
  expect(texts.indexOf('fft.js 4.0.4')).toBeLessThan(
    texts.indexOf('ml-matrix 6.12.1'),
  );
});

test('the older shapes of a licence are read, and a missing one stays absent', () => {
  const { root, module } = install({
    'node_modules/old': [
      { name: 'old', version: '1.0.0', license: { type: 'ISC' } },
    ],
    'node_modules/older': [
      {
        name: 'older',
        version: '1.0.0',
        licenses: [{ type: 'MIT' }, { type: 'GPL-2.0' }],
      },
    ],
    'node_modules/silent': [{ name: 'silent', version: '1.0.0' }],
  });
  const collector = createPackageCollector();

  collector.record({
    'a.js': {
      type: 'chunk',
      modules: {
        ...module('node_modules/old'),
        ...module('node_modules/older'),
        ...module('node_modules/silent'),
      },
    },
  });
  collector.write(root);

  expect(
    JSON.parse(readFileSync(join(root, 'packages.json'), 'utf8')),
  ).toStrictEqual([
    { name: 'old', version: '1.0.0', license: 'ISC', own: false },
    { name: 'older', version: '1.0.0', license: 'MIT OR GPL-2.0', own: false },
    { name: 'silent', version: '1.0.0', own: false },
  ]);
});

test('the two packages left off by decision are in neither file', () => {
  const { root, module } = install({
    'node_modules/jcampconverter': [
      {
        name: 'jcampconverter',
        version: '12.5.11',
        license: 'CC-BY-NC-SA-4.0',
      },
      'the licence of jcampconverter',
    ],
    'node_modules/@peterspackman/occjs': [
      { name: '@peterspackman/occjs', version: '0.8.0' },
    ],
    'node_modules/react': [
      { name: 'react', version: '19.3.1', license: 'MIT' },
    ],
  });
  const collector = createPackageCollector();

  collector.record({
    'a.js': {
      type: 'chunk',
      modules: {
        ...module('node_modules/jcampconverter'),
        ...module('node_modules/@peterspackman/occjs'),
        ...module('node_modules/react'),
      },
    },
  });
  collector.write(root);

  const texts = readFileSync(join(root, 'licenses.txt'), 'utf8');

  expect(
    JSON.parse(readFileSync(join(root, 'packages.json'), 'utf8')),
  ).toStrictEqual([
    { name: 'react', version: '19.3.1', license: 'MIT', own: false },
  ]);
  expect(texts).not.toContain('jcampconverter');
  expect(texts).not.toContain('occjs');
});

test('a build that recorded nothing writes nothing', () => {
  const { root } = install({});
  const collector = createPackageCollector();

  collector.write(root);

  expect(existsSync(join(root, 'packages.json'))).toBe(false);
  expect(existsSync(join(root, 'licenses.txt'))).toBe(false);
});
