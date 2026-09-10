import { getClasses, getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ProjectionResult, ProjectionSamples } from '../../core/index.ts';
import { embeddingResult, pcaResult } from '../../core/index.ts';
import { ProjectionViewer } from '../ProjectionViewer.tsx';

const rows = getNumbers();

const SAMPLES: ProjectionSamples = {
  ids: rows.map((_, index) => `flower-${index + 1}`),
  groups: getClasses(),
  groupLabel: 'Species',
};

const IRIS: ProjectionResult = pcaResult(new PCA(rows, { scale: true }), {
  rows,
  scaled: true,
});

const EMBEDDING: ProjectionResult = embeddingResult(
  rows.map((row) => [row[0] as number, row[1] as number]),
  { method: 'UMAP', names: ['UMAP1', 'UMAP2'] },
);

/** The glyph the figure's own explanation waits behind. */
const QUESTION = 'aria-label="What am I looking at?"';

test('a two-dimensional embedding is one map with no strip of views over it', () => {
  const html = renderToStaticMarkup(
    <ProjectionViewer result={EMBEDDING} samples={SAMPLES} />,
  );

  expect(html).not.toContain('role="tablist"');
  expect(occurrences(html, 'role="tab"')).toBe(0);
  expect(occurrences(layer(html, 'points'), '<circle')).toBe(150);
  // The bar stays even with one view: the settings and the explanation still
  // belong somewhere.
  expect(occurrences(html, QUESTION)).toBe(1);
});

test('a principal component run offers every tab, as connected pills', () => {
  const html = renderToStaticMarkup(
    <ProjectionViewer result={IRIS} samples={SAMPLES} />,
  );

  expect(html).toContain('role="tablist"');
  expect(occurrences(html, 'role="tab"')).toBe(5);
  expect(occurrences(html, 'role="tabpanel"')).toBe(1);
  // The names are the short forms: an unmeasured figure is drawn at the width
  // a single column of a page gives it, and the map's bar spends two controls
  // of that on the switches that write the names onto the picture. The strip
  // shortens rather than clipping, which is the whole point of the ladder.
  expect(html).toContain('>Map</button>');
  expect(html).toContain('>3D</button>');
  expect(html).toContain('>Pairs</button>');
  expect(html).toContain('>Differs</button>');
  expect(html).toContain('>Explains</button>');

  // Exactly one pill is in the tab order, so a strip of five views costs a
  // reader walking the page one stop rather than five. The pills are read off
  // their own tags rather than out of a slice of the markup, because the bar's
  // own controls stand between the strip and the panel and are in the tab
  // order in their own right.
  const pills = [...html.matchAll(/role="tab"[^>]*/g)].map((match) => match[0]);

  expect(pills).toHaveLength(5);
  expect(pills.filter((pill) => pill.includes('tabindex="0"'))).toHaveLength(1);
  expect(pills.filter((pill) => pill.includes('tabindex="-1"'))).toHaveLength(
    4,
  );
});

test('the bar is one row above the figure, not a card floating on it', () => {
  const html = renderToStaticMarkup(
    <ProjectionViewer result={IRIS} samples={SAMPLES} />,
  );

  expect(html.indexOf(QUESTION)).toBeLessThan(html.indexOf('role="tabpanel"'));
  expect(html).toContain('justify-content:space-between');
  expect(html).toContain('border-bottom:1px solid var(--border)');
});

test('a tab the result cannot fill is ignored and the map opens instead', () => {
  const html = renderToStaticMarkup(
    <ProjectionViewer
      result={EMBEDDING}
      samples={SAMPLES}
      defaultTab="shares"
    />,
  );

  expect(html).not.toContain('role="tablist"');
  expect(html).toContain('UMAP1');
  expect(html).not.toContain('Share of the differences explained');
});

test('a caller owning the tab gets the one it asked for', () => {
  const html = renderToStaticMarkup(
    <ProjectionViewer result={IRIS} samples={SAMPLES} tab="shares" />,
  );

  expect(html).toContain('Share of the differences explained');
  expect(html).toContain('Components, strongest first');
  expect(html).not.toContain('PC1 — 73.0 %');
});

test('a site that narrowed the panels away from the map is not shown the map', () => {
  const html = renderToStaticMarkup(
    <ProjectionViewer
      result={IRIS}
      samples={SAMPLES}
      panels={['variables', 'shares']}
    />,
  );

  expect(occurrences(html, 'role="tab"')).toBe(2);
  expect(html).not.toContain('>Map</button>');
  expect(html).not.toContain('>Every pair</button>');

  // It opens on the first panel it does offer, and no map is drawn under the
  // strip that does not name one.
  expect(html).toContain('>What differs</button>');
  expect(layer(html, 'points')).toBe('');
  expect(html).toContain('PC1 — 73.0 %');
  expect(html).toContain('PC3 — 3.7 %');
});

test('narrowing to one panel leaves no strip, and still is not the map', () => {
  const html = renderToStaticMarkup(
    <ProjectionViewer result={IRIS} samples={SAMPLES} panels={['shares']} />,
  );

  expect(html).not.toContain('role="tablist"');
  expect(html).toContain('Share of the differences explained');
  expect(layer(html, 'points')).toBe('');
});

test('the selection is given by name, and a name nothing answers to is dropped', () => {
  const html = renderToStaticMarkup(
    <ProjectionViewer
      result={IRIS}
      samples={SAMPLES}
      defaultSelected={['flower-3', 'flower-9', 'no-such-flower']}
    />,
  );

  expect(occurrences(layer(html, 'marks'), 'stroke="var(--accent)"')).toBe(2);
  expect(occurrences(layer(html, 'points'), '<circle')).toBe(150);
});

test('the options a caller owns are the ones the figure is drawn from', () => {
  const html = renderToStaticMarkup(
    <ProjectionViewer
      result={IRIS}
      samples={SAMPLES}
      options={{ xAxis: 2, yAxis: 3 }}
    />,
  );

  expect(html).toContain('PC3 — 3.7 %');
  expect(html).toContain('PC4 — 0.5 %');
});

function layer(html: string, name: string): string {
  const start = html.indexOf(`<g data-layer="${name}"`);
  if (start === -1) return '';
  return html.slice(start, html.indexOf('</g>', start));
}

function occurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}
