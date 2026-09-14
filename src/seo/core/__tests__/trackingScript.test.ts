import { expect, test } from 'vitest';

import { injectTrackingScript } from '../trackingScript.ts';

const PAGE = '<html><head><title>t</title></head><body></body></html>';
const SNIPPET =
  '<script defer src="https://stats.example.org/s.js" data-website-id="a&b"></script>';

test('the snippet goes at the end of the head, taken verbatim', () => {
  expect(injectTrackingScript(PAGE, SNIPPET)).toBe(
    `<html><head><title>t</title>${SNIPPET}\n</head><body></body></html>`,
  );
  expect(injectTrackingScript(PAGE, `\n  ${SNIPPET}  \n`)).toBe(
    injectTrackingScript(PAGE, SNIPPET),
  );
});

test('an unset or blank snippet leaves the page as it was built', () => {
  expect(injectTrackingScript(PAGE)).toBe(PAGE);
  expect(injectTrackingScript(PAGE, null)).toBe(PAGE);
  expect(injectTrackingScript(PAGE, '')).toBe(PAGE);
  expect(injectTrackingScript(PAGE, ' '.repeat(3))).toBe(PAGE);
});

test('injecting twice carries the snippet once', () => {
  const once = injectTrackingScript(PAGE, SNIPPET);

  expect(injectTrackingScript(once, SNIPPET)).toBe(once);
});

test('the first closing head is the one, whatever its case', () => {
  expect(
    injectTrackingScript(
      '<HEAD></HEAD><body><script>"</head>"</script></body>',
      SNIPPET,
    ),
  ).toBe(`<HEAD>${SNIPPET}\n</HEAD><body><script>"</head>"</script></body>`);
});

test('a page without a head gets the snippet at its end', () => {
  expect(injectTrackingScript('<p>hello</p>', SNIPPET)).toBe(
    `<p>hello</p>\n${SNIPPET}\n`,
  );
});
