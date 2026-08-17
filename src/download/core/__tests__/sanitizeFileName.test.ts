import { expect, test } from 'vitest';

import { sanitizeFileName } from '../sanitizeFileName.ts';

test('a name that is already a file name is left alone', () => {
  expect(sanitizeFileName('structures.sdf')).toBe('structures.sdf');
});

test('a path cannot escape the folder the browser saves into', () => {
  expect(sanitizeFileName('../../etc/passwd')).toBe('etc-passwd');
  expect(sanitizeFileName(String.raw`C:\Windows\system32`)).toBe(
    'C-Windows-system32',
  );
});

test('control characters are dropped rather than saved into the name', () => {
  expect(sanitizeFileName('report\u0000\u001F\u007F.csv')).toBe('report.csv');
});

test('a newline in a pasted name collapses instead of splitting it', () => {
  expect(sanitizeFileName('two\nlines.txt')).toBe('two lines.txt');
  expect(sanitizeFileName('a\t lot\n\nof\tspace.txt')).toBe(
    'a lot of space.txt',
  );
});

test('the characters a file system reserves are removed', () => {
  expect(sanitizeFileName('a<b>c:d"e|f?g*h.txt')).toBe('abcdefgh.txt');
});

test('the name is not left hidden, relative, or trailing a dot', () => {
  expect(sanitizeFileName('.hidden')).toBe('hidden');
  expect(sanitizeFileName('trailing...')).toBe('trailing');
  expect(sanitizeFileName('  padded.txt  ')).toBe('padded.txt');
});

test('a name with nothing usable left falls back', () => {
  expect(sanitizeFileName('')).toBe('download');
  expect(sanitizeFileName(' '.repeat(3))).toBe('download');
  expect(sanitizeFileName('///')).toBe('download');
  expect(sanitizeFileName('?*', 'molecule')).toBe('molecule');
});

test('a name in another script keeps its letters', () => {
  expect(sanitizeFileName('éthanol — données.csv')).toBe(
    'éthanol — données.csv',
  );
});
