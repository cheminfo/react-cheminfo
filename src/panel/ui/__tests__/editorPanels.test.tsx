// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import type { EditorPanel } from '../EditorPanels.tsx';
import { EditorPanelRail, EditorPanelStack } from '../EditorPanels.tsx';

type PanelId = 'page' | 'figures' | 'properties';

const PANELS: Array<EditorPanel<PanelId>> = [
  { id: 'page', title: 'Page setup', icon: 'document' },
  { id: 'figures', title: 'Figures', icon: 'folder-close' },
  { id: 'properties', title: 'Properties', icon: 'properties' },
];

const BODIES = {
  page: () => <p>the page body</p>,
  figures: () => <p>the figures body</p>,
  properties: () => <p>the properties body</p>,
};

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
});

function railButtons(): Array<string | undefined> {
  const names: Array<string | undefined> = [];
  for (const button of host.querySelectorAll<HTMLElement>('[data-panel-id]')) {
    names.push(button.dataset.panelId);
  }
  return names;
}

test('the stack draws the bodies of the panels on screen, off the printed page', () => {
  const closed: PanelId[] = [];
  act(() => {
    root.render(
      <EditorPanelStack
        panels={PANELS}
        bodies={BODIES}
        shown={['figures', 'properties']}
        folded={[]}
        onClose={(panel) => closed.push(panel)}
        onFolded={() => undefined}
      />,
    );
  });

  expect(host.querySelector('.editor-panel-stack')?.className).toBe(
    'editor-panel-stack no-print',
  );
  expect(host.textContent).toContain('the figures body');
  expect(host.textContent).toContain('the properties body');
  expect(host.textContent).not.toContain('the page body');
});

test('a stack printed with the page carries no no-print class', () => {
  act(() => {
    root.render(
      <EditorPanelStack
        panels={PANELS}
        bodies={BODIES}
        shown={['page']}
        folded={[]}
        onClose={() => undefined}
        onFolded={() => undefined}
        print
      />,
    );
  });

  expect(host.querySelector('.editor-panel-stack')?.className).toBe(
    'editor-panel-stack',
  );
});

test('the rail lists every panel, or only those offered, in its own order', () => {
  const toggled: PanelId[] = [];
  act(() => {
    root.render(
      <EditorPanelRail
        panels={PANELS}
        shown={['figures']}
        onToggle={(panel) => toggled.push(panel)}
      />,
    );
  });

  expect(railButtons()).toStrictEqual(['page', 'figures', 'properties']);

  act(() => {
    root.render(
      <EditorPanelRail
        panels={PANELS}
        offered={['properties', 'page']}
        shown={[]}
        onToggle={(panel) => toggled.push(panel)}
      />,
    );
  });

  expect(railButtons()).toStrictEqual(['page', 'properties']);

  act(() => {
    host.querySelector<HTMLElement>('[data-panel-id="properties"]')?.click();
  });

  expect(toggled).toStrictEqual(['properties']);
});
