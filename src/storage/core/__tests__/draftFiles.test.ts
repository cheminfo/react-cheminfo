import { expect, test } from 'vitest';

import {
  DRAFT_LIMIT,
  draftsToForget,
  duplicateDrafts,
  isSavedAsIs,
} from '../draftFiles.ts';

// The most recently changed first, as the store lists them.
const DRAFTS = [
  { id: 'new' },
  { id: 'saved-changed', file: { modified: true } },
  { id: 'saved-as-is', file: { modified: false } },
  { id: 'older' },
  { id: 'oldest' },
];

test('a site keeps 20 drafts unless it says otherwise', () => {
  expect(DRAFT_LIMIT).toBe(20);
});

test('a saved document left as it is goes first, then the oldest unsaved work', () => {
  expect(draftsToForget(DRAFTS, new Set(), 4)).toStrictEqual(['saved-as-is']);
  expect(draftsToForget(DRAFTS, new Set(), 3)).toStrictEqual([
    'saved-as-is',
    'oldest',
  ]);
});

test('a draft a tab holds is never forgotten', () => {
  expect(draftsToForget(DRAFTS, new Set(['saved-as-is']), 4)).toStrictEqual([
    'oldest',
  ]);
  expect(draftsToForget(DRAFTS, new Set(), 5)).toStrictEqual([]);
});

test('only a draft whose file holds it unchanged is saved as it is', () => {
  expect(DRAFTS.map((draft) => isSavedAsIs(draft))).toStrictEqual([
    false,
    false,
    true,
    false,
    false,
  ]);
});

// The most recently changed first, as the store lists them.
const COPIES = [
  { id: 'screen', document: { items: ['a'] } },
  { id: 'recent-a', document: { items: ['a'] } },
  { id: 'b', document: { items: ['b'] } },
  { id: 'older-a', document: { items: ['a'] } },
  { id: 'older-b', document: { items: ['b'] } },
  { id: 'saved-a', document: { items: ['a'] }, file: { name: 'a.tex.svg' } },
];

test('a document is kept once: the draft that stays, else the most recent copy', () => {
  expect(duplicateDrafts(COPIES, new Set(['screen']))).toStrictEqual([
    'recent-a',
    'older-a',
    'older-b',
  ]);
  expect(duplicateDrafts(COPIES, new Set())).toStrictEqual([
    'recent-a',
    'older-a',
    'older-b',
  ]);
});

test('a copy a tab holds is never forgotten, and keeps its document', () => {
  expect(duplicateDrafts(COPIES, new Set(['older-a', 'b']))).toStrictEqual([
    'screen',
    'recent-a',
    'older-b',
  ]);
});
