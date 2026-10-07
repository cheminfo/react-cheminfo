// @vitest-environment jsdom
/**
 * A lineage as the breadcrumb a reader follows: the principal ranks, the leaf
 * emphasised, the names under the genus in italics, each taxon a link only
 * when the site has a page for it.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Taxon } from '../../core/lineage.ts';
import { TaxonLineage } from '../TaxonLineage.tsx';

const LINEAGE: Taxon[] = [
  { rank: 'no rank', name: 'root', taxId: 1 },
  { rank: 'domain', name: 'Eukaryota', taxId: 2759 },
  { rank: 'clade', name: 'Opisthokonta', taxId: 33_154 },
  { rank: 'kingdom', name: 'Fungi', taxId: 4751 },
  { rank: 'family', name: 'Aspergillaceae', taxId: 1_131_492 },
  { rank: 'genus', name: 'Penicillium', taxId: 5073 },
  { rank: 'species', name: 'Penicillium chrysogenum', taxId: 5076 },
];

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

/**
 * The names a breadcrumb shows, in order.
 * @param container - Where it is drawn.
 * @returns The text of each name.
 */
function names(container: ParentNode): string[] {
  return [...container.querySelectorAll('.taxon-lineage__name')].map(
    (name) => name.textContent,
  );
}

/**
 * Click a link, and say whether the page took the click over. The browser's
 * own navigation is then cancelled, which jsdom cannot perform.
 * @param link - The link.
 * @param metaKey - Whether the click asks for a tab of its own.
 * @returns Whether the page prevented the browser's default.
 */
function click(link: HTMLAnchorElement, metaKey: boolean): boolean {
  let prevented = false;
  const record = (event: Event) => {
    prevented = event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener('click', record);
  act(() => {
    link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, metaKey }),
    );
  });
  document.removeEventListener('click', record);
  return prevented;
}

test('the principal ranks are a list in a named breadcrumb', () => {
  act(() => root.render(<TaxonLineage lineage={LINEAGE} />));

  const nav = host.querySelector('nav');

  expect(nav?.getAttribute('aria-label')).toBe('Lineage');
  expect(nav?.querySelectorAll('ol > li')).toHaveLength(5);
  expect(names(host)).toStrictEqual([
    'Eukaryota',
    'Fungi',
    'Aspergillaceae',
    'Penicillium',
    'Penicillium chrysogenum',
  ]);
  expect(
    [...host.querySelectorAll('li')].map((item) => item.title),
  ).toStrictEqual(['domain', 'kingdom', 'family', 'genus', 'species']);
  expect(host.querySelector('li:last-child')?.className).toBe(
    'taxon-lineage__taxon taxon-lineage__taxon--leaf',
  );
  expect(host.querySelectorAll('.taxon-lineage__separator')).toHaveLength(4);
  expect(host.querySelector('a')).toBeNull();
});

test('a screen reader hears each rank after its name', () => {
  act(() => root.render(<TaxonLineage lineage={LINEAGE} />));

  expect(host.querySelector('li')?.textContent).toBe('Eukaryota (domain)›');
});

test('only the names under the genus are italic', () => {
  const html = renderToStaticMarkup(<TaxonLineage lineage={LINEAGE} />);

  expect(html.match(/<i>[^<]*<\/i>/g)).toStrictEqual([
    '<i>Penicillium</i>',
    '<i>Penicillium chrysogenum</i>',
  ]);
});

test('every taxon, clades included, when principal is off', () => {
  act(() =>
    root.render(<TaxonLineage lineage={LINEAGE} principal={false} showRanks />),
  );

  expect(names(host)).toHaveLength(7);
  expect(
    [...host.querySelectorAll('.taxon-lineage__rank')].map(
      (rank) => rank.textContent,
    ),
  ).toStrictEqual([
    'no rank',
    'domain',
    'clade',
    'kingdom',
    'family',
    'genus',
    'species',
  ]);
  expect(host.querySelector('li')?.title).toBe('');
  expect(host.querySelector('.taxon-lineage__spoken')).toBeNull();
});

test('a taxon the site has a page for is a link, followed in place', () => {
  const selected = vi.fn<(taxon: Taxon) => void>();
  act(() =>
    root.render(
      <TaxonLineage
        lineage={LINEAGE}
        taxonHref={(taxon) =>
          taxon.rank === 'family' ? undefined : `/taxonomy/${taxon.taxId}`
        }
        onTaxonSelect={selected}
      />,
    ),
  );

  const links = [...host.querySelectorAll('a')];

  expect(links.map((link) => link.getAttribute('href'))).toStrictEqual([
    '/taxonomy/2759',
    '/taxonomy/4751',
    '/taxonomy/5073',
    '/taxonomy/5076',
  ]);

  const fungi = links[1] as HTMLAnchorElement;

  expect(click(fungi, false)).toBe(true);
  expect(selected).toHaveBeenCalledExactlyOnceWith(LINEAGE[3]);

  expect(click(fungi, true)).toBe(false);
  expect(selected).toHaveBeenCalledOnce();
});

test('the current taxon is marked as the page and never a link', () => {
  act(() =>
    root.render(
      <TaxonLineage
        lineage={LINEAGE}
        current
        taxonHref={(taxon) => `/taxonomy/${taxon.taxId}`}
      />,
    ),
  );

  const leaf = host.querySelector('li:last-child .taxon-lineage__name');

  expect(leaf?.tagName).toBe('SPAN');
  expect(leaf?.getAttribute('aria-current')).toBe('page');
  expect(host.querySelectorAll('a')).toHaveLength(4);
});

test('the NCBI link follows the lineage when the leaf has an id', () => {
  act(() => root.render(<TaxonLineage lineage={LINEAGE} ncbiLink />));

  const ncbi = host.querySelector('.taxon-lineage__ncbi');

  expect(ncbi?.getAttribute('href')).toBe(
    'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=5076',
  );
  expect(ncbi?.getAttribute('title')).toBe(
    'Open Penicillium chrysogenum in the NCBI Taxonomy Browser',
  );
  expect(ncbi?.textContent).toBe('NCBI Taxonomy');
  expect(ncbi?.getAttribute('target')).toBe('_blank');

  act(() =>
    root.render(
      <TaxonLineage
        lineage={[{ rank: 'genus', name: 'Penicillium' }]}
        ncbiLink
      />,
    ),
  );

  expect(host.querySelector('.taxon-lineage__ncbi')).toBeNull();
});

test('an empty lineage draws nothing', () => {
  expect(renderToStaticMarkup(<TaxonLineage lineage={[]} />)).toBe('');
});
