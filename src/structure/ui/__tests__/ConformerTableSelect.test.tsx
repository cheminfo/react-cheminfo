// @vitest-environment jsdom
/**
 * Picking a conformer in the table: by clicking its row, or by walking the
 * rows with the arrows, and the picked row brought into view.
 *
 * The table is controlled, so what it asks for is read off `onSelect`; jsdom
 * scrolls nothing, so whether a row was asked into view is read off a spy.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Conformer } from '../../core/conformers.ts';
import type { MolfileExport } from '../../core/molfileExport.ts';
import type { ConformerTableProps } from '../ConformerTable.tsx';
import { ConformerTable } from '../ConformerTable.tsx';

/** A row never reads the molfile, so one empty export stands in for all. */
const MOLFILE = { data: '', version: 'v2000' } as unknown as MolfileExport;

/** Butane: anti lowest, then the two gauche wells 0.782 kcal/mol up. */
const BUTANE: Conformer[] = [
  {
    id: 1,
    molfile: MOLFILE,
    energy: -5.076,
    relativeEnergy: 0,
    refinement: null,
  },
  {
    id: 2,
    molfile: MOLFILE,
    energy: -4.294,
    relativeEnergy: 0.782,
    refinement: null,
  },
  {
    id: 3,
    molfile: MOLFILE,
    energy: -4.294,
    relativeEnergy: 0.782,
    refinement: null,
  },
];

let host: HTMLDivElement;
let root: Root;
let picked: Array<string | number>;
let scrollIntoView: Mock<() => void>;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  picked = [];
  scrollIntoView = vi.fn<() => void>();
  Element.prototype.scrollIntoView = scrollIntoView;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  vi.unstubAllGlobals();
});

function render(props: Partial<ConformerTableProps> = {}): void {
  act(() =>
    root.render(
      <ConformerTable
        conformers={BUTANE}
        onSelect={(id) => picked.push(id)}
        {...props}
      />,
    ),
  );
}

function row(id: number): HTMLTableRowElement {
  const found = host.querySelector<HTMLTableRowElement>(
    `tr[data-conformer-id="${CSS.escape(String(id))}"]`,
  );
  if (found === null) throw new Error(`no row for conformer ${id}`);
  return found;
}

function arrow(key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    host.querySelector('tbody')?.dispatchEvent(event);
  });
  return event;
}

test('a click on a row asks for that conformer', () => {
  render({ selectedId: 1 });

  act(() => {
    row(3).click();
  });

  expect(picked).toStrictEqual([3]);
});

test('the arrows walk the rows from the one picked', () => {
  render({ selectedId: 1 });

  arrow('ArrowDown');
  arrow('End');

  expect(picked).toStrictEqual([2, 3]);
});

test('an arrow at the end of the list asks for nothing, and keeps the page still', () => {
  render({ selectedId: 3 });

  const event = arrow('ArrowDown');

  expect(picked).toStrictEqual([]);
  expect(event.defaultPrevented).toBe(true);
});

test('a table nobody picks from ignores the arrows and the clicks', () => {
  render({ onSelect: undefined, selectedId: 1 });

  const event = arrow('ArrowDown');
  act(() => {
    row(2).click();
  });

  expect(event.defaultPrevented).toBe(false);
  expect(picked).toStrictEqual([]);
});

test('the row picked is brought into view, each time another is picked', () => {
  render({ selectedId: null });

  expect(scrollIntoView).not.toHaveBeenCalled();

  render({ selectedId: 2 });
  render({ selectedId: 3 });

  expect(scrollIntoView.mock.contexts).toStrictEqual([row(2), row(3)]);
});

test('a conformer the refinement never ranked has no force-field rank', () => {
  render({ columns: ['id', 'forceFieldRank'] });

  expect(row(1).cells[1]?.textContent).toBe('—');
});
