import { expect, test } from 'vitest';

import { parseTalk } from '../talk.ts';

const TALK = `---
title: ChemCalc in Action
subtitle: From formula to spectrum
event: SGMS 2026
date: 2026-06-17
location: Beatenberg
author: Luc Patiny
---

<!-- layout: title -->

# ChemCalc
## From formula to spectrum

---

## Monoisotopic mass

- Built from the most abundant isotope
- The anchor of high-resolution MS

[Try 300.123](/mf-finder?targetMass=300.123)

---

<!-- layout: papers -->
# Further reading

---

<!-- layout: thanks -->
# Thank you
`;

test('reads every front-matter key it knows', () => {
  expect(parseTalk(TALK).meta).toStrictEqual({
    title: 'ChemCalc in Action',
    subtitle: 'From formula to spectrum',
    event: 'SGMS 2026',
    date: '2026-06-17',
    location: 'Beatenberg',
    author: 'Luc Patiny',
  });
});

test('a single logo becomes a one-element array', () => {
  expect(
    parseTalk('---\ntitle: T\nlogos: /images/epfl.svg\n---\n').meta.logos,
  ).toStrictEqual(['/images/epfl.svg']);
});

test('comma-separated logos become an array', () => {
  const { meta } = parseTalk(
    '---\ntitle: T\nlogos: /images/epfl.svg, /images/zakodium.png\n---\n',
  );

  expect(meta.logos).toStrictEqual([
    '/images/epfl.svg',
    '/images/zakodium.png',
  ]);
});

test('a front-matter key nobody knows is ignored', () => {
  expect(parseTalk('---\ntitle: T\nsponsor: Nobody\n---\n').meta).toStrictEqual(
    {
      title: 'T',
    },
  );
});

test('a source with no front-matter is all slides', () => {
  const { meta, slides } = parseTalk('# A\n\n---\n\n# B');

  expect(meta).toStrictEqual({ title: '' });
  expect(slides).toHaveLength(2);
});

test('splits into slides carrying the layout each names', () => {
  const { slides } = parseTalk(TALK);

  expect(slides).toHaveLength(4);
  expect(slides.map((slide) => slide.layout)).toStrictEqual([
    'title',
    'content',
    'papers',
    'thanks',
  ]);
});

test('the layout marker is stripped from the body', () => {
  const { slides } = parseTalk(TALK);

  expect(slides[0]).toStrictEqual({
    layout: 'title',
    body: '# ChemCalc\n## From formula to spectrum',
  });
  expect(slides[3]?.body).toBe('# Thank you');
});

test('a demo link stays inside the slide body', () => {
  expect(parseTalk(TALK).slides[1]?.body).toContain(
    '[Try 300.123](/mf-finder?targetMass=300.123)',
  );
});

test('a layout name the parser never heard of is taken as written', () => {
  expect(
    parseTalk('<!-- layout: octochemdb -->\n\n## Nine requests').slides,
  ).toStrictEqual([{ layout: 'octochemdb', body: '## Nine requests' }]);
});

test('a hyphenated layout name survives, lowercased', () => {
  expect(
    parseTalk('<!-- layout: Paper-Abstract -->\n# X').slides[0]?.layout,
  ).toBe('paper-abstract');
});

test('a heading-only slide is a title slide', () => {
  const { slides } = parseTalk('# Only a heading\n## and a subheading');

  expect(slides).toHaveLength(1);
  expect(slides[0]?.layout).toBe('title');
});

test('a slide with bullets is a content slide', () => {
  expect(parseTalk('## Points\n\n- one\n- two').slides[0]?.layout).toBe(
    'content',
  );
});

test('a notes comment leaves the body and lands in the notes', () => {
  expect(parseTalk('# A\n\n<!-- notes: say hello -->').slides).toStrictEqual([
    { layout: 'title', body: '# A', notes: 'say hello' },
  ]);
});

test('a notes comment may span lines', () => {
  const { slides } = parseTalk(
    '## Mass\n\n<!-- notes: first point\nsecond point -->\n\n- one',
  );

  expect(slides[0]).toStrictEqual({
    layout: 'content',
    body: '## Mass\n\n\n\n- one',
    notes: 'first point\nsecond point',
  });
});

test('two notes comments are joined, and the layout is read from the body left', () => {
  const { slides } = parseTalk('<!-- notes: one --># A<!-- notes: two -->');

  expect(slides).toStrictEqual([
    { layout: 'title', body: '# A', notes: 'one\n\ntwo' },
  ]);
});

test('a slide without notes carries no notes key', () => {
  expect(parseTalk('# A').slides).toStrictEqual([
    { layout: 'title', body: '# A' },
  ]);
});

test('an empty source is an untitled talk with no slides', () => {
  expect(parseTalk('')).toStrictEqual({ meta: { title: '' }, slides: [] });
});

test('a slide holding only whitespace is dropped', () => {
  const { slides } = parseTalk('# A\n\n---\n\n   \n\n---\n\n# B');

  expect(slides.map((slide) => slide.body)).toStrictEqual(['# A', '# B']);
});

test('CRLF endings split and trim like LF ones', () => {
  const { meta, slides } = parseTalk(
    '---\r\ntitle: T\r\n---\r\n\r\n# A\r\n\r\n---\r\n\r\n# B\r\n',
  );

  expect(meta).toStrictEqual({ title: 'T' });
  expect(slides.map((slide) => slide.body)).toStrictEqual(['# A', '# B']);
});

test('a separator with trailing spaces still separates', () => {
  expect(parseTalk('# A\n---  \n# B').slides).toHaveLength(2);
});
