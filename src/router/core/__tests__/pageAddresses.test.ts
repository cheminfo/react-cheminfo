import { expect, test } from 'vitest';

import { createPageAddresses } from '../pageAddresses.ts';

interface Page {
  path: string;
  title: string;
}

const PAGES: Page[] = [
  { path: '/', title: 'Converter' },
  { path: '/exercises', title: 'Exercises' },
  { path: '/exercises/patterns', title: 'Patterns' },
  { path: '/tutorial', title: 'Tutorial' },
  { path: '/reference', title: 'Reference' },
];

function addresses(basePath?: string) {
  return createPageAddresses<Page>({ pages: PAGES, basePath });
}

test('every page is listed in the order the site presents them', () => {
  expect(
    addresses()
      .everyPage()
      .map((page) => page.title),
  ).toStrictEqual([
    'Converter',
    'Exercises',
    'Patterns',
    'Tutorial',
    'Reference',
  ]);
});

test('an address opens the page it names', () => {
  expect(addresses().pageAt('/tutorial').title).toBe('Tutorial');
  expect(addresses().pageAt('/exercises/patterns').title).toBe('Patterns');
  expect(addresses().pageAt('/').title).toBe('Converter');
});

test('a query, a fragment and a trailing slash name the same page', () => {
  expect(addresses().pageAt('/tutorial?step=3').title).toBe('Tutorial');
  expect(addresses().pageAt('/tutorial/#top').title).toBe('Tutorial');
  expect(addresses().pageAt('/exercises/').title).toBe('Exercises');
});

test('an address below a listed page is that page', () => {
  expect(addresses().pageAt('/exercises/renamed-yesterday').title).toBe(
    'Exercises',
  );
  expect(addresses().pageAt('/exercises/patterns/2').title).toBe('Patterns');
});

test('an address the site knows nothing about is the home page', () => {
  expect(addresses().pageAt('/nowhere').title).toBe('Converter');
  expect(addresses().pageAt('').title).toBe('Converter');
});

test('a page is indexed under its own address, the query dropped', () => {
  const pages = addresses();

  expect(pages.canonicalPathOf(pages.pageAt('/tutorial?step=3'))).toBe(
    '/tutorial',
  );
  expect(pages.canonicalPathOf(pages.pageAt('/'))).toBe('/');
});

test('a site under a mount path reads and writes addresses under it', () => {
  const mounted = addresses('/surge/');

  expect(mounted.pageAt('/surge/tutorial').title).toBe('Tutorial');
  expect(mounted.canonicalPathOf(mounted.pageAt('/surge/tutorial'))).toBe(
    '/surge/tutorial',
  );
  expect(mounted.canonicalPathOf(mounted.pageAt('/surge'))).toBe('/surge/');
});

test('a site with no page at all is a programming error', () => {
  expect(() => createPageAddresses<Page>({ pages: [] })).toThrow(
    'createPageAddresses needs at least one page',
  );
});
