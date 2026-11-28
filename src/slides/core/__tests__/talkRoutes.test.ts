import { expect, test } from 'vitest';

import { slideHeading, splitSlideHeading } from '../slideHeading.ts';
import { parseTalk } from '../talk.ts';
import { talkPageContent, talkRoute } from '../talkRoutes.ts';

const DECK = parseTalk(`---
title: ¹H NMR in a few slides
description: Where a ¹H NMR spectrum comes from, from the nucleus to the multiplets.
---

# ¹H NMR in a few slides

## Luc Patiny

---

<!-- spectrum: ethyl-acetate step=kinds -->

## A ¹H nucleus in a magnetic field

- It spins

---

No heading on this one.

---

### Try it

Open the viewer.
`);

test('a talk is titled by its deck and described by its description line', () => {
  expect(
    talkRoute('20261102_aspirin', {
      title: 'Aspirin, bond by bond',
      description: 'Draw aspirin on draw.cheminfo.org.',
    }),
  ).toStrictEqual({
    path: '/talks/20261102_aspirin',
    title: 'Aspirin, bond by bond',
    description: 'Draw aspirin on draw.cheminfo.org.',
  });
});

test('a deck with no description is described by its title', () => {
  expect(talkRoute('a', { title: 'A talk' })).toStrictEqual({
    path: '/talks/a',
    title: 'A talk',
    description: 'A talk',
  });
});

test('a site that plays talks elsewhere names the path', () => {
  expect(talkRoute('rings', { title: 'Rings' }, '/tutorials/rings').path).toBe(
    '/tutorials/rings',
  );
});

test('the heading of a slide is read past its markers', () => {
  expect(slideHeading('<!-- timer: 90 -->\n\n## Paracetamol\n\nBenzene.')).toBe(
    'Paracetamol',
  );
  expect(slideHeading('Press `r`.')).toBe('');
  expect(slideHeading('### Third level\n\ntext')).toBe('Third level');
  expect(slideHeading('#### Too deep')).toBe('');
});

test('a talk page is indexed on its title, its description and its slide headings', () => {
  expect(talkPageContent(DECK)).toStrictEqual({
    heading: '¹H NMR in a few slides',
    paragraphs: [
      'Where a ¹H NMR spectrum comes from, from the nucleus to the multiplets.',
    ],
    list: ['A ¹H nucleus in a magnetic field', 'Try it'],
  });
});

test('a talk page with no description is its title and its headings', () => {
  const talk = parseTalk(
    '---\ntitle: Rings\n---\n\n# Rings\n\n---\n\n## One\n\n- a\n\n---\n\n## Two\n\n- b',
  );

  expect(talkPageContent(talk)).toStrictEqual({
    heading: 'Rings',
    list: ['One', 'Two'],
  });
});

test('the first heading line is split from the rest of the slide', () => {
  expect(splitSlideHeading('## Title\n\n- One\n- Two')).toStrictEqual({
    heading: '## Title',
    rest: '- One\n- Two',
  });
  expect(splitSlideHeading('## Title only')).toStrictEqual({
    heading: '## Title only',
    rest: '',
  });
  expect(splitSlideHeading('No heading here')).toStrictEqual({
    heading: '',
    rest: 'No heading here',
  });
});
