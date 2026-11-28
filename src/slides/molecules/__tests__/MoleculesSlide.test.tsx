import type { ReactElement } from 'react';
import { prerender } from 'react-dom/static';
import { expect, test } from 'vitest';

import { parseTalk } from '../../core/talk.ts';
import type { SlideLayoutProps } from '../../ui/Slide.tsx';
import { SlideView } from '../../ui/Slide.tsx';
import { MoleculesSlide } from '../MoleculesSlide.tsx';

/**
 * Render the first slide of a deck the way the player does, lazy figures
 * included.
 * @param markdown - The deck.
 * @returns The markup of the slide.
 */
async function renderSlide(markdown: string): Promise<string> {
  const talk = parseTalk(markdown);
  const slide = talk.slides[0];
  if (slide === undefined) throw new Error('the deck holds no slide');
  const props: SlideLayoutProps = {
    slide,
    talkId: 'test',
    slideIndex: 0,
    meta: talk.meta,
  };
  return render(
    <SlideView {...props} layouts={{ molecules: MoleculesSlide }} />,
  );
}

async function render(element: ReactElement): Promise<string> {
  const { prelude } = await prerender(element);
  return new Response(prelude).text();
}

function count(markup: string, text: string): number {
  return markup.split(text).length - 1;
}

test('the molecules layout draws each structure over its name', async () => {
  const markup = await renderSlide(`<!-- layout: molecules -->
## Two stimulants
<!-- molecules:
Cocaine CN1[C@H]2CC[C@@H]1[C@H]([C@H](C2)OC(=O)c1ccccc1)C(=O)OC
Caffeine Cn1cnc2c1c(=O)n(C)c(=O)n2C
Typo C1CC(
-->`);

  expect(count(markup, 'class="molecule-grid__cell"')).toBe(3);
  expect(markup).toContain(
    '<figcaption class="molecule-grid__name">Cocaine</figcaption>',
  );
  expect(markup).toContain(
    '<figcaption class="molecule-grid__name">Caffeine</figcaption>',
  );
  expect(markup).toContain('Unreadable SMILES');
  expect(markup).toContain('grid-template-columns:repeat(3, minmax(0, 1fr))');
  expect(markup).toContain('<h2>Two stimulants</h2>');
});

test('a structure alone fills the figure', async () => {
  const markup = await renderSlide(`<!-- layout: molecules -->
## Caffeine
<!-- molecules: Caffeine Cn1cnc2c1c(=O)n(C)c(=O)n2C -->`);

  expect(markup).toContain('class="molecule-grid molecule-grid--alone"');
  expect(count(markup, 'class="molecule-grid__cell"')).toBe(1);
});

test('a slide that lists no molecule tells its author how to', async () => {
  const markup = await renderSlide(`<!-- layout: molecules -->
## Nothing yet`);

  expect(markup).toContain(
    '<p class="chem-figure-message">List the molecules in the marker, one per line: a name, then its SMILES.</p>',
  );
});
