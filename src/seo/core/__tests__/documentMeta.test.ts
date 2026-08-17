import { expect, test } from 'vitest';

import {
  canonicalLink,
  documentTitle,
  writeDocumentMeta,
} from '../documentMeta.ts';

interface FakeElement {
  rel?: string;
  href?: string;
  name?: string;
  content?: string;
}

test('nothing happens under Node, where there is no document', () => {
  expect(globalThis.document).toBeUndefined();
  expect(() => {
    documentTitle('A title');
    canonicalLink('https://smiles.cheminfo.org/tutorial');
    writeDocumentMeta({ title: 'A title', description: 'A sentence.' });
  }).not.toThrow();
});

test('the tab takes the title of the page on screen', () => {
  const fake = withDocument(() => {
    documentTitle('SMILES tutorial — smiles.cheminfo.org');
  });

  expect(fake.title).toBe('SMILES tutorial — smiles.cheminfo.org');
});

test('the canonical link is created when the served page carries none', () => {
  const fake = withDocument(() => {
    canonicalLink('https://smiles.cheminfo.org/tutorial');
  });

  expect(fake.find('link[rel="canonical"]')).toStrictEqual({
    rel: 'canonical',
    href: 'https://smiles.cheminfo.org/tutorial',
  });
});

test('the canonical link the page was served with is reused', () => {
  const existing: FakeElement = {
    rel: 'canonical',
    href: 'https://smiles.cheminfo.org/',
  };
  const fake = withDocument(() => {
    canonicalLink('https://smiles.cheminfo.org/tutorial');
  }, [existing]);

  expect(existing.href).toBe('https://smiles.cheminfo.org/tutorial');
  expect(fake.count()).toBe(1);
});

test('the canonical drops the query string and the fragment', () => {
  const fake = withDocument(() => {
    canonicalLink('https://smiles.cheminfo.org/?smiles=CCO&embed=1#top');
  });

  expect(fake.find('link[rel="canonical"]')?.href).toBe(
    'https://smiles.cheminfo.org/',
  );
});

test('an address that is nothing but a query writes no canonical', () => {
  const fake = withDocument(() => {
    canonicalLink('?smiles=CCO');
  });

  expect(fake.count()).toBe(0);
});

test('the whole head of a page is written in one call', () => {
  const fake = withDocument(() => {
    writeDocumentMeta({
      title: 'SMILES exercises — smiles.cheminfo.org',
      description: 'Graded SMILES exercises, marked in your browser.',
      canonical: 'https://smiles.cheminfo.org/exercises?set=alkanes',
    });
  });

  expect(fake.title).toBe('SMILES exercises — smiles.cheminfo.org');
  expect(fake.find('meta[name="description"]')?.content).toBe(
    'Graded SMILES exercises, marked in your browser.',
  );
  expect(fake.find('link[rel="canonical"]')?.href).toBe(
    'https://smiles.cheminfo.org/exercises',
  );
});

test('what the call leaves out is left as the page was served with it', () => {
  const description: FakeElement = {
    name: 'description',
    content: 'What the server wrote.',
  };
  const fake = withDocument(() => {
    writeDocumentMeta({ title: 'Another page' });
  }, [description]);

  expect(fake.title).toBe('Another page');
  expect(description.content).toBe('What the server wrote.');
  expect(fake.find('link[rel="canonical"]')).toBeNull();
});

// A head of the smallest shape the module reads: the package has no DOM
// implementation and must not grow one.
function withDocument(
  run: () => void,
  served: FakeElement[] = [],
): FakeDocument {
  const fake = createFakeDocument(served);
  Object.defineProperty(globalThis, 'document', {
    value: fake,
    configurable: true,
  });
  try {
    run();
  } finally {
    Reflect.deleteProperty(globalThis, 'document');
  }
  return fake;
}

interface FakeDocument {
  title: string;
  find: (selector: string) => FakeElement | null;
  count: () => number;
}

function createFakeDocument(served: FakeElement[]): FakeDocument {
  const bySelector = new Map<string, FakeElement>();

  function append(element: FakeElement): void {
    if (element.rel !== undefined) {
      bySelector.set(`link[rel="${element.rel}"]`, element);
    }
    if (element.name !== undefined) {
      bySelector.set(`meta[name="${element.name}"]`, element);
    }
  }

  for (const element of served) append(element);

  return {
    title: '',
    head: { append },
    createElement: (): FakeElement => ({}),
    querySelector: (selector: string) => bySelector.get(selector) ?? null,
    find: (selector: string) => bySelector.get(selector) ?? null,
    count: () => bySelector.size,
  } as FakeDocument;
}
