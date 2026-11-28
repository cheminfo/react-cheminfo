// @vitest-environment jsdom
/**
 * The size a figure is saved and copied at: the drawing with a margin, a
 * journal column, or a size of its own typed side by side.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { POINTS_PER_CM } from '../../core/pages.ts';
import type { FigureSize } from '../../core/types.ts';
import { FigureField } from '../FigureField.tsx';
import type { PageChange } from '../PageField.tsx';

const FITTED = { x: 0, y: 0, width: 5.04 * POINTS_PER_CM, height: 70 };
const COLUMNS = { single: 8.5 * POINTS_PER_CM, double: 17.8 * POINTS_PER_CM };

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
});

function render(
  size: FigureSize | undefined,
  columns: { single: number; double: number } | undefined,
): Array<[FigureSize | undefined, PageChange]> {
  const changes: Array<[FigureSize | undefined, PageChange]> = [];
  act(() => {
    root.render(
      <FigureField
        size={size}
        columns={columns}
        fitted={FITTED}
        onChange={(next, how) => {
          changes.push([next, how]);
        }}
      />,
    );
  });
  return changes;
}

function pick(value: string): void {
  const select = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Figure size"]',
  );
  if (!select) throw new Error('no menu');
  act(() => {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

test('a figure fitting the drawing offers the journal columns, and says it keeps a margin', () => {
  const changes = render(undefined, COLUMNS);
  const labels: string[] = [];
  for (const option of host.querySelectorAll('option')) {
    labels.push(option.textContent ?? '');
  }

  expect(labels).toStrictEqual([
    'Fit the drawing',
    'One column, 8.5 cm wide',
    'Two columns, 17.8 cm wide',
    'Another size',
  ]);
  expect(host.textContent).toContain('Saved and copied with a 4 pt margin.');

  pick('column');

  expect(changes).toStrictEqual([[{ width: COLUMNS.single }, 'picked']]);
});

test('another size starts from the drawing, to the millimetre', () => {
  const changes = render(undefined, COLUMNS);

  pick('custom');

  expect(changes).toStrictEqual([
    [{ width: 5 * POINTS_PER_CM, height: 2.5 * POINTS_PER_CM }, 'picked'],
  ]);
});

test('a size of its own says when the drawing spills over it', () => {
  render({ width: 4 * POINTS_PER_CM }, COLUMNS);

  expect(host.textContent).toContain(
    'Centred on the drawing, which spills over and is cut.',
  );
  expect(
    host.querySelector('input[aria-label^="Figure width"]'),
  ).not.toBeNull();
});

test('without a journal, only fitting the drawing or another size is offered', () => {
  render({ width: 10 * POINTS_PER_CM, height: 10 * POINTS_PER_CM }, undefined);
  const select = host.querySelector<HTMLSelectElement>('select');

  expect(select?.value).toBe('custom');
  expect(host.querySelectorAll('option')).toHaveLength(2);
  expect(host.textContent).toContain(
    'Centred on the drawing. An empty side fits it.',
  );
});
