// @vitest-environment jsdom
/**
 * A click on an atom or a bond of a drawn structure, handed to the page with
 * the index OpenChemLib gives it.
 *
 * OpenChemLib writes an invisible target over every atom and every bond of the
 * SVG, named after the drawing and the index, and the click is read off that
 * target — so the test clicks the very element the drawing wrote.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { Structure } from '../Structure.tsx';

let host: HTMLDivElement;
let root: Root;
let clicks: string[];

beforeAll(async () => {
  await import('../StructureSvg.tsx');
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  clicks = [];
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

async function render(clickable: boolean): Promise<void> {
  await act(async () => {
    root.render(
      <Structure
        smiles="CCO"
        onAtomClick={
          clickable ? (atom) => clicks.push(`atom ${atom}`) : undefined
        }
        onBondClick={
          clickable ? (bond) => clicks.push(`bond ${bond}`) : undefined
        }
      />,
    );
  });
}

function target(kind: 'Atom' | 'Bond', index: number): Element {
  const found = [...host.querySelectorAll('.event')].find((element) =>
    element.id.endsWith(`:${kind}:${index}`),
  );
  if (found === undefined) throw new Error(`no target over ${kind} ${index}`);
  return found;
}

function click(element: Element): void {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

test('the atom and the bond clicked are handed over by index', async () => {
  await render(true);

  click(target('Atom', 2));
  click(target('Bond', 1));

  expect(clicks).toStrictEqual(['atom 2', 'bond 1']);
});

test('a structure nobody listens to takes the click quietly', async () => {
  await render(false);

  click(target('Atom', 0));

  expect(clicks).toStrictEqual([]);
});
