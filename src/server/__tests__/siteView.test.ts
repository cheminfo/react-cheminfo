import { expect, test } from 'vitest';

import { siteView } from '../siteView.ts';

test('the view frames the site and this server, and nothing else', () => {
  const view = siteView({
    uri: 'ui://lcao/page',
    name: 'lcao.cheminfo.org',
    description: 'The answer as a card, and the playground over the screen.',
    addresses: {
      siteUrl: 'https://lcao.cheminfo.org/',
      publicUrl: 'https://lcao.c6h6.org/',
    },
  });

  expect(view.uri).toBe('ui://lcao/page');
  expect(view.name).toBe('lcao.cheminfo.org');
  expect(view.description).toBe(
    'The answer as a card, and the playground over the screen.',
  );
  expect(view.csp).toStrictEqual({
    frameDomains: ['https://lcao.c6h6.org', 'https://lcao.cheminfo.org'],
  });
  expect(view.permissions).toStrictEqual({ clipboardWrite: {} });
  expect(view.html).toContain('https://lcao.c6h6.org');
});

test('a fixed height reaches the frame', () => {
  const view = siteView({
    uri: 'ui://3d/page',
    name: '3d.cheminfo.org',
    description: 'The conformers page.',
    addresses: {
      siteUrl: 'https://3d.cheminfo.org',
      publicUrl: 'https://3d.cheminfo.org',
    },
    height: 480,
  });

  expect(view.csp).toStrictEqual({
    frameDomains: ['https://3d.cheminfo.org'],
  });
  expect(view.html).toContain('480');
});
