import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { StructureEditorHelp } from '../StructureEditorHelp.tsx';

function headingsOf(html: string): string[] {
  return [...html.matchAll(/<h4[^>]*>(?<title>[^<]+)<\/h4>/g)].map(
    (match) => match.groups?.title ?? '',
  );
}

test('the guide lists its sections and links the full documentation', () => {
  const html = renderToStaticMarkup(<StructureEditorHelp />);

  expect(headingsOf(html)).toStrictEqual([
    'Pointer on an atom',
    'Pointer on a bond',
    'Anywhere',
    'Selecting',
    'Stereochemistry',
  ]);
  expect(html).toContain('href="https://docs.nmrium.org/help/ocl/"');
  expect(html).toContain(
    'href="https://docs.nmrium.org/chemical_structure/ocl/atom-properties/"',
  );
  expect(html).toContain('href="https://docs.nmrium.org/ocl/stereochemistry/"');
  expect(html).toContain('Flip horizontally or vertically');
  expect(html).not.toContain('Edit its query features');
});

test('a fragment editor explains its query features', () => {
  const html = renderToStaticMarkup(<StructureEditorHelp fragment />);

  expect(html.match(/Edit its query features/g)).toHaveLength(2);
  expect(html).toContain('Accept any halogen');
});

test('every key is drawn as a key cap', () => {
  const html = renderToStaticMarkup(<StructureEditorHelp mode="reaction" />);

  expect(html).not.toContain('Flip horizontally or vertically');
  expect(html.match(/<kbd class="bp6-key">/g)).toHaveLength(38);
});
