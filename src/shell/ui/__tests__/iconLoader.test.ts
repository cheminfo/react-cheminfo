import type { IconPaths } from '@blueprintjs/icons';
import { IconSize, Icons } from '@blueprintjs/icons';
import { expect, test } from 'vitest';

import { iconPaths, loadIconsOneByOne } from '../iconLoader.ts';

const ADD_16: IconPaths = ['M10 7H9V6H7v1H6v2h1v1h2V9h1z'];
const ADD_20: IconPaths = ['M12 9V8H8v1H7v2h1v1h4v-1h1V9z'];

const PATHS = {
  standard: { './add.js': () => Promise.resolve(ADD_16) },
  large: { './add.js': () => Promise.resolve(ADD_20) },
};

test('an icon is read from the module of its size', async () => {
  await expect(iconPaths(PATHS, 'add', IconSize.STANDARD)).resolves.toBe(
    ADD_16,
  );
  await expect(iconPaths(PATHS, 'add', IconSize.LARGE)).resolves.toBe(ADD_20);
});

test('an icon Blueprint does not have says so', async () => {
  await expect(iconPaths(PATHS, 'cross', IconSize.STANDARD)).rejects.toThrow(
    'Blueprint has no 16px icon named "cross".',
  );
});

test('Blueprint then loads each icon from the site’s own modules', async () => {
  loadIconsOneByOne(PATHS);
  await Icons.load('add', IconSize.LARGE);

  expect(Icons.getPaths('add', IconSize.LARGE)).toBe(ADD_20);
});
