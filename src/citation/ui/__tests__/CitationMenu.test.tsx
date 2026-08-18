import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PAPER } from '../../core/__tests__/paper.ts';
import { PLATFORM_PAPER } from '../../core/platformPaper.ts';
import type { CitedWork } from '../../core/works.ts';
import { CitationMenu } from '../CitationMenu.tsx';

const METHOD: CitedWork = {
  reference: PAPER,
  what: 'The screening method',
  note: 'Cite it for the ranking the site hands out.',
};

const PLATFORM: CitedWork = {
  reference: PLATFORM_PAPER,
  what: 'The browser platform',
  note: 'Cite it for the site itself.',
};

const WORKS: readonly CitedWork[] = [METHOD, PLATFORM];

test('one work opens at its DOI and its reference is the only one offered', () => {
  const html = renderToStaticMarkup(<CitationMenu reference={PAPER} />);

  expect(html).toContain('Green Chem. 2015');
  expect(html).toContain('10.1039/C5GC01022E');
  expect(html).toContain('Copy the reference as');
  expect(html).toContain('Import into a reference manager');
  expect(html).not.toContain('Please cite');
});

test('several works are named, each with what citing it credits', () => {
  const html = renderToStaticMarkup(<CitationMenu works={WORKS} />);

  expect(html).toContain('The screening method');
  expect(html).toContain('Cite it for the ranking the site hands out.');
  expect(html).toContain('The browser platform');
  expect(html).toContain('Cite it for the site itself.');
  expect(html).toContain('Green Chem. 2015');
  expect(html).toContain('Chimia 2025');
});

test('two works ask for both, and the copy entries carry both', () => {
  const html = renderToStaticMarkup(<CitationMenu works={WORKS} />);

  expect(html).toContain('Please cite both works');
  expect(html).toContain('Copy both references as');
  expect(html).toContain('Import into a reference manager');
});

test('past two works the menu asks for every one of them', () => {
  const html = renderToStaticMarkup(
    <CitationMenu
      works={[...WORKS, { reference: { ...PAPER, doi: 'x' }, what: 'A third' }]}
    />,
  );

  expect(html).toContain('Please cite every work');
  expect(html).toContain('Copy every reference as');
});

test('the site can write the line heading the works itself', () => {
  const html = renderToStaticMarkup(
    <CitationMenu
      works={WORKS}
      guidance="Cite the generator and the platform"
    />,
  );

  expect(html).toContain('Cite the generator and the platform');
  expect(html).not.toContain('Please cite both works');
});

test('a set holding one work reads as the menu of that work alone', () => {
  const html = renderToStaticMarkup(<CitationMenu works={[METHOD]} />);

  expect(html).toContain('Copy the reference as');
  expect(html).not.toContain('Please cite');
  expect(html).not.toContain('The screening method');
});

test('a set holding no work at all is a mistake the site is told about', () => {
  expect(() => renderToStaticMarkup(<CitationMenu works={[]} />)).toThrow(
    'a citation menu needs at least one work to cite',
  );
});
