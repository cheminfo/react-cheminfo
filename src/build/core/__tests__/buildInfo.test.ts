import { expect, test } from 'vitest';

import {
  UNRELEASED_VERSION,
  buildLabel,
  buildStamp,
  buildSummary,
  formatBuiltAt,
  releasedVersion,
  shortCommit,
} from '../buildInfo.ts';
import { BUILD_INFO } from '../current.ts';

test('a commit is written the way git writes it', () => {
  expect(shortCommit('a1b2c3d4e5f60718293a4b5c6d7e8f9012345678')).toBe(
    'a1b2c3d',
  );
});

test('the build instant is read as a day and a time, in UTC', () => {
  expect(formatBuiltAt('2026-09-16T09:41:07Z')).toBe('2026-09-16 09:41:07 UTC');
});

test('a build nothing filled in leaves the About line out', () => {
  expect(BUILD_INFO).toBeUndefined();
});

test('a version worth showing is one that names a release', () => {
  expect(
    releasedVersion({ version: '2.4.0', builtAt: '2026-09-16T09:41:07Z' }),
  ).toBe('2.4.0');
});

test('a site that has never been released has no version to show', () => {
  expect(
    releasedVersion({
      version: UNRELEASED_VERSION,
      builtAt: '2026-09-16T09:41:07Z',
    }),
  ).toBeUndefined();
  expect(releasedVersion(undefined)).toBeUndefined();
});

test('the unreleased version is the one a scaffolded package.json carries', () => {
  expect(UNRELEASED_VERSION).toBe('0.0.0');
});

test('a released build is named by its version', () => {
  expect(
    buildLabel({
      version: '2.4.0',
      builtAt: '2026-09-16T09:41:07Z',
      commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    }),
  ).toBe('2.4.0');
});

test('an unreleased build is named by the commit it was made from', () => {
  expect(
    buildLabel({
      version: UNRELEASED_VERSION,
      builtAt: '2026-09-16T09:41:07Z',
      commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    }),
  ).toBe('a1b2c3d');
});

test('a build with neither a release nor a commit is named by nothing', () => {
  expect(
    buildLabel({
      version: UNRELEASED_VERSION,
      builtAt: '2026-09-16T09:41:07Z',
    }),
  ).toBeUndefined();
  expect(buildLabel(undefined)).toBeUndefined();
});

test('the summary is the whole record in one line', () => {
  expect(
    buildSummary({
      version: '2.4.0',
      builtAt: '2026-09-16T09:41:07Z',
      commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    }),
  ).toBe('Built 2026-09-16 09:41:07 UTC from commit a1b2c3d');
  expect(
    buildSummary({ version: '2.4.0', builtAt: '2026-09-16T09:41:07Z' }),
  ).toBe('Built 2026-09-16 09:41:07 UTC');
});

test('the badge dates a build to the minute, in UTC', () => {
  expect(buildStamp('2026-09-16T09:41:07Z')).toBe('2026-09-16 09:41 UTC');
});
