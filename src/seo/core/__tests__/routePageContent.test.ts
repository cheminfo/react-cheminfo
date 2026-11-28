import { expect, test } from 'vitest';

import type { PageContent } from '../pageProse.ts';
import { routeItem, routePageContent } from '../routePageContent.ts';
import type { RouteMeta } from '../routes.ts';

const STEPS: Readonly<Record<string, PageContent>> = {
  'stereo-layer': {
    heading: 'The stereo layer',
    paragraphs: ['Step 3 of 9 of the InChI walkthrough.'],
  },
};

const EXERCISES: Readonly<Record<string, PageContent>> = {
  'word boundaries': {
    heading: 'Match a whole word',
    paragraphs: ['A beginner exercise.'],
  },
};

const OPTIONS = {
  pages: {
    '/tutorial': { heading: 'Learn InChI step by step' },
  },
  sections: {
    '/tutorial/': (id: string) => STEPS[id],
    '/exercises/': (id: string) => EXERCISES[id],
  },
};

function route(path: string): RouteMeta {
  return { path, title: `Title of ${path}`, description: `About ${path}.` };
}

test('a page the site wrote for comes first', () => {
  expect(routePageContent(route('/tutorial'), OPTIONS)).toStrictEqual({
    heading: 'Learn InChI step by step',
  });
});

test('an item of a section says what its section says of it', () => {
  expect(routePageContent(route('/tutorial/stereo-layer'), OPTIONS)).toBe(
    STEPS['stereo-layer'],
  );
  expect(routePageContent(route('/exercises/word%20boundaries'), OPTIONS)).toBe(
    EXERCISES['word boundaries'],
  );
});

test('an item no section knows says the words of its route', () => {
  expect(routePageContent(route('/tutorial/unknown'), OPTIONS)).toStrictEqual({
    heading: 'Title of /tutorial/unknown',
    paragraphs: ['About /tutorial/unknown.'],
  });
});

test('with nothing written, every address says the words of its route', () => {
  expect(routePageContent(route('/about'))).toStrictEqual({
    heading: 'Title of /about',
    paragraphs: ['About /about.'],
  });
});

test('a path that is no own key of the pages is not read off the prototype', () => {
  expect(routePageContent(route('constructor'), OPTIONS)).toStrictEqual({
    heading: 'Title of constructor',
    paragraphs: ['About constructor.'],
  });
});

test('the one item under a section is its id', () => {
  expect(routeItem('/tutorial/', '/tutorial/stereo-layer')).toBe(
    'stereo-layer',
  );
  expect(routeItem('/tutorial', '/tutorial/3')).toBe('3');
  expect(routeItem('/exercises/', '/exercises/word%20boundaries')).toBe(
    'word boundaries',
  );
});

test('the section itself, a deeper address and another section name no item', () => {
  expect(routeItem('/tutorial/', '/tutorial/')).toBeUndefined();
  expect(routeItem('/tutorial/', '/tutorial')).toBeUndefined();
  expect(routeItem('/tutorial/', '/tutorial/3/more')).toBeUndefined();
  expect(routeItem('/tutorial/', '/tutorials/3')).toBeUndefined();
  expect(routeItem('/tutorial/', '/exercises/3')).toBeUndefined();
});

test('an encoded slash and an address that does not decode name no item', () => {
  expect(routeItem('/exercises/', '/exercises/a%2Fb')).toBeUndefined();
  expect(routeItem('/exercises/', '/exercises/%E0%A4%A')).toBeUndefined();
});
