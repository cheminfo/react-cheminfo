// @vitest-environment jsdom
/**
 * The chips under a crystal say how it is drawn, and a press asks for the
 * change: the packing, the box of the cell, the bonds, and the cells along
 * each axis.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { CrystalViewControls } from '../CrystalViewControls.tsx';
import { useCrystalCaption } from '../useCrystalCaption.ts';

let asked: string[];

beforeEach(() => {
  mountRoot();
  asked = [];
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

function renderControls() {
  act(() => {
    root.render(
      <CrystalViewControls
        packing="molecules"
        onPackingChange={(packing) => asked.push(`packing ${packing}`)}
        unitCell
        onUnitCellChange={(unitCell) => asked.push(`unit cell ${unitCell}`)}
        bonds="all"
        onBondsChange={(bonds) => asked.push(`bonds ${bonds}`)}
        cells={1}
        onCellsChange={(cells) => asked.push(`cells ${cells}`)}
      />,
    );
  });
}

function press(label: string): void {
  const button = [...host.querySelectorAll('button')].find(
    (candidate) => candidate.textContent === label,
  );
  if (button === undefined) throw new Error(`no chip ${label}`);
  act(() => {
    button.click();
  });
}

test('the chips in force are pressed, and the others are not', () => {
  renderControls();
  const pressed = [...host.querySelectorAll('button[aria-pressed="true"]')];

  expect(pressed.map((button) => button.textContent)).toStrictEqual([
    'Whole molecules',
    'Unit cell',
    'All',
    '1×1×1',
  ]);
});

test('a press asks for the packing, the box, the bonds and the cells it names', () => {
  renderControls();
  press('Atoms in the cell');
  press('Unit cell');
  press('No metal bonds');
  press('None');
  press('3×3×3');

  expect(asked).toStrictEqual([
    'packing cell',
    'unit cell false',
    'bonds noMetal',
    'bonds none',
    'cells 3',
  ]);
});

function Caption(props: { molecules: number; cells: number; asked: number }) {
  const caption = useCrystalCaption(
    'Aspirin',
    { molecules: props.molecules, atomsPerCell: 84, cells: props.cells },
    props.asked,
  );
  return <span>{caption}</span>;
}

test('the caption says what one cell holds and how many cells are drawn', () => {
  act(() => {
    root.render(<Caption molecules={4} cells={2} asked={2} />);
  });

  expect(host.textContent).toBe('Aspirin · 4 molecules per cell · 2×2×2 cells');

  act(() => {
    root.render(<Caption molecules={0} cells={1} asked={4} />);
  });

  expect(host.textContent).toBe(
    'Aspirin · 84 atoms per cell · 1×1×1 cells, as 4×4×4 would hold too many atoms',
  );
});
