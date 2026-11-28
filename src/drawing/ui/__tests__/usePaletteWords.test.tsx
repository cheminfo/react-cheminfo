import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import type { PaletteCanvas } from '../usePaletteWords.ts';
import { usePaletteWords } from '../usePaletteWords.ts';

beforeAll(async () => {
  await CHROME_CATALOG.load('fr');
});

function Words(props: { name: string; canvas: PaletteCanvas }): ReactElement {
  const words = usePaletteWords();
  return (
    <>
      <p>{words.tooltip(props.name, props.canvas)}</p>
      <p>{words.gestures(props.canvas)}</p>
    </>
  );
}

function render(name: string, canvas: PaletteCanvas, language = 'en'): string {
  return renderToStaticMarkup(
    <SiteLanguage value={language}>
      <Words name={name} canvas={canvas} />
    </SiteLanguage>,
  );
}

test('a bench entry says its name, capitalised, then how it is added', () => {
  expect(render('spring', 'bench')).toBe(
    '<p>Spring: drag it onto the bench, or click it and then the bench. Double-click adds it at once.</p><p>Drag it onto the bench, or click it and then the bench. Double-click adds it at once.</p>',
  );
});

test('a figure and a drawing name what the entry is put on', () => {
  expect(render('Ion channel', 'figure')).toBe(
    '<p>Ion channel: drag it onto the figure, or click it and then the figure. Double-click adds it at once.</p><p>Drag it onto the figure, or click it and then the figure. Double-click adds it at once.</p>',
  );
  expect(render('round-bottom flask', 'drawing')).toContain(
    'Round-bottom flask: drag it onto the drawing, or click it and then the drawing.',
  );
});

test('a French page reads the sentence in French', () => {
  expect(render('pile', 'bench', 'fr')).toContain(
    'Pile : faites glisser la pièce sur la paillasse, ou cliquez dessus puis sur la paillasse. Un double-clic l’ajoute aussitôt.',
  );
});
