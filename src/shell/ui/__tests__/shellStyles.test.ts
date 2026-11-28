import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

const STYLES = join(import.meta.dirname, '../../../../styles');

function stylesheet(name: string): string {
  return readFileSync(join(STYLES, name), 'utf8');
}

test('the classes a workbench is drawn with are styled by the chrome', () => {
  const chrome = stylesheet('chrome.css');

  expect(chrome).toContain(`.site-shell--fit {
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}`);
  expect(chrome).toContain(`.site-shell__main--fit {
  display: flex;
  min-height: 0;
  flex: 1 1 1px;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}`);
  expect(chrome).toContain(`.site-shell__main--fit-row {
  flex-direction: row;
}`);
});

test('the page sets the family’s grey behind the content, and prints on paper', () => {
  const page = stylesheet('page.css');

  expect(page).toContain(`html,
body {
  padding: 0;
  margin: 0;
  background: var(--surface-sunken);
  color: var(--text);
}`);
  expect(page).toContain(`@media print {`);
  expect(page).toContain('background: none;');
});
