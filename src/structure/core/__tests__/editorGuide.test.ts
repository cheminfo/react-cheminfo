import { expect, test } from 'vitest';

import type { EditorGuideSection } from '../editorGuide.ts';
import {
  STRUCTURE_EDITOR_DOCS,
  editorGuideSections,
  editorKeyLabel,
} from '../editorGuide.ts';

function actionsOf(sections: EditorGuideSection[], title: string): string[] {
  const section = sections.find((candidate) => candidate.title === title);
  return section === undefined
    ? []
    : section.gestures.map((gesture) => gesture.action);
}

test('a molecule editor lists every section, flipping included', () => {
  const sections = editorGuideSections();

  expect(sections.map((section) => section.title)).toStrictEqual([
    'Pointer on an atom',
    'Pointer on a bond',
    'Anywhere',
    'Selecting',
    'Stereochemistry',
  ]);
  expect(actionsOf(sections, 'Anywhere')).toStrictEqual([
    'Undo',
    'Copy the structure',
    'Paste a molfile, a SMILES or an idCode',
    'Delete the selection',
    'Flip horizontally or vertically',
    'Open this guide',
  ]);
  expect(actionsOf(sections, 'Pointer on a bond')).not.toContain(
    'Edit its query features',
  );
});

test('query features are offered only when a fragment is drawn', () => {
  const sections = editorGuideSections({ fragment: true });

  expect(actionsOf(sections, 'Pointer on an atom')).toContain(
    'Edit its query features',
  );
  expect(actionsOf(sections, 'Pointer on an atom')).toContain(
    'Accept any halogen',
  );
  expect(actionsOf(sections, 'Pointer on a bond')).toContain(
    'Edit its query features',
  );
  expect(actionsOf(sections, 'Selecting')).toHaveLength(6);
});

test('a reaction cannot be flipped', () => {
  const sections = editorGuideSections({ mode: 'reaction' });

  expect(actionsOf(sections, 'Anywhere')).not.toContain(
    'Flip horizontally or vertically',
  );
});

test('the stereochemistry section is a note alone', () => {
  const stereo = editorGuideSections().at(-1);

  expect(stereo?.title).toBe('Stereochemistry');
  expect(stereo?.gestures).toStrictEqual([]);
  expect(stereo?.note).toMatch(/^Pink bonds flag a stereocentre/);
});

test('the shortcut modifier is shown as the platform names it', () => {
  expect(editorKeyLabel('Mod', true)).toBe('⌘');
  expect(editorKeyLabel('Mod', false)).toBe('Ctrl');
  expect(editorKeyLabel('z', true)).toBe('z');
});

test('the guide links the three pages of the full documentation', () => {
  expect(STRUCTURE_EDITOR_DOCS.map((link) => link.url)).toStrictEqual([
    'https://docs.nmrium.org/help/ocl/',
    'https://docs.nmrium.org/chemical_structure/ocl/atom-properties/',
    'https://docs.nmrium.org/ocl/stereochemistry/',
  ]);
});
