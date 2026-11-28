import { expect, test } from 'vitest';

import type { XmlElement } from '../xmlTree.ts';
import {
  attributeOf,
  childrenOf,
  descendantsOf,
  readXmlTree,
} from '../xmlTree.ts';

const FIRST = 'https://example.org/first';
const SECOND = 'https://example.org/second';

function rootOf(text: string): XmlElement {
  const root = readXmlTree(text);
  if (!root) throw new Error('The text holds no element.');
  return root;
}

function firstChild(parent: XmlElement, name: string): XmlElement {
  const [child] = childrenOf(parent, name);
  if (!child) throw new Error(`The element holds no ${name}.`);
  return child;
}

test('a name is in the namespace its prefix is bound to where it stands', () => {
  const root = rootOf(
    `<a:root xmlns:a="${FIRST}" xmlns="${SECOND}"><a:item id="1"/><item id="2"/><b:item id="3" xmlns:b="${FIRST}"/><item id="4" xmlns=""/><a:item id="5" xmlns:a="${SECOND}"/><c:item id="6"/></a:root>`,
  );

  expect(root.localName).toBe('root');
  expect(root.namespace).toBe(FIRST);

  const items = descendantsOf(root);

  expect(items.map(({ localName }) => localName)).toStrictEqual(
    Array.from({ length: 6 }, () => 'item'),
  );
  expect(
    Object.fromEntries(
      items.map(({ attributes, namespace }) => [attributes.id, namespace]),
    ),
  ).toStrictEqual({
    1: FIRST,
    2: SECOND,
    3: FIRST,
    4: '',
    5: SECOND,
    6: '',
  });
});

test('an attribute is found by its namespace and its local name', () => {
  const root = rootOf(
    `<svg xmlns="${SECOND}" xmlns:cd="${FIRST}" cd:version="2" version="1.1"><g xmlns:draw="${FIRST}" draw:picture="i1" href="a" x:href="b"/></svg>`,
  );

  expect(attributeOf(root, FIRST, 'version')).toBe('2');
  // An attribute without a prefix is in no namespace, whatever the default.
  expect(attributeOf(root, '', 'version')).toBe('1.1');
  expect(attributeOf(root, SECOND, 'version')).toBeUndefined();
  expect(attributeOf(root, '', 'cd')).toBeUndefined();

  const group = firstChild(root, 'g');

  expect(attributeOf(group, FIRST, 'picture')).toBe('i1');
  expect(attributeOf(group, '', 'href')).toBe('a');
  // A prefix bound nowhere names no namespace.
  expect(attributeOf(group, FIRST, 'href')).toBeUndefined();
});

test('text is read with its entities decoded and its CDATA as written', () => {
  const root = rootOf(
    '<doc a="x &amp; &quot;y&quot; &#x41;&nbsp;"><t>&lt;b&gt; &amp;amp; &#65;&#10;80&nbsp;°C</t><c> <![CDATA[{"a": "x &amp; <y>"}]]> </c><d><![CDATA[a]]]]><![CDATA[>b]]></d></doc>',
  );

  expect(root.attributes).toStrictEqual({ a: 'x & "y" A ' });
  expect(childrenOf(root, 't')[0]?.text).toBe('<b> &amp; A\n80 °C');
  expect(childrenOf(root, 'c')[0]?.text).toBe('  {"a": "x &amp; <y>"}');
  expect(childrenOf(root, 'd')[0]?.text).toBe('a]]>b');
});

test('every line end is read as a line feed, and as a space in an attribute', () => {
  const root = rootOf(
    '<doc a="one\r\ntwo\rthree\tfour" b="five&#10;six&#13;seven"><t>one\r\ntwo\rthree&#13;</t></doc>',
  );

  expect(root.attributes).toStrictEqual({
    a: 'one two three four',
    b: 'five\nsix\rseven',
  });
  expect(childrenOf(root, 't')[0]?.text).toBe('one\ntwo\nthree\r');
});

test('the root comes after the declaration, comments and doctype', () => {
  const root = rootOf(
    '﻿<?xml version="1.0"?>\n<!-- <other/> -->\n<!DOCTYPE CDXML>\n<CDXML><page id="1"/><page id="2"/></CDXML>\n',
  );

  expect(root.localName).toBe('CDXML');
  expect(
    childrenOf(root, 'page').map(({ attributes }) => attributes.id),
  ).toStrictEqual(['1', '2']);
  expect(readXmlTree('CCO')).toBeUndefined();
  expect(() => readXmlTree('<doc><!-- cut short')).toThrow(
    'Comment is not closed.',
  );
});
