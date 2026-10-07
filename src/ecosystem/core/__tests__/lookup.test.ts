import { expect, test } from 'vitest';

import { findSiteByHost, groupedSites, siteById } from '../lookup.ts';
import type { SiteId } from '../sites.ts';
import { ECOSYSTEM_SITES } from '../sites.ts';
import { UNLISTED_SITES } from '../unlistedSites.ts';

test('a site is found by the identifier its entry carries', () => {
  const site = siteById('equilibrium');

  expect(site.host).toBe('equilibrium.cheminfo.org');
  expect(site.name).toStrictEqual({ lead: 'Equi', alt: 'Librium' });
});

test('an identifier belonging to nobody names itself in the error', () => {
  // A stored preference or a query parameter can carry an identifier that no
  // longer exists, and the message has to say which one.
  expect(() => siteById('chemcalc-legacy' as SiteId)).toThrow(
    'unknown ecosystem site: chemcalc-legacy',
  );
});

test('every site of the family is found by its own host', () => {
  for (const site of ECOSYSTEM_SITES) {
    expect(findSiteByHost(site.host)).toStrictEqual(site);
  }
});

test('a site no menu lists yet is still found by its identifier and its host', () => {
  expect(siteById('naturals').host).toBe('naturals.cheminfo.org');
  expect(siteById('molecules').host).toBe('molecules.cheminfo.org');
  expect(findSiteByHost('naturals.cheminfo.org')?.id).toBe('naturals');
  expect(findSiteByHost('www.molecules.cheminfo.org')?.id).toBe('molecules');
});

test('a site no menu lists yet is under no topic', () => {
  const listed = new Set<SiteId>();
  for (const { sites } of groupedSites()) {
    for (const site of sites) listed.add(site.id);
  }

  expect(listed.size).toBe(ECOSYSTEM_SITES.length);

  for (const site of UNLISTED_SITES) {
    expect(listed.has(site.id)).toBe(false);
  }
});

test('a port and a missing or added www. are the same host', () => {
  expect(findSiteByHost('surge.cheminfo.org:8080')?.id).toBe('surge');
  expect(findSiteByHost('www.surge.cheminfo.org')?.id).toBe('surge');
  expect(findSiteByHost('chemcalc.org')?.id).toBe('chemcalc');
  expect(findSiteByHost('WWW.ChemCalc.org:443')?.id).toBe('chemcalc');
  expect(findSiteByHost('  nmrium.org  ')?.id).toBe('nmrium');
});

test('a host belonging to nobody is not one of ours', () => {
  expect(findSiteByHost('localhost:5173')).toBeUndefined();
  expect(findSiteByHost('cheminfo.org')).toBeUndefined();
  expect(findSiteByHost('')).toBeUndefined();
  expect(findSiteByHost(':3000')).toBeUndefined();
});
