// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { catalogTranslate } from '../../../i18n/core/translate.ts';
import { hideClipboardNotice } from '../../core/showClipboardNotice.ts';
import {
  announceCopy,
  announceCopyFailure,
  copiedText,
} from '../announceCopy.ts';

const t = catalogTranslate(CHROME_CATALOG, 'en');

afterEach(() => {
  hideClipboardNotice();
});

test('a copy that worked says what was copied, in green', () => {
  announceCopy('copied', t, copiedText('C=CC=O', t));

  expect(notice()).toStrictEqual({
    className: 'clipboard-notice no-print',
    role: 'status',
    text: 'Copied: C=CC=O',
    close: null,
  });
});

test('a value too long or over several lines is not repeated', () => {
  expect(copiedText('a'.repeat(61), t)).toBe('Copied to the clipboard.');
  expect(copiedText('a\tb\nc\td', t)).toBe('Copied to the clipboard.');
  expect(copiedText({ text: '  CCO ', html: '<b>CCO</b>' }, t)).toBe(
    'Copied: CCO',
  );
  expect(copiedText('', t)).toBe('Copied to the clipboard.');
});

test('an SVG copied as text says which browsers copy the picture, in orange', () => {
  announceCopy('copiedAsText', t);

  expect(notice()).toStrictEqual({
    className: 'clipboard-notice clipboard-notice--warning no-print',
    role: 'alert',
    text: 'Copied as SVG text: this browser cannot copy an SVG picture. Chrome and Edge can.',
    close: 'Close',
  });
});

test('a browser copying no picture names the ones that do, in orange', () => {
  announceCopy('unsupported', t);

  expect(notice()).toStrictEqual({
    className: 'clipboard-notice clipboard-notice--warning no-print',
    role: 'alert',
    text: 'This browser cannot copy a picture. Save it instead, or use a recent Chrome, Edge, Firefox or Safari.',
    close: 'Close',
  });
});

test('a refused copy and a painting error are red', () => {
  announceCopy('refused', t);

  expect(notice()).toStrictEqual({
    className: 'clipboard-notice clipboard-notice--error no-print',
    role: 'alert',
    text: 'The browser refused the clipboard, so nothing was copied. Click in the page and copy again.',
    close: 'Close',
  });

  announceCopyFailure(new Error('The canvas is tainted.'), t);

  expect(notice()).toStrictEqual({
    className: 'clipboard-notice clipboard-notice--error no-print',
    role: 'alert',
    text: 'The canvas is tainted.',
    close: 'Close',
  });
});

function notice() {
  const shown = document.querySelectorAll('.clipboard-notice');

  expect(shown).toHaveLength(1);

  const element = shown[0] as HTMLElement;
  return {
    className: element.className,
    role: element.getAttribute('role'),
    text: element.textContent,
    close:
      element
        .querySelector('.clipboard-notice__close')
        ?.getAttribute('aria-label') ?? null,
  };
}
