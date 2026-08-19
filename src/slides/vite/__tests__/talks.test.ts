import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { loadTalksFromDisk } from '../talks.ts';

const TALK = `---
title: Peaks are not molecules
event: IMSC 2026
date: 2026-08-24
---

# Peaks are not molecules

---

An adduct is a choice.
`;

function talksDirectory(): string {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-talks-'));
  writeFileSync(join(root, '20260824_IMSC.md'), TALK);
  mkdirSync(join(root, 'minY_algorithm'));
  writeFileSync(
    join(root, 'minY_algorithm', 'index.md'),
    '---\ntitle: minY\n---\n\n# minY\n',
  );
  // A folder without an index.md is companion material, not a talk.
  mkdirSync(join(root, 'assets'));
  writeFileSync(join(root, 'assets', 'bench.mjs'), 'export const x = 1;\n');
  return root;
}

test('a talk is a file or a folder holding index.md, and nothing else', () => {
  const talks = loadTalksFromDisk(talksDirectory());

  expect(talks.map((talk) => talk.id)).toStrictEqual([
    '20260824_IMSC',
    'minY_algorithm',
  ]);
  expect(talks[0]?.talk.meta.title).toBe('Peaks are not molecules');
  expect(talks[0]?.talk.meta.event).toBe('IMSC 2026');
  expect(talks[0]?.talk.slides).toHaveLength(2);
  expect(talks[1]?.talk.meta.title).toBe('minY');
});

test('the source is published as written, so another site can play it', () => {
  const talks = loadTalksFromDisk(talksDirectory());

  expect(talks[0]?.source).toBe(TALK);
});

test('a site with no talks directory still builds', () => {
  expect(
    loadTalksFromDisk(join(tmpdir(), 'cheminfo-talks-absent')),
  ).toStrictEqual([]);
});
