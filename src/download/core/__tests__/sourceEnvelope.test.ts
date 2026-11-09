import { expect, test } from 'vitest';

import {
  HTML_SOURCE_ID,
  readHtmlSource,
  readSourceEnvelope,
  sourceEnvelope,
  withHtmlSource,
} from '../sourceEnvelope.ts';

const PAGE =
  '<!doctype html>\n<html lang="en">\n<head>\n<title>Notes</title>\n</head>\n<body><p>Text</p></body>\n</html>\n';

const RECORD = {
  site: 'write',
  generator: 'write.cheminfo.org 1.2.0',
  data: { version: 1, value: { title: 'Notes', end: '</script><b>' } },
  preferences: { version: 1, value: { ruler: true } },
};

test('the envelope says what it is, and leaves out what is not said', () => {
  expect(sourceEnvelope(RECORD)).toStrictEqual({
    format: 'cheminfo',
    version: 2,
    site: 'write',
    generator: 'write.cheminfo.org 1.2.0',
    data: RECORD.data,
    preferences: RECORD.preferences,
  });
});

test('an HTML page carries the envelope closing its head, safe inside the script', () => {
  const html = withHtmlSource(PAGE, RECORD);

  expect(html).toContain(
    `<script type="application/json" id="${HTML_SOURCE_ID}">{"format":"cheminfo","version":2,`,
  );
  // Only the envelope's own script closes: the value's `</script>` is escaped.
  expect(html.match(/<\/script>/g)).toHaveLength(1);
  expect(html.indexOf(HTML_SOURCE_ID)).toBeLessThan(html.indexOf('</head>'));
  expect(readHtmlSource(html, 'write')).toStrictEqual(RECORD);
  expect(withHtmlSource(html, { site: 'write' })).toBe(
    withHtmlSource(PAGE, { site: 'write' }),
  );
});

test('another site, another format or version, and a part that does not read are none', () => {
  const html = withHtmlSource(PAGE, RECORD);

  expect(readHtmlSource(html, 'draw')).toBeUndefined();
  expect(readHtmlSource(PAGE)).toBeUndefined();
  expect(
    readSourceEnvelope({ format: 'cheminfo-write', version: 1, site: 'write' }),
  ).toBeUndefined();
  expect(
    readSourceEnvelope({ format: 'cheminfo', version: 1, site: 'write' }),
  ).toBeUndefined();
  expect(
    readSourceEnvelope({
      format: 'cheminfo',
      version: 2,
      site: 'write',
      data: { version: 0, value: {} },
      view: { version: 2 },
      preferences: { version: 1, value: null },
    }),
  ).toStrictEqual({
    site: 'write',
    preferences: { version: 1, value: null },
  });
});
