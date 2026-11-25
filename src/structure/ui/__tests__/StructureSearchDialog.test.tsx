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

test('an open dialog offers every mode, said what it finds, and the default fragments', () => {
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
    'Search the drawing',
    'Every molecule the drawing is part of.',
    'The same compound in any tautomeric form, its stereochemistry ignored.',
  ]) {
    expect(markup).toContain(`>${label}<`);
  }

  expect(markup).not.toContain('>Apply<');
  // The least similarity is set before Similar to is pressed.
  expect(markup).toContain('aria-label="Minimum similarity"');
  // The mode the dialog opened on is shown as the one in force.
  expect(markup.match(/aria-current="true"/g)).toHaveLength(1);
  expect(markup).toMatch(/aria-current="true"[^>]*><b [^>]*>Contains</);
});

test('a similarity search keeps its threshold, and a site adds its own controls', () => {
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
  expect(markup).not.toContain('Minimum similarity');
});

test('a site offers its own steps of similarity', () => {
  const markup = renderToStaticMarkup(
    <StructureSearchDialog
      isOpen
      usePortal={false}
      value={{ ...EMPTY, mode: 'similarity', threshold: 0.8 }}
      thresholds={[0.7, 0.8, 0.9, 1]}
      onClose={noop}
    />,
  );

  expect(markup).toContain('≥ 70 %');
  expect(markup).toContain('≥ 100 %');
  expect(markup).not.toContain('≥ 95 %');
});
