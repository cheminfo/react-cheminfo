import { expect, test } from 'vitest';

import { routeProblems } from '../../../seo/core/routeProblems.ts';
import {
  createSiteTalks,
  readTalkSources,
  talkIdFromPath,
} from '../siteTalks.ts';

const SOURCES = {
  '../../talks/20261201_rings.md': `---
title: Rings and the editor that draws them
description: Draw benzene, cyclohexane and their chairs on draw.cheminfo.org, then name the rings and copy the figure into a report.
date: 2026-12-01
---

# Rings

---

## A ring in one click
`,
  '../../talks/20261101_chains/index.md': '---\ntitle: Chains\n---\n\n# A',
};

test('a talk is named by its file, or by its folder', () => {
  const talks = readTalkSources({
    '../../talks/20261201_rings.md': '---\ntitle: Rings\n---\n\n# Rings',
    '../../talks/20261101_chains/index.md': '---\ntitle: Chains\n---\n\n# A',
  });

  expect(talks.map((talk) => [talk.id, talk.meta.title])).toStrictEqual([
    ['20261101_chains', 'Chains'],
    ['20261201_rings', 'Rings'],
  ]);
});

test('a deck path names its talk the way the build names it', () => {
  expect(talkIdFromPath('../../talks/20260824_IMSC.md')).toBe('20260824_IMSC');
  expect(talkIdFromPath('../talks/20260710_minY_algorithm/index.md')).toBe(
    '20260710_minY_algorithm',
  );
  expect(talkIdFromPath('index.md')).toBe('index');
});

test('a site lists its talks by id and finds one by name', () => {
  const talks = createSiteTalks({ site: 'draw', sources: SOURCES });

  expect(talks.list().map((talk) => talk.id)).toStrictEqual([
    '20261101_chains',
    '20261201_rings',
  ]);
  expect(talks.find('20261201_rings')?.slides).toHaveLength(2);
  expect(talks.find('nothing')).toBeUndefined();
});

test('every talk has the head of its own page, at the path the site plays it', () => {
  const { routes } = createSiteTalks({ site: 'draw', sources: SOURCES });

  expect(routes()).toStrictEqual([
    { path: '/talks/20261101_chains', title: 'Chains', description: 'Chains' },
    {
      path: '/talks/20261201_rings',
      title: 'Rings and the editor that draws them',
      description:
        'Draw benzene, cyclohexane and their chairs on draw.cheminfo.org, then name the rings and copy the figure into a report.',
    },
  ]);
  expect(routeProblems(routes().slice(1))).toStrictEqual([]);
});

test('a site that plays its decks elsewhere names that path', () => {
  const talks = createSiteTalks({
    site: 'pdb',
    sources: SOURCES,
    path: (id) => `/tutorials/${id}`,
  });

  expect(talks.routes().map((route) => route.path)).toStrictEqual([
    '/tutorials/20261101_chains',
    '/tutorials/20261201_rings',
  ]);
});

test('the manifest lists the talks in the shape the build publishes', () => {
  const { manifest } = createSiteTalks({ site: 'draw', sources: SOURCES });

  expect(manifest('http://localhost:11029')).toStrictEqual({
    site: 'draw',
    origin: 'http://localhost:11029',
    talks: [
      { id: '20261101_chains', title: 'Chains', slideCount: 1 },
      {
        id: '20261201_rings',
        title: 'Rings and the editor that draws them',
        date: '2026-12-01',
        slideCount: 2,
      },
    ],
  });
});
