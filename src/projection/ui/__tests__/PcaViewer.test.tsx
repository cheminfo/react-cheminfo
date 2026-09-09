import { getClasses, getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ProjectionSamples } from '../../core/index.ts';
import { PcaViewer } from '../PcaViewer.tsx';

const rows = getNumbers();
const model = new PCA(rows, { scale: true });

const SAMPLES: ProjectionSamples = {
  ids: rows.map((_, index) => `flower-${index + 1}`),
  groups: getClasses(),
  groupLabel: 'Species',
};

test('both axes say how much of the differences they account for', () => {
  const html = renderToStaticMarkup(
    <PcaViewer pca={model} rows={rows} scaled samples={SAMPLES} />,
  );

  expect(html).toContain('PC1 — 73.0 %');
  expect(html).toContain('PC2 — 22.9 %');
});

test('every flower is one filled dot', () => {
  const html = renderToStaticMarkup(
    <PcaViewer pca={model} rows={rows} scaled samples={SAMPLES} />,
  );
  const points = layer(html, 'points');

  expect(occurrences(points, '<circle')).toBe(150);
  expect(occurrences(points, 'fill="none"')).toBe(0);
});

test('a batch placed into a finished model is drawn hollow', () => {
  const learnt = rows.slice(0, 100);
  const later = rows.slice(100);
  const html = renderToStaticMarkup(
    <PcaViewer
      pca={new PCA(learnt, { scale: true })}
      rows={learnt}
      projected={later}
      scaled
      samples={SAMPLES}
    />,
  );
  const points = layer(html, 'points');

  expect(occurrences(points, '<circle')).toBe(150);
  expect(occurrences(points, 'fill="none"')).toBe(50);
});

test('keeping two components leaves the pair grid and the shares out', () => {
  const html = renderToStaticMarkup(
    <PcaViewer pca={model} rows={rows} scaled count={2} samples={SAMPLES} />,
  );

  expect(occurrences(html, 'role="tab"')).toBe(2);
  expect(html).toContain('>Map</button>');
  expect(html).toContain('>What differs</button>');
});

function layer(html: string, name: string): string {
  const start = html.indexOf(`<g data-layer="${name}"`);
  if (start === -1) return '';
  return html.slice(start, html.indexOf('</g>', start));
}

function occurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}
