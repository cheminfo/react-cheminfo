// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

import { tableGeometry } from '../../core/geometry.ts';
import { PeriodicTable } from '../PeriodicTable.tsx';
import { gridStyle, periodicTableMinWidth } from '../tableLayout.ts';
import { UNIT_PROPERTY, fallbackUnit, unitValue } from '../unit.ts';

test('a 32-column table sets the two series in their periods', () => {
  const html = renderToStaticMarkup(<PeriodicTable columns={32} headers />);

  expect(html.split('data-testid="element-')).toHaveLength(119);
  expect(cellStyle(html, 'La')).toContain('grid-column:4;grid-row:7');
  expect(cellStyle(html, 'Lu')).toContain('grid-column:18;grid-row:7');
  expect(cellStyle(html, 'Og')).toContain('grid-column:33;grid-row:8');
  expect(html).toContain('repeat(32, minmax(0, 1fr))');
  expect(html).not.toContain('57–71');
});

test('the 18-column table is the one drawn by default', () => {
  const html = renderToStaticMarkup(<PeriodicTable headers />);

  expect(cellStyle(html, 'La')).toContain('grid-column:4;grid-row:10');
  expect(html).toContain('repeat(18, minmax(0, 1fr))');
  expect(html).toContain('57–71');
});

test('the group numbers skip the fourteen columns of the f block', () => {
  const html = renderToStaticMarkup(<PeriodicTable columns={32} headers />);

  expect(html).toContain('grid-column:3;grid-row:1">2</div>');
  expect(html).toContain('grid-column:18;grid-row:1">3</div>');
  expect(html).toContain('grid-column:33;grid-row:1">18</div>');
  expect(html).toContain('grid-column:1;grid-row:8">7</div>');
  // The period numbers of the two lifted rows have no row to label.
  expect(html).not.toContain('grid-row:10">6</div>');
  expect(html).not.toContain('grid-row:11">7</div>');
});

test('the grid has seven rows, and an eighth only for the block labels', () => {
  const wide = gridStyle(false, false, tableGeometry(32));
  const labelled = gridStyle(true, true, tableGeometry(32));

  expect(wide.gridTemplateRows).toBe(
    'repeat(7, calc(var(--periodic-unit, 1cqw) * 6.8))',
  );
  expect(labelled.gridTemplateRows).toBe(
    'max(12px, calc(var(--periodic-unit, 1cqw) * 2)) repeat(7, calc(var(--periodic-unit, 1cqw) * 6.8)) max(12px, calc(var(--periodic-unit, 1cqw) * 2))',
  );
  expect(wide.minWidth).toBe(498);
});

test('the unit of a 32-column table is a column narrower, measured or not', () => {
  expect(unitValue(640)).toBe('6.400px');
  expect(unitValue(640, 32)).toBe('calc(6.400px * 0.5625)');
  expect(unitValue(640, 18)).toBe('6.400px');
  expect(fallbackUnit(18)).toBeUndefined();
  expect(fallbackUnit(32)).toBe('calc(1cqw * 0.5625)');
  expect(periodicTableMinWidth(18)).toBe(280);
  expect(periodicTableMinWidth(32)).toBe(498);

  const html = renderToStaticMarkup(<PeriodicTable columns={32} />);

  expect(html).toContain(`${UNIT_PROPERTY}:calc(1cqw * 0.5625)`);
});

test('switching the form rescales a measured table without waiting for a resize', () => {
  const observers: Array<(entries: unknown[]) => void> = [];
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: (entries: unknown[]) => void) {
        observers.push(callback);
      }

      observe(): void {
        // The test reports the size itself.
      }

      disconnect(): void {
        // Nothing to release.
      }
    },
  );
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);

  act(() => {
    root.render(<PeriodicTable />);
  });
  act(() => {
    for (const observer of observers) {
      observer([{ contentRect: { width: 900, height: 600 } }]);
    }
  });
  const table = host.firstElementChild as HTMLElement;

  expect(table.style.getPropertyValue(UNIT_PROPERTY)).toBe('9.000px');

  act(() => {
    root.render(<PeriodicTable columns={32} />);
  });

  expect(table.style.getPropertyValue(UNIT_PROPERTY)).toBe(
    'calc(9.000px * 0.5625)',
  );

  act(() => {
    root.render(<PeriodicTable />);
  });

  expect(table.style.getPropertyValue(UNIT_PROPERTY)).toBe('9.000px');

  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

/**
 * Where a cell is placed on the grid.
 * @param html - The rendered table.
 * @param symbol - Symbol of the cell.
 * @returns The first grid placement after the cell's test id: the cell's own.
 */
function cellStyle(html: string, symbol: string): string {
  const cell = html.split(`data-testid="element-${symbol}"`, 2)[1] ?? '';
  return /grid-column:[^;"]+;grid-row:[^;"]+/.exec(cell)?.[0] ?? '';
}
