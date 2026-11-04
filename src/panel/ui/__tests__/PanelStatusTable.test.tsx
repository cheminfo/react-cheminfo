// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { PanelLayout } from '../../core/panelLayout.ts';
import { PanelStatusTable } from '../PanelStatusTable.tsx';

const PANELS = [
  { id: 'structure', title: 'Structure info', icon: 'properties' },
  { id: 'object', title: 'Object', icon: 'edit' },
  { id: 'tlc', title: 'TLC', icon: 'column-layout' },
] as const;

let host: HTMLDivElement;
let root: Root;
const changes: PanelLayout[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  changes.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(
      <PanelStatusTable
        panels={PANELS}
        layout={{
          open: ['structure', 'object'],
          folded: ['object'],
          hidden: [],
        }}
        onChange={(layout) => {
          changes.push(layout);
        }}
      />,
    );
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

function optionOf(panel: string, label: string): HTMLButtonElement {
  const option = [
    ...host.querySelectorAll<HTMLButtonElement>(
      `[data-panel="${CSS.escape(panel)}"] [role="radio"]`,
    ),
  ].find((button) => button.textContent === label);
  if (!option) throw new Error(`no ${label} for ${panel}`);
  return option;
}

test('each panel shows how it stands', () => {
  expect(optionOf('structure', 'Open').getAttribute('aria-checked')).toBe(
    'true',
  );
  expect(optionOf('object', 'Folded').getAttribute('aria-checked')).toBe(
    'true',
  );
  expect(optionOf('tlc', 'Available').getAttribute('aria-checked')).toBe(
    'true',
  );
  expect(host.textContent).toContain(
    'A hidden panel leaves the bar, an available one waits behind its icon, and a folded or open one is shown.',
  );
});

test('a click sets the panel, and only it', () => {
  act(() => {
    optionOf('structure', 'Hidden').click();
  });

  expect(changes).toStrictEqual([
    { open: ['object'], folded: ['object'], hidden: ['structure'] },
  ]);
});
