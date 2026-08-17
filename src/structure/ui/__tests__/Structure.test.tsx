import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, expect, test, vi } from 'vitest';

import { Structure } from '../Structure.tsx';

// The renderers are loaded through React.lazy, and renderToStaticMarkup is
// synchronous: without this throwaway render it would only ever see the box
// they load into.
beforeAll(async () => {
  await vi.waitFor(() => {
    if (!renderToStaticMarkup(<Structure smiles="CCCC" />).includes('<svg')) {
      throw new Error('the renderers have not been loaded yet');
    }
  });
});

test('a structure is drawn as an svg', () => {
  const markup = renderToStaticMarkup(<Structure smiles="CCCC" />);

  expect(markup).toContain('<svg');
  expect(markup).not.toContain('—');
});

test('nothing to draw is a quiet placeholder of the asked size', () => {
  const markup = renderToStaticMarkup(<Structure width={80} height={40} />);

  expect(markup).not.toContain('<svg');
  expect(markup).toContain('width:80px');
  expect(markup).toContain('height:40px');
  expect(markup).toContain('—');
});

test('the placeholder can say something of the caller’s own', () => {
  const markup = renderToStaticMarkup(
    <Structure fallback="no ligand" molfile="" />,
  );

  expect(markup).toContain('no ligand');
});

test('a structure that cannot be read falls back rather than breaking', () => {
  const markup = renderToStaticMarkup(
    <Structure smiles="this is not a smiles" fallback="unreadable" />,
  );

  expect(markup).toContain('unreadable');
});

test('a caption is written on the picture', () => {
  const markup = renderToStaticMarkup(
    <Structure smiles="CCCC" labels={{ caption: 'butane' }} />,
  );

  expect(markup).toContain('butane');
});
