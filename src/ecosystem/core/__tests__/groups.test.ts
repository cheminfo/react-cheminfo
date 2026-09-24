import { expect, test } from 'vitest';

import type { SiteGroupId } from '../groups.ts';
import { SITE_GROUPS } from '../groups.ts';
import { groupedSites, sitesInGroup } from '../lookup.ts';
import { ECOSYSTEM_SITES } from '../sites.ts';

test('the family is gathered under six topics, in a deliberate order', () => {
  const ids = SITE_GROUPS.map((group) => group.id);

  expect(ids).toStrictEqual([
    'basics',
    'practice',
    'structures',
    'spectra',
    'research',
    'computing',
  ] satisfies SiteGroupId[]);
});

test('every site names a topic, and no topic is left empty', () => {
  const groupIds = new Set<SiteGroupId>(SITE_GROUPS.map((group) => group.id));
  for (const site of ECOSYSTEM_SITES) {
    expect({ site: site.id, named: groupIds.has(site.group) }).toStrictEqual({
      site: site.id,
      named: true,
    });
  }

  for (const group of SITE_GROUPS) {
    expect(sitesInGroup(group.id).length).toBeGreaterThan(0);
  }
});

test('the topics between them hold every site, each exactly once', () => {
  const gathered = groupedSites().flatMap(({ sites }) => sites);

  expect(gathered).toHaveLength(ECOSYSTEM_SITES.length);
  expect(new Set(gathered.map((site) => site.id)).size).toBe(
    ECOSYSTEM_SITES.length,
  );
});

test('the tools a course opens with are the ones under the basics', () => {
  expect(sitesInGroup('basics').map((site) => site.id)).toStrictEqual([
    'chemcalc',
    'dbe',
    'lcao',
    'equilibrium',
    'periodic-table',
    'symmetry',
  ]);
  expect(sitesInGroup('practice').map((site) => site.id)).toStrictEqual([
    'atoms',
    'moles',
    'inorganic',
  ]);
  expect(sitesInGroup('spectra').map((site) => site.id)).toStrictEqual([
    'nmrium',
    'metabo',
    'derepflow',
    'elucidation',
  ]);
  expect(sitesInGroup('computing').map((site) => site.id)).toStrictEqual([
    'learn',
    'tex',
    'regexp',
  ]);
});

test('no topic is so large that its heading stops helping', () => {
  // Six is where a column of tiles stops being read as a group and starts
  // being read as a list again; a topic past it is two topics.
  for (const { group, sites } of groupedSites()) {
    expect({ group: group.id, tooMany: sites.length > 6 }).toStrictEqual({
      group: group.id,
      tooMany: false,
    });
  }
});
