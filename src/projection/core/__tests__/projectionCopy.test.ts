import { expect, test } from 'vitest';

import {
  PROJECTION_COPY,
  fillCopy,
  mergeProjectionCopy,
} from '../projectionCopy.ts';
import { DEFAULT_PROJECTION_OPTIONS } from '../projectionOptions.ts';

test('the word reconstructed appears nowhere in the copy', () => {
  expect(pathsMatching(/reconstructed/i)).toStrictEqual([]);
});

test('the copy never says variance outside the help for spread', () => {
  const paths = pathsMatching(/variance/i).filter(
    (path) => !path.startsWith('help.spread.'),
  );

  expect(paths).toStrictEqual([]);
});

test('the quantity a component carries a share of is named in plain words', () => {
  expect(PROJECTION_COPY.intro.shares).toBe(
    'Every component accounts for a share of the differences between your samples, largest first. The first few usually account for most of them.',
  );
  expect(PROJECTION_COPY.help.spread.body).toBe(
    'How far along the component the average sample is pushed. Two standard deviations reaches past most of your samples in both directions.',
  );
});

test('every option has help, in the order the options are declared', () => {
  expect(Object.keys(PROJECTION_COPY.help)).toStrictEqual(
    Object.keys(DEFAULT_PROJECTION_OPTIONS),
  );
});

test('every piece of help has a title and a body', () => {
  const empty: string[] = [];
  for (const [id, help] of Object.entries(PROJECTION_COPY.help)) {
    if (help.title.length === 0 || help.body.length === 0) empty.push(id);
  }

  expect(empty).toStrictEqual([]);
});

test('no sentence in the copy is empty', () => {
  const empty: string[] = [];
  for (const [path, text] of copyStrings()) {
    if (text.trim().length === 0) empty.push(path);
  }

  expect(empty).toStrictEqual([]);
});

test('the tabs are named for what they answer', () => {
  expect(PROJECTION_COPY.tab).toStrictEqual({
    map: 'Map',
    pairs: 'Every pair',
    variables: 'What differs',
    shares: 'How much each explains',
  });
});

test('an override of one sentence keeps every other default', () => {
  const copy = mergeProjectionCopy({ tab: { map: 'Overview' } });

  expect(copy.tab.map).toBe('Overview');
  expect(copy.tab.pairs).toBe('Every pair');
  expect(copy.intro.map).toBe(PROJECTION_COPY.intro.map);
  expect(copy.help.spread).toStrictEqual(PROJECTION_COPY.help.spread);
});

test('an override reaches into the help without dropping its example', () => {
  const copy = mergeProjectionCopy({
    help: { ellipse: { title: 'Outlines' } },
  });

  expect(copy.help.ellipse.title).toBe('Outlines');
  expect(copy.help.ellipse.example).toStrictEqual({
    code: '95% of samples',
    note: 'Two standard deviations is often assumed to mean 95%. On a map it covers 86%, which is why the choices here are written as shares.',
  });
});

test('overriding nothing leaves the copy untouched', () => {
  expect(mergeProjectionCopy()).toStrictEqual(PROJECTION_COPY);
  expect(mergeProjectionCopy({})).toStrictEqual(PROJECTION_COPY);
  expect(PROJECTION_COPY.tab.map).toBe('Map');
});

test('a merge does not write into the defaults', () => {
  const copy = mergeProjectionCopy({ words: { sample: 'spectrum' } });

  expect(copy.words.sample).toBe('spectrum');
  expect(PROJECTION_COPY.words.sample).toBe('sample');
});

test('fillCopy replaces every placeholder it has a value for', () => {
  expect(fillCopy('{count} of {total}', { count: '31', total: '150' })).toBe(
    '31 of 150',
  );
  expect(
    fillCopy(PROJECTION_COPY.sentence.selection, {
      count: '31',
      total: '150',
    }),
  ).toBe('31 of 150 samples selected.');
});

test('a placeholder with no value is left in place', () => {
  expect(fillCopy('{a} {b}', { a: 'x' })).toBe('x {b}');
  expect(fillCopy('nothing to fill', {})).toBe('nothing to fill');
});

function pathsMatching(pattern: RegExp): string[] {
  const matches: string[] = [];
  for (const [path, text] of copyStrings()) {
    if (pattern.test(text)) matches.push(path);
  }
  return matches;
}

function copyStrings(): Array<[string, string]> {
  const found: Array<[string, string]> = [];
  collect(PROJECTION_COPY as unknown as Record<string, unknown>, '', found);
  return found;
}

function collect(
  branch: Record<string, unknown>,
  prefix: string,
  found: Array<[string, string]>,
): void {
  for (const [key, value] of Object.entries(branch)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (typeof value === 'string') {
      found.push([path, value]);
    } else if (typeof value === 'object' && value !== null) {
      collect(value as Record<string, unknown>, path, found);
    }
  }
}
