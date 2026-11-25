// @vitest-environment jsdom
/**
 * The buttons of a panel's header explain themselves on the family's help
 * card, as the rail's icons do, never on Blueprint's dark tooltip.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  cardsAfterTheDelay,
  cross,
} from '../../../help/ui/__tests__/pointerCrossing.ts';
import { BackupMenu } from '../../../storage/ui/BackupMenu.tsx';
import { SidePanelStack } from '../SidePanelStack.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

const panels = [
  { id: 'spectra', title: 'Spectra', icon: 'chart' },
  { id: 'peaks', title: 'Peaks', icon: 'th' },
] as const;

function noop(): void {
  // The stack is rendered and hovered, never driven, in these tests.
}

/**
 * What the pointer is told on one control, the element drawn afresh.
 * @param element - What is drawn.
 * @param name - The control's accessible name.
 * @returns The text of every card open after the help delay.
 */
function helpOn(element: ReactElement, name: string): string[] {
  act(() => root.render(element));
  const target = Array.from(host.querySelectorAll('[aria-label]')).find(
    (one) => one.getAttribute('aria-label') === name,
  );
  if (target === undefined) throw new Error(`no control ${name}`);
  cross(target, { moved: true });
  const cards = cardsAfterTheDelay();
  act(() => root.render(<span />));
  act(() => {
    vi.runAllTimers();
  });
  return cards;
}

const STACK = (
  <SidePanelStack
    panels={panels}
    openPanelIds={['spectra', 'peaks']}
    onClose={noop}
  >
    {(panel) => <p>{panel.id}</p>}
  </SidePanelStack>
);

test('fold, focus and close open the family’s help card', () => {
  expect([
    helpOn(STACK, 'Fold the spectra panel'),
    helpOn(STACK, 'Focus on the peaks panel'),
    helpOn(STACK, 'Close the peaks panel'),
  ]).toStrictEqual([
    ['Fold this panel away'],
    [
      'Focus on this panel: fold every other one away. Shift-clicking its title bar does the same.',
    ],
    ['Close this panel'],
  ]);
});

test('the backup button opens the family’s help card', () => {
  expect(
    helpOn(
      <BackupMenu
        onBackup={() => Promise.resolve()}
        onRestore={() => Promise.resolve('')}
        accept=".zip"
      />,
      'Back up or restore everything this site keeps in your browser',
    ),
  ).toStrictEqual([
    'Back up or restore everything this site keeps in your browser',
  ]);
});
