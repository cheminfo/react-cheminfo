import { expect, test } from 'vitest';

import { createExampleMark } from '../exampleMark.ts';

test('an example is as it opened until its document is replaced', () => {
  const mark = createExampleMark<{ pieces: number }>();
  const opened = { pieces: 3 };

  expect(mark.read(opened)).toStrictEqual({ example: null, changed: false });

  mark.mark('rc', opened);

  expect(mark.read(opened)).toStrictEqual({ example: 'rc', changed: false });

  const edited = { pieces: 4 };

  expect(mark.read(edited)).toStrictEqual({ example: 'rc', changed: true });
  // An undo puts the very document back, and it is the example again.
  expect(mark.read(opened)).toStrictEqual({ example: 'rc', changed: false });
});

test('a document opened from elsewhere is no example', () => {
  const mark = createExampleMark<object>();
  const example = {};
  mark.mark('lc', example);
  mark.clear();
  const file = {};

  expect(mark.read(file)).toStrictEqual({ example: null, changed: false });
  // An undo back past the file finds the example as it opened.
  expect(mark.read(example)).toStrictEqual({ example: 'lc', changed: false });
});

test('the example opened last is the one a change came from', () => {
  const mark = createExampleMark<object>();
  const first = {};
  const second = {};
  mark.mark('rc', first);
  mark.mark('lc', second);

  expect(mark.read({})).toStrictEqual({ example: 'lc', changed: true });
  expect(mark.read(first)).toStrictEqual({ example: 'rc', changed: false });
});
