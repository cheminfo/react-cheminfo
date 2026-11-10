import { expect, test } from 'vitest';

import { xpsCommand } from '../../core/xpsCommands.ts';
import { xpsDocumentationSections } from '../xpsDocumentationSections.tsx';

test('the documentation covers what an XPS viewer has to explain', () => {
  expect(xpsDocumentationSections.map((section) => section.id)).toStrictEqual([
    'opening',
    'energy',
    'chart',
    'backgrounds',
    'components',
    'composition',
    'panels',
    'window',
  ]);
});

test('the binding-energy convention is a section of its own', () => {
  const energy = xpsDocumentationSections[1];

  expect(energy?.id).toBe('energy');
  expect(energy?.title).toBe('Binding energy, and the axis it is drawn on');
});

test('every section is titled and says something', () => {
  for (const section of xpsDocumentationSections) {
    expect(section.title.length).toBeGreaterThan(0);
    expect(section.body).not.toBeNull();
  }
});

test('the documentation is the one command the header offers by a key', () => {
  expect(xpsCommand('documentation').shortcut?.keys).toStrictEqual(['h']);
  expect(xpsCommand('about').shortcut).toBeUndefined();
  expect(xpsCommand('fullScreen').shortcut).toBeUndefined();
});
