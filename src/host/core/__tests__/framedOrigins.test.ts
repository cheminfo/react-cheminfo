import { expect, test } from 'vitest';

import { framedSiteOrigin, localOrigins } from '../framedOrigins.ts';

test('the local origins are read as id=origin pairs, each kept as its origin', () => {
  expect(
    localOrigins(
      '3d=http://localhost:10731/, plot = http://localhost:10800/chart ,bad=nope,=x',
    ),
  ).toStrictEqual(
    new Map([
      ['3d', 'http://localhost:10731'],
      ['plot', 'http://localhost:10800'],
    ]),
  );
  expect(localOrigins(undefined)).toStrictEqual(new Map());
});

test('a site is framed from its own host, or from its checkout in development', () => {
  const local = '3d=http://localhost:10731';

  expect(framedSiteOrigin('3d', { host: '3d.cheminfo.org', local })).toBe(
    'https://3d.cheminfo.org',
  );
  expect(
    framedSiteOrigin('3d', { host: '3d.cheminfo.org', local, dev: true }),
  ).toBe('http://localhost:10731');
  expect(
    framedSiteOrigin('plot', { host: 'plot.cheminfo.org', local, dev: true }),
  ).toBe('https://plot.cheminfo.org');
});
