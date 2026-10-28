import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { StructureSearchQuery } from '../../core/structureSearch.ts';
import { StructureSearchDialog } from '../StructureSearchDialog.tsx';

const EMPTY: StructureSearchQuery = {
  idCode: '',
  mode: 'substructure',
  threshold: 0.7,
};

function noop(): void {
  // The dialog is only being rendered to markup.
}

test('a closed dialog renders nothing', () => {
  const markup = renderToStaticMarkup(
    <StructureSearchDialog
      isOpen={false}
      usePortal={false}
      value={EMPTY}
      onClose={noop}
    />,
  );

  expect(markup).not.toContain('structure-search');
});

test('an open dialog offers every mode and the default fragments', () => {
  const markup = renderToStaticMarkup(
    <StructureSearchDialog
      isOpen
      usePortal={false}
      value={EMPTY}
      onClose={noop}
    />,
  );

  expect(markup).toContain('Filter by structure');

  for (const label of [
    'Contains',
    'Similar to',
    'Is exactly',
    'Any stereoisomer',
    'Any tautomer',
    'Benzene',
    'Trifluoromethyl',
    'Apply',
  ]) {
    expect(markup).toContain(`>${label}<`);
  }

  // The threshold belongs to a similarity search only.
  expect(markup).not.toContain('Minimum similarity');
});

test('a similarity search shows its threshold, and a site its own controls', () => {
  const markup = renderToStaticMarkup(
    <StructureSearchDialog
      isOpen
      usePortal={false}
      value={{ ...EMPTY, mode: 'similarity', threshold: 0.42 }}
      similarityControls={<span>FragFp</span>}
      onClose={noop}
    />,
  );

  expect(markup).toContain('aria-label="Minimum similarity"');
  // A threshold off the usual steps is still offered, so it stays selected.
  expect(markup).toContain('≥ 42 %');
  expect(markup).toContain('≥ 95 %');
  expect(markup).toContain('FragFp');
});

test('a site offers only its own modes and its own fragments', () => {
  const markup = renderToStaticMarkup(
    <StructureSearchDialog
      isOpen
      usePortal={false}
      value={EMPTY}
      modes={['substructure', 'exact']}
      examples={[{ label: 'Tropane', smiles: 'CN1C2CCC1CCC2' }]}
      onClose={noop}
    />,
  );

  expect(markup).toContain('>Contains<');
  expect(markup).toContain('>Is exactly<');
  expect(markup).not.toContain('>Similar to<');
  expect(markup).toContain('>Tropane<');
  expect(markup).not.toContain('>Benzene<');
});
