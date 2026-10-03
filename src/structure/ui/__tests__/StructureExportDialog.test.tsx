import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { StructureExportDialog } from '../StructureExportDialog.tsx';

const CAFFEINE = 'CN1C=NC2=C1C(=O)N(C)C(=O)N2C';

function noop(): void {
  // The dialog is only being rendered to markup.
}

test('a closed dialog renders nothing, so its notations are never written', () => {
  const markup = renderToStaticMarkup(
    <StructureExportDialog
      isOpen={false}
      usePortal={false}
      smiles={CAFFEINE}
      onClose={noop}
    />,
  );

  expect(markup).not.toContain('structure-export__panes');
});

test('an open dialog is named and waits for the half that reads the structure', () => {
  const markup = renderToStaticMarkup(
    <StructureExportDialog
      isOpen
      usePortal={false}
      smiles={CAFFEINE}
      onClose={noop}
    />,
  );

  expect(markup).toContain('Export the structure');
  expect(markup).toContain('structure-export');
  // The panel is lazy, so what the shell renders on its own is the wait.
  expect(markup).toContain('Reading the structure…');
});
