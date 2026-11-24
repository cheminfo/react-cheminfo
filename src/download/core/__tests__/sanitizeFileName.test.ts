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

test('a time keeps its digits once its colon is gone', () => {
  expect(sanitizeFileName('Caffeine, 16 Nov 2026, 07:01')).toBe(
    'Caffeine, 16 Nov 2026, 0701',
  );
});

test('the invisible marks Chrome refuses in a file name are dropped', () => {
  expect(sanitizeFileName('soft­hyphen​zero‍width‮.txt')).toBe(
    'softhyphenzerowidth.txt',
  );
});

test('a device Windows reserves is not the name of a file', () => {
  expect(sanitizeFileName('CON')).toBe('CON_');
  expect(sanitizeFileName('nul.txt')).toBe('nul_.txt');
  expect(sanitizeFileName('lpt1.write.html')).toBe('lpt1_.write.html');
  expect(sanitizeFileName('console.txt')).toBe('console.txt');
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
