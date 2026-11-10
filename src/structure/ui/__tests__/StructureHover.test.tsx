// @vitest-environment jsdom
/**
 * The atom under the pointer of a drawn structure, handed to the page with the
 * index OpenChemLib gives it, and `null` once the pointer leaves it — what lets
 * a table beside the drawing light the row of that atom.
 *
 * The pointer is moved over the invisible target OpenChemLib writes over every
 * atom, the very element the drawing listens on.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { Structure } from '../Structure.tsx';

let host: HTMLDivElement;
let root: Root;
let hovers: Array<number | null>;

beforeAll(async () => {
  await import('../StructureSvg.tsx');
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  hovers = [];
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

async function render(listening: boolean): Promise<void> {
  await act(async () => {
    root.render(
      <Structure
        smiles="CCO"
        onAtomHover={listening ? (atom) => hovers.push(atom) : undefined}
      />,
    );
  });
}

function atomTarget(index: number): Element {
  const found = [...host.querySelectorAll('.event')].find((element) =>
    element.id.endsWith(`:Atom:${index}`),
  );
  if (found === undefined) throw new Error(`no target over atom ${index}`);
  return found;
}

function pointer(type: 'mouseover' | 'mouseout', element: Element): void {
  act(() => {
    element.dispatchEvent(new MouseEvent(type, { bubbles: true }));
  });
}

test('the atom under the pointer is handed over, then null once it leaves', async () => {
  await render(true);

  pointer('mouseover', atomTarget(2));
  pointer('mouseout', atomTarget(2));
  pointer('mouseover', atomTarget(0));

  expect(hovers).toStrictEqual([2, null, 0]);
});

test('a structure nobody listens to takes the pointer quietly', async () => {
  await render(false);

  pointer('mouseover', atomTarget(1));
  pointer('mouseout', atomTarget(1));

  expect(hovers).toStrictEqual([]);
});
