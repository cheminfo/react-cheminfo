/**
 * The paper a visitor most likely prints on, read from the time zone first
 * and from the region of the browser's languages when the zone names no place.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { localPaper, paperFor } from '../localPaper.ts';
import { A4, US_LETTER } from '../pages.ts';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('the time zone says where the printer is, whatever the language', () => {
  expect(paperFor('Europe/Zurich', ['en-US'])).toBe(A4);
  expect(paperFor('America/New_York', ['en-US'])).toBe(US_LETTER);
  expect(paperFor('America/Toronto', ['fr-CA'])).toBe(US_LETTER);
  expect(paperFor('America/Mexico_City', ['es-MX'])).toBe(US_LETTER);
  expect(paperFor('Asia/Manila', ['en-US'])).toBe(US_LETTER);
  expect(paperFor('America/Sao_Paulo', ['pt-BR'])).toBe(A4);
  expect(paperFor('America/Argentina/Buenos_Aires', ['es-AR'])).toBe(A4);
  expect(paperFor('Asia/Shanghai', ['zh-CN'])).toBe(A4);
  expect(paperFor('America/New_York', ['fr-FR'])).toBe(US_LETTER);
});

test('the older names a browser may report for a zone are understood', () => {
  expect(paperFor('America/Indianapolis', [])).toBe(US_LETTER);
  expect(paperFor('America/Louisville', [])).toBe(US_LETTER);
  expect(paperFor('America/Montreal', [])).toBe(US_LETTER);
  expect(paperFor('Asia/Calcutta', [])).toBe(A4);
});

test('a zone naming no place leaves it to the region of the language', () => {
  expect(paperFor('UTC', ['en-US'])).toBe(US_LETTER);
  expect(paperFor('Etc/UTC', ['fr-CH', 'en-US'])).toBe(A4);
  expect(paperFor(undefined, ['es-MX'])).toBe(US_LETTER);
  expect(paperFor('Not/A_Zone', ['pt-BR'])).toBe(A4);
  expect(paperFor('UTC', ['en', 'es-MX'])).toBe(US_LETTER);
});

test('with no territory to go by, the paper is A4', () => {
  expect(paperFor('UTC', ['en', 'fr'])).toBe(A4);
  expect(paperFor(undefined, [])).toBe(A4);
  expect(paperFor('UTC', ['not a language'])).toBe(A4);
});

function zoneIs(timeZone: string): void {
  const options = new Intl.DateTimeFormat().resolvedOptions();
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
    ...options,
    timeZone,
  });
}

test('this browser prints where its clock and its languages say', () => {
  zoneIs('America/New_York');
  vi.stubGlobal('navigator', { languages: ['fr-CH'] });

  expect(localPaper()).toBe(US_LETTER);

  zoneIs('UTC');

  expect(localPaper()).toBe(A4);

  vi.stubGlobal('navigator', { languages: ['en-CA'] });

  expect(localPaper()).toBe(US_LETTER);
});

test('a runtime with no navigator goes by the clock alone', () => {
  zoneIs('UTC');
  vi.stubGlobal('navigator', undefined);

  expect(localPaper()).toBe(A4);

  zoneIs('America/Chicago');

  expect(localPaper()).toBe(US_LETTER);
});
