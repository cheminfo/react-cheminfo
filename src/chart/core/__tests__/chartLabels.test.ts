import { expect, test } from 'vitest';

import { chartAxisTitle, chartShare } from '../chartLabels.ts';

test('a share is written after the name as a percentage', () => {
  expect(chartAxisTitle('PC1', { share: 0.7296244541329989 })).toBe(
    'PC1 — 73.0 %',
  );
  expect(chartAxisTitle('PC2', { share: 0.22850761786701762 })).toBe(
    'PC2 — 22.9 %',
  );
  expect(chartAxisTitle('PC1', { share: 0 })).toBe('PC1 — 0.0 %');
});

test('a method that publishes no share gets a bare name', () => {
  expect(chartAxisTitle('UMAP1')).toBe('UMAP1');
  expect(chartAxisTitle('UMAP1', {})).toBe('UMAP1');
  expect(chartAxisTitle('UMAP1', { share: Number.NaN })).toBe('UMAP1');
});

test('the caller chooses how many decimals', () => {
  expect(chartAxisTitle('PC1', { share: 0.7296, digits: 2 })).toBe(
    'PC1 — 72.96 %',
  );
  expect(chartAxisTitle('PC1', { share: 0.7296, digits: 0 })).toBe(
    'PC1 — 73 %',
  );
  expect(chartAxisTitle('PC1', { share: 0.7296, digits: -2 })).toBe(
    'PC1 — 73 %',
  );
  expect(chartAxisTitle('PC1', { share: 0.7296, digits: Number.NaN })).toBe(
    'PC1 — 73.0 %',
  );
});

test('a share written on its own carries no unit and the same one decimal', () => {
  expect(chartShare(0.7296244541329989)).toBe('73.0');
  expect(chartShare(0.958093211320392)).toBe('95.8');
  expect(chartShare(0.7296, 2)).toBe('72.96');
  expect(chartShare(Number.NaN)).toBe('');
});

test('a title and a bare share agree on the same quantity', () => {
  const share = 0.7296244541329989;

  expect(chartAxisTitle('PC1', { share })).toBe(`PC1 — ${chartShare(share)} %`);
});
