import { expect, test } from 'vitest';

import { isOwnPackage } from '../bundledPackages.ts';

test.each([
  ['git+https://github.com/cheminfo/openchemlib-js.git', true],
  ['https://github.com/mljs/matrix', true],
  ['git@github.com:image-js/fast-png.git', true],
  ['git://github.com/zakodium-oss/react-science.git', true],
  ['github:zakodium/pdnd-esm', true],
  ['cheminfo/smart-array-filter', true],
  ['https://github.com/cheminfo-js/is-any-array', true],
  ['https://github.com/palantir/blueprint', false],
  ['https://github.com/mljs-fork/matrix', false],
  ['https://gitlab.com/cheminfo/something', false],
  ['https://github.com/someone/cheminfo', false],
])('the repository %s is ours: %s', (url, expected) => {
  expect(isOwnPackage('a-package', url)).toBe(expected);
  expect(isOwnPackage('a-package', { type: 'git', url })).toBe(expected);
});

test('a package of ours whose manifest names no repository is still ours', () => {
  expect(isOwnPackage('inchi-js', undefined)).toBe(true);
  expect(isOwnPackage('iupac-names', undefined)).toBe(true);
  expect(isOwnPackage('@zakodium/nmr-types', undefined)).toBe(true);
  expect(isOwnPackage('left-pad', undefined)).toBe(false);
});
