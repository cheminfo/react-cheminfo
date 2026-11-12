import { expect, test } from 'vitest';

import {
  findSiteByHost,
  findSiteById,
  groupedSites,
  isSameSite,
  siteById,
} from '../lookup.ts';
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
  expect(siteById('molecules').host).toBe('molecules.cheminfo.org');
  expect(findSiteByHost('www.molecules.cheminfo.org')?.id).toBe('molecules');
  expect(siteById('mz').host).toBe('mz.cheminfo.org');
  expect(findSiteByHost('mz.cheminfo.org')?.id).toBe('mz');
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

test('chembio and wikidata are listed under research', () => {
  const research = groupedSites().find(({ group }) => group.id === 'research');
  const ids = research?.sites.map((site) => site.id);

  expect(ids).toContain('chembio');
  expect(ids).toContain('wikidata');
});

test('a port and a missing or added www. are the same host', () => {
  expect(findSiteByHost('isomers.cheminfo.org:8080')?.id).toBe('isomers');
  expect(findSiteByHost('www.isomers.cheminfo.org')?.id).toBe('isomers');
  expect(findSiteByHost('chemcalc.org')?.id).toBe('chemcalc');
  expect(findSiteByHost('WWW.ChemCalc.org:443')?.id).toBe('chemcalc');
  expect(findSiteByHost('  NMRium.cheminfo.org  ')?.id).toBe('nmrium');
});

test('a host belonging to nobody is not one of ours', () => {
  expect(findSiteByHost('localhost:5173')).toBeUndefined();
  expect(findSiteByHost('cheminfo.org')).toBeUndefined();
  expect(findSiteByHost('')).toBeUndefined();
  expect(findSiteByHost(':3000')).toBeUndefined();
});

test('a renamed site is found under the identifier and the host it left', () => {
  expect(findSiteById('tlc')?.id).toBe('plate');
  expect(findSiteById('plate')?.host).toBe('plate.cheminfo.org');
  expect(findSiteByHost('tlc.cheminfo.org')?.id).toBe('plate');
  expect(findSiteByHost('www.tlc.cheminfo.org:443')?.id).toBe('plate');
});

test('what a site saved under its former identifier is still its own', () => {
  expect(isSameSite('tlc', 'plate')).toBe(true);
  expect(isSameSite('plate', 'plate')).toBe(true);
  expect(isSameSite('draw', 'draw')).toBe(true);
  // The former name belongs to the site that left it, never the other way.
  expect(isSameSite('plate', 'tlc')).toBe(false);
  expect(isSameSite('tlc', 'draw')).toBe(false);
  expect(isSameSite('glassware', 'plate')).toBe(false);
});

test('no identifier or host is claimed by two sites', () => {
  const claimed = new Map<string, string>();
  for (const site of [...ECOSYSTEM_SITES, ...UNLISTED_SITES]) {
    for (const name of [site.id, ...(site.formerIds ?? [])]) {
      expect(claimed.get(`id:${name}`)).toBeUndefined();

      claimed.set(`id:${name}`, site.id);
    }
    for (const host of [site.host, ...(site.formerHosts ?? [])]) {
      expect(claimed.get(`host:${host}`)).toBeUndefined();

      claimed.set(`host:${host}`, site.id);
    }
  }

  expect(claimed.get('id:tlc')).toBe('plate');
});
