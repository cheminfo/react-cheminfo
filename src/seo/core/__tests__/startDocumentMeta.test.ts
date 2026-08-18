import { expect, test } from 'vitest';

import type { RouteMeta } from '../routes.ts';
import { startDocumentMeta } from '../startDocumentMeta.ts';

const ROUTES: readonly RouteMeta[] = [
  { path: '/', title: 'Draw a SMILES', description: 'The home page.' },
  {
    path: '/exercises',
    title: 'SMILES exercises',
    description: 'Graded SMILES exercises, marked in your browser.',
  },
];

test('the head of the page on screen is written straight away', () => {
  const page = withDocument(() => {
    startDocumentMeta({
      site: 'smiles',
      routes: ROUTES,
      url: () => '/exercises?set=alkanes',
    });
  });

  expect(page.title).toBe('SMILES exercises — smiles.cheminfo.org');
  expect(page.find('link[rel="canonical"]')?.href).toBe(
    'https://smiles.cheminfo.org/exercises',
  );
  expect(page.find('meta[name="description"]')?.content).toBe(
    'Graded SMILES exercises, marked in your browser.',
  );
});

test('an address the site does not know is described as its home page', () => {
  const page = withDocument(() => {
    startDocumentMeta({ site: 'smiles', routes: ROUTES, url: () => '/gone' });
  });

  expect(page.title).toBe('Draw a SMILES — smiles.cheminfo.org');
  expect(page.find('link[rel="canonical"]')?.href).toBe(
    'https://smiles.cheminfo.org/',
  );
});

test('the canonical is built on the address the deployment answers on', () => {
  const page = withDocument(() => {
    startDocumentMeta({
      site: 'surge',
      routes: ROUTES,
      url: () => '/surge/exercises',
      origin: 'https://learn.cheminfo.org/surge',
    });
  });

  expect(page.find('link[rel="canonical"]')?.href).toBe(
    'https://learn.cheminfo.org/surge/exercises',
  );
});

test('a follow rewrites the head on every move, until it is stopped', () => {
  const router = createRouter('/');

  const page = withDocument((document) => {
    const stop = startDocumentMeta({
      site: 'smiles',
      routes: ROUTES,
      url: router.read,
      follow: router.follow,
    });

    expect(document.title).toBe('Draw a SMILES — smiles.cheminfo.org');

    router.go('/exercises');

    expect(document.title).toBe('SMILES exercises — smiles.cheminfo.org');

    stop();
    router.go('/');
  });

  // The last move happened after the stop, so the head still names the page
  // that was on screen when it was called.
  expect(page.title).toBe('SMILES exercises — smiles.cheminfo.org');
  expect(page.find('link[rel="canonical"]')?.href).toBe(
    'https://smiles.cheminfo.org/exercises',
  );
  expect(router.following()).toBe(0);
});

test('with no follow the head is written once, and stopping does nothing', () => {
  const router = createRouter('/');

  const page = withDocument(() => {
    const stop = startDocumentMeta({
      site: 'smiles',
      routes: ROUTES,
      url: router.read,
    });
    router.go('/exercises');

    expect(() => {
      stop();
    }).not.toThrow();
  });

  expect(router.following()).toBe(0);
  expect(page.title).toBe('Draw a SMILES — smiles.cheminfo.org');
});

test('nothing is read and nothing is followed where there is no document', () => {
  expect(globalThis.document).toBeUndefined();

  const router = createRouter('/');

  const stop = startDocumentMeta({
    site: 'smiles',
    routes: ROUTES,
    url: () => {
      throw new Error('the address must not be read under Node');
    },
    follow: router.follow,
  });

  expect(router.following()).toBe(0);
  expect(() => {
    stop();
  }).not.toThrow();
});

// A route source shaped like the signals `effect` the sites pass: `follow`
// takes a callback that may hand back a cleanup, runs it, and returns the
// function that stops it. Passing it proves `effect` itself wires without a
// cast.
function createRouter(initial: string) {
  const listeners = new Set<() => void | (() => void)>();
  let path = initial;

  return {
    read: () => path,
    follow: (write: () => void | (() => void)): (() => void) => {
      write();
      listeners.add(write);
      return () => {
        listeners.delete(write);
      };
    },
    go: (next: string): void => {
      path = next;
      for (const listener of listeners) listener();
    },
    following: () => listeners.size,
  };
}

interface FakeElement {
  rel?: string;
  href?: string;
  name?: string;
  content?: string;
}

interface FakeDocument {
  title: string;
  find: (selector: string) => FakeElement | null;
}

// A head of the smallest shape the module reads: the package has no DOM
// implementation and must not grow one.
function withDocument(run: (document: FakeDocument) => void): FakeDocument {
  const fake = createFakeDocument();
  Object.defineProperty(globalThis, 'document', {
    value: fake,
    configurable: true,
  });
  try {
    run(fake);
  } finally {
    Reflect.deleteProperty(globalThis, 'document');
  }
  return fake;
}

function createFakeDocument(): FakeDocument {
  const bySelector = new Map<string, FakeElement>();

  function append(element: FakeElement): void {
    if (element.rel !== undefined) {
      bySelector.set(`link[rel="${element.rel}"]`, element);
    }
    if (element.name !== undefined) {
      bySelector.set(`meta[name="${element.name}"]`, element);
    }
  }

  return {
    title: '',
    head: { append },
    createElement: (): FakeElement => ({}),
    querySelector: (selector: string) => bySelector.get(selector) ?? null,
    find: (selector: string) => bySelector.get(selector) ?? null,
  } as FakeDocument;
}
