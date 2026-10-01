import { expect, test } from 'vitest';

import { splitProse } from '../prose.ts';

test('a paragraph with no placeholder is one piece of text', () => {
  expect(splitProse('Nothing to cut here.', ['tool'])).toStrictEqual([
    { kind: 'text', at: 0, text: 'Nothing to cut here.' },
  ]);
});

test('a named placeholder is cut out, and the offsets are the keys', () => {
  expect(splitProse('Open {tool} to see it.', ['tool'])).toStrictEqual([
    { kind: 'text', at: 0, text: 'Open ' },
    { kind: 'node', at: 5, name: 'tool' },
    { kind: 'text', at: 11, text: ' to see it.' },
  ]);
});

test('two placeholders side by side leave no empty text between them', () => {
  expect(splitProse('{first}{second}', ['first', 'second'])).toStrictEqual([
    { kind: 'node', at: 0, name: 'first' },
    { kind: 'node', at: 7, name: 'second' },
  ]);
});

test('a placeholder nobody named stays in the prose', () => {
  expect(splitProse('Seen {count} times in {tool}.', ['tool'])).toStrictEqual([
    { kind: 'text', at: 0, text: 'Seen {count} times in ' },
    { kind: 'node', at: 22, name: 'tool' },
    { kind: 'text', at: 28, text: '.' },
  ]);
});

test('a placeholder the sentence opens and closes on makes two nodes only', () => {
  expect(splitProse('{tool}', ['tool'])).toStrictEqual([
    { kind: 'node', at: 0, name: 'tool' },
  ]);
});
