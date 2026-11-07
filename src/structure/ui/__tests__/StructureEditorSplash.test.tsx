import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';

import { StructureEditorSplash } from '../StructureEditorSplash.tsx';

afterEach(() => {
  vi.unstubAllGlobals();
});

function textOf(markup: string): string {
  return markup
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

test('the splash says to draw, to click and paste with Ctrl V, and to drop a file', () => {
  vi.stubGlobal('navigator', { platform: 'Win32' });
  const markup = renderToStaticMarkup(<StructureEditorSplash importable />);

  expect(textOf(markup)).toBe(
    'Draw a structure with the tools on the left or click here and paste a molfile, a SMILES or an idCode with Ctrl V or drop a structure file on the drawing',
  );
  expect(markup).toContain('aria-hidden="true"');
  expect(markup).toContain('pointer-events:none');
  // Beside the toolbar, which openchemlib draws 46 px wide.
  expect(markup).toContain('inset:0 0 0 46px');
});

test('on a Mac the paste keys read ⌘ V, the modifier openchemlib listens to there', () => {
  vi.stubGlobal('navigator', { platform: 'MacIntel' });
  const markup = renderToStaticMarkup(<StructureEditorSplash importable />);

  expect(textOf(markup)).toContain('idCode with ⌘ V');
  expect(textOf(markup)).not.toContain('Ctrl');
});

test('a canvas that takes no file is not offered a drop', () => {
  vi.stubGlobal('navigator', { platform: 'Linux x86_64' });
  const markup = renderToStaticMarkup(
    <StructureEditorSplash importable={false} />,
  );

  expect(textOf(markup)).toBe(
    'Draw a structure with the tools on the left or click here and paste a molfile, a SMILES or an idCode with Ctrl V',
  );
});
