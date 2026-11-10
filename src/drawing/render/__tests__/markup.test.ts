/**
 * Writing SVG: numbers kept to two decimals, path data, and text escaped for
 * XML and read back.
 */

import { expect, test } from 'vitest';

import { Pen } from '../contour.ts';
import {
  ellipsePath,
  escapeAttribute,
  escapeText,
  number,
  pathData,
  pointText,
  unescapeXml,
} from '../markup.ts';

test('a number is written with two decimals at most, and never as -0', () => {
  expect(number(3.14159)).toBe('3.14');
  expect(number(2.5)).toBe('2.5');
  expect(number(10)).toBe('10');
  expect(number(-7.126)).toBe('-7.13');
  expect(number(-0.001)).toBe('0');
  expect(pointText({ x: 1.234, y: -5.678 })).toBe('1.23 -5.68');
});

test('an outline is written as moves, lines and cubics, closed or not', () => {
  const pen = () => new Pen(0, 0).line(10, 0).curve(10, 5.555, 5, 10, 0, 10);

  expect(pathData(pen().close())).toBe('M0 0L10 0C10 5.56 5 10 0 10Z');
  expect(pathData(pen().open())).toBe('M0 0L10 0C10 5.56 5 10 0 10');
  expect(pathData(new Pen(1, 2).open())).toBe('M1 2');
});

test('an ellipse is two half turns between the ends of one axis', () => {
  expect(ellipsePath({ x: 0, y: 0 }, { x: 10, y: 0 }, 5, 2)).toBe(
    'M0 0A5 2 0 1 0 10 0A5 2 0 1 0 0 0Z',
  );
  expect(ellipsePath({ x: 1, y: 1 }, { x: 9, y: 7 }, 5, 1.5, 36.87)).toBe(
    'M1 1A5 1.5 36.87 1 0 9 7A5 1.5 36.87 1 0 1 1Z',
  );
});

test('element text escapes the markup characters and drops what XML forbids', () => {
  expect(escapeText('a < b & c > d "e"')).toBe('a &lt; b &amp; c &gt; d "e"');
  expect(escapeText('tab\tline\ncarriage\r')).toBe('tab\tline\ncarriage\r');
  expect(escapeText('a\u0000b\u0007c\u000Bd\u000Ce\u001Ff￾g￿h')).toBe(
    'abcdefgh',
  );
  // Half a surrogate pair alone is dropped, a whole pair is kept.
  expect(escapeText('x\uD800y\uDC00z😀')).toBe('xyz😀');
  expect(escapeText('\u007F\u0085 ')).toBe('\u007F\u0085 ');
});

test('an attribute keeps its line ends and tabs as references', () => {
  expect(escapeAttribute('say "hi"\r\nnext\tcell')).toBe(
    'say &quot;hi&quot;&#13;&#10;next&#9;cell',
  );
  expect(escapeAttribute('x\u0002y <z>')).toBe('xy &lt;z&gt;');
});

test('escaped text reads back as it was, and &nbsp; as a no-break space', () => {
  expect(unescapeXml('&lt;a&gt; &amp;amp; &quot;&apos; &#10;&#x41;&#65;')).toBe(
    `<a> &amp; "' \nAA`,
  );
  expect(unescapeXml('80&nbsp;°C')).toBe('80 °C');
  expect(unescapeXml('&LT;&#X42;&unknown;')).toBe('<B&unknown;');

  const text = 'a "b"\n\tc & <d>\r';

  expect(unescapeXml(escapeAttribute(text))).toBe(text);
  expect(unescapeXml(escapeText(text))).toBe(text);
});
