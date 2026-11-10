// @vitest-environment jsdom
/**
 * The tooltip of the editor's toolbar: which button it names, its key, and
 * whether the button does anything in this editor.
 *
 * The toolbar is a canvas inside the editor's shadow root, so the probe builds
 * one and rests a real pointer on it. jsdom lays nothing out: the canvas is
 * given the height openchemlib draws it at, one CSS pixel per drawn pixel, in
 * which each button is a 21-pixel square inside a 2-pixel border.
 */

import type { ReactElement } from 'react';
import { act, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { ToolbarTooltip } from '../ToolbarTooltip.tsx';
import type { StructureEditorMode } from '../editorChange.ts';

let host: HTMLDivElement;
let root: Root;
let toolbar: HTMLCanvasElement;

function Editor(props: { mode: StructureEditorMode }): ReactElement {
  const container = useRef<HTMLDivElement>(null);
  return (
    <div ref={container} data-testid="editor">
      <ToolbarTooltip containerRef={container} mode={props.mode} />
    </div>
  );
}

async function render(mode: StructureEditorMode): Promise<void> {
  act(() => root.render(<Editor mode={mode} />));
  const container = host.querySelector('[data-testid="editor"]');
  const editor = document.createElement('div');
  const shadow = editor.attachShadow({ mode: 'open' });
  toolbar = document.createElement('canvas');
  Object.defineProperty(toolbar, 'offsetHeight', { value: 361 });
  shadow.append(toolbar);
  await act(async () => {
    container?.append(editor);
  });
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/**
 * Rest the pointer on a button until its tooltip opens.
 * @param column - The button's column, from zero.
 * @param row - The button's row, from zero.
 * @returns What the tooltip says, or null when none is open.
 */
function restOn(column: number, row: number): string | null {
  const event = new MouseEvent('pointermove', {
    clientX: 2 + 21 * column + 5,
    clientY: 2 + 21 * row + 5,
  });
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  act(() => {
    toolbar.dispatchEvent(event);
  });
  act(() => {
    vi.advanceTimersByTime(250);
  });
  return (
    document.querySelector('[data-testid="structure-editor-tooltip"]')
      ?.textContent ?? null
  );
}

test('nothing is drawn before a button has been hovered', async () => {
  await render('molecule');

  expect(host.querySelector('[data-testid="editor"]')?.innerHTML).toBe(
    '<div></div>',
  );
});

test('a button is named, with its key and what it does', async () => {
  await render('molecule');

  expect(restOn(0, 2)).toBe(
    'SelectSpaceDrag around atoms to select them: hold Alt for a rectangle, Shift to add to the selection. Drag a selection to move it, Shift-drag to copy it.',
  );
});

test('a reaction tool says it only works on a reaction', async () => {
  await render('molecule');

  expect(restOn(1, 2)).toBe(
    'Atom mappingmDrag from a reactant atom to the same atom in a product: both get the same number. Click a mapped atom to unmap it.Only when drawing a reaction.',
  );
});

test('in a reaction editor the same tool says nothing more', async () => {
  await render('reaction');

  expect(restOn(1, 2)).toBe(
    'Atom mappingmDrag from a reactant atom to the same atom in a product: both get the same number. Click a mapped atom to unmap it.',
  );
});

test('a tool no editor of ours runs says so', async () => {
  await render('molecule');

  expect(restOn(1, 4)).toBe(
    'TextPlace a text label in the drawing.Not available in this editor.',
  );
});

test('a pointer off the buttons opens nothing', async () => {
  await render('molecule');

  expect(restOn(3, 2)).toBeNull();
});
