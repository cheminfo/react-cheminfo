// @vitest-environment jsdom
/**
 * The fields of the shapes selected, handing every change to the site as a
 * patch, the same for all of them or worked out from each.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { DrawGraphic, GraphicPatch } from '../../core/graphics.ts';
import type { Patching } from '../../core/shared.ts';
import { patchOf } from '../../core/shared.ts';
import { GraphicFields } from '../GraphicFields.tsx';

const RECTANGLES: DrawGraphic[] = [
  {
    type: 'graphic',
    id: 'd1',
    kind: 'rectangle',
    x: 0,
    y: 0,
    width: 20,
    height: 10,
    fill: '#e69f0080',
  },
  {
    type: 'graphic',
    id: 'd2',
    kind: 'rectangle',
    x: 0,
    y: 20,
    width: 30,
    height: 10,
    fill: '#56b4e9',
  },
];

const CURVE: DrawGraphic = {
  type: 'graphic',
  id: 'd3',
  kind: 'polyline',
  points: [
    { x: 0, y: 0 },
    { x: 10, y: -10 },
    { x: 20, y: 0 },
  ],
  smooth: true,
  controls: [
    null,
    { before: { x: 6, y: -10 }, after: { x: 14, y: -10 } },
    null,
  ],
};

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

function labels(selector: string): Array<string | null> {
  return [...host.querySelectorAll(selector)].map((element) =>
    element.getAttribute('aria-label'),
  );
}

// The buttons of the Tangents field.
function tangentButtons(): HTMLButtonElement[] {
  const group = [...host.querySelectorAll('.bp6-form-group')].find(
    (element) =>
      element.querySelector('label')?.textContent?.trim() === 'Tangents',
  );
  return [...(group?.querySelectorAll('button') ?? [])];
}

function button(label: string): HTMLButtonElement {
  const found = host.querySelector<HTMLButtonElement>(
    `button[aria-label="${CSS.escape(label)}"]`,
  );
  if (!found) throw new Error(`No button "${label}"`);
  return found;
}

test('rectangles offer their size, line, corners and fill, and a swatch keeps each opacity', () => {
  const patches: Array<Patching<GraphicPatch, DrawGraphic>> = [];
  act(() => {
    root.render(
      <GraphicFields
        graphics={RECTANGLES}
        style={{ lineWidth: 0.6 }}
        onChange={(patch) => {
          patches.push(patch);
        }}
      />,
    );
  });
  const NUMBERS = 'input:not([type="checkbox"])';

  expect(labels(NUMBERS)).toStrictEqual([
    'Shape width, in points',
    'Shape height, in points',
    "Width of the shape's line, in points",
    "Radius of the rectangle's corners, in points",
    'Opacity of the fill, in percent',
  ]);
  // The rectangles differ on their width and their fill opacity.
  expect(
    [...host.querySelectorAll<HTMLInputElement>(NUMBERS)].map(
      (input) => input.value,
    ),
  ).toStrictEqual(['', '10', '0.6', '0', '']);
  expect(host.textContent).not.toContain('Smooth');
  // Both are filled, so the outline may be left out of both.
  expect(host.textContent).toContain('Outline');

  act(() => {
    button('No fill').click();
  });
  act(() => {
    button('Filled in black').click();
  });

  expect(patches[0]).toStrictEqual({ fill: undefined });

  const [first, second] = RECTANGLES as [DrawGraphic, DrawGraphic];

  expect(patchOf(patches[1] ?? {}, first)).toStrictEqual({
    fill: '#00000080',
  });
  expect(patchOf(patches[1] ?? {}, second)).toStrictEqual({ fill: '#000000' });
  expect(patches).toHaveLength(2);
});

test('one curve offers its tangents, edited by the site and reset by a patch', () => {
  const patches: Array<Patching<GraphicPatch, DrawGraphic>> = [];
  const edits: boolean[] = [];
  const render = (editing: boolean) => {
    root.render(
      <GraphicFields
        graphics={[CURVE]}
        style={{ lineWidth: 0.6 }}
        onChange={(patch) => {
          patches.push(patch);
        }}
        editingTangents={editing}
        onEditTangents={(next) => {
          edits.push(next);
        }}
      />,
    );
  };
  act(() => {
    render(false);
  });

  expect(host.textContent).toContain('Smooth');

  const [edit, reset] = tangentButtons();

  expect(edit?.textContent).toBe('Edit');

  act(() => {
    (edit as HTMLButtonElement).click();
  });
  act(() => {
    render(true);
  });
  act(() => {
    (edit as HTMLButtonElement).click();
  });
  act(() => {
    (reset as HTMLButtonElement).click();
  });

  expect(edits).toStrictEqual([true, false]);
  expect(patches).toStrictEqual([{ controls: undefined }]);
});

test('without a way to edit them, the tangents offer only Reset', () => {
  act(() => {
    root.render(
      <GraphicFields
        graphics={[CURVE]}
        style={{ lineWidth: 0.6 }}
        onChange={() => undefined}
      />,
    );
  });

  expect(tangentButtons().map((element) => element.textContent)).toStrictEqual([
    'Reset',
  ]);
});
