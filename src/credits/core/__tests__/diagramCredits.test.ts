import { expect, test } from 'vitest';

import { credits } from '../credits.ts';

test('dagre, which lays out the graphs of diagram.cheminfo.org, is credited under its npm name', () => {
  expect(credits(['dagre'])).toStrictEqual([
    {
      id: 'dagre',
      name: 'dagre',
      href: 'https://github.com/dagrejs/dagre',
      packageName: '@dagrejs/dagre',
      description:
        'lays out a graph in ranks, so its arrows all point one way.',
      license: 'MIT',
    },
  ]);
});
