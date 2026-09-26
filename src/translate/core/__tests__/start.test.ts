import { expect, test } from 'vitest';

import { loadOverlay, readTranslateLocale } from '../start.ts';

test('a page is in translate mode when its address names a language', () => {
  expect(readTranslateLocale('?translate=fr')).toBe('fr');
  expect(readTranslateLocale('?p=melting&translate=pt-BR')).toBe('pt-BR');
});

test('a page is not in translate mode for English, or for nonsense', () => {
  expect(readTranslateLocale('?translate=en')).toBeUndefined();
  expect(readTranslateLocale('?translate=')).toBeUndefined();
  expect(readTranslateLocale('?translate=en_US')).toBeUndefined();
  expect(readTranslateLocale('?p=melting')).toBeUndefined();
  expect(readTranslateLocale('')).toBeUndefined();
});

test('the overlay is asked for once, from the site that serves it', () => {
  const page = fakePage();
  loadOverlay('https://translate.cheminfo.org', { document: page.document });
  loadOverlay('https://translate.cheminfo.org/', { document: page.document });

  expect(page.scripts.map((one) => one.src)).toStrictEqual([
    'https://translate.cheminfo.org/overlay.js',
  ]);
});

test('an overlay that never arrives takes translate mode down with it', () => {
  const page = fakePage();
  let stillTranslating = true;
  loadOverlay('https://translate.cheminfo.org', {
    document: page.document,
    onUnavailable: () => {
      stillTranslating = false;
    },
  });

  expect(stillTranslating).toBe(true);

  page.scripts[0]?.fail();

  expect(stillTranslating).toBe(false);
  // Its own tag is taken off the page too, so a reload asks again.
  expect(page.scripts).toStrictEqual([]);
});

test('an overlay that arrives is never given up on afterwards', () => {
  const page = fakePage();
  let stillTranslating = true;
  loadOverlay('https://translate.cheminfo.org', {
    document: page.document,
    onUnavailable: () => {
      stillTranslating = false;
    },
    timeout: 1,
  });

  const script = page.scripts[0];
  script?.arrive();
  script?.fail();

  expect(stillTranslating).toBe(true);
});

/** A script tag as the test drives it: it can fail, or it can arrive. */
interface FakeScript {
  src: string;
  type: string;
  async: boolean;
  remove: () => void;
  addEventListener: (name: string, listener: () => void) => void;
  fail: () => void;
  arrive: () => void;
}

/**
 * Just enough document for a script tag to be added, to fail, or to arrive.
 * @returns The stand-in, and the tags added to it.
 */
function fakePage(): { document: Document; scripts: FakeScript[] } {
  const scripts: FakeScript[] = [];
  const document = {
    head: {
      append(script: FakeScript) {
        scripts.push(script);
      },
    },
    querySelectorAll: () => scripts,
    createElement(): FakeScript {
      const listeners = new Map<string, () => void>();
      const script: FakeScript = {
        src: '',
        type: '',
        async: false,
        remove: () => {
          const at = scripts.indexOf(script);
          if (at !== -1) scripts.splice(at, 1);
        },
        addEventListener: (name, listener) => listeners.set(name, listener),
        fail: () => listeners.get('error')?.(),
        arrive: () => listeners.get('load')?.(),
      };
      return script;
    },
  } as unknown as Document;
  return { document, scripts };
}
