// @vitest-environment jsdom
/**
 * An area of a page that takes a structure file, or structure text dragged
 * from another page, under the same veil the editor raises.
 *
 * jsdom has no `DataTransfer`, so each drag carries a plain object with the
 * three things the drop reads: its types, its files and its text.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { StructureTransfer } from '../../core/structureTransfer.ts';
import type { StructureDropProps } from '../StructureDrop.tsx';
import { StructureDrop } from '../StructureDrop.tsx';

let host: HTMLDivElement;
let root: Root;
let dropped: StructureTransfer[];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  dropped = [];
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function render(props: Partial<StructureDropProps> = {}): HTMLElement {
  act(() =>
    root.render(
      <StructureDrop
        onDrop={(transfer) => dropped.push(transfer)}
        className="drop-area"
        style={{ minHeight: 100 }}
        {...props}
      >
        <p>The table</p>
      </StructureDrop>,
    ),
  );
  const area = host.querySelector<HTMLElement>('.drop-area');
  if (area === null) throw new Error('no drop area');
  return area;
}

function drag(
  target: Element | null,
  type: string,
  carried: { text?: string; files?: File[] },
): Event {
  const files = carried.files ?? [];
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      types: files.length > 0 ? ['Files'] : ['text/plain'],
      files,
      dropEffect: 'none',
      getData: (format: string) =>
        format === 'text' ? (carried.text ?? '') : '',
    },
  });
  act(() => {
    target?.dispatchEvent(event);
  });
  return event;
}

function overlay(): Element | null {
  return host.querySelector('[data-testid="structure-drop-overlay"]');
}

test('the area keeps its class and its style, and is positioned for the veil', () => {
  const area = render();

  expect(area.style.position).toBe('relative');
  expect(area.style.minHeight).toBe('100px');
  expect(area.textContent).toBe('The table');
});

test('text dragged over raises the veil, and dropped is handed over unread', () => {
  const area = render();

  drag(area, 'dragenter', { text: 'CCO' });

  expect(overlay()?.textContent).toBe('Drop to load the structure');

  const drop = drag(overlay(), 'drop', { text: '  CCO\n' });

  expect(drop.defaultPrevented).toBe(true);
  expect(dropped).toStrictEqual([{ kind: 'text', text: 'CCO' }]);
  expect(overlay()).toBeNull();
});

test('a file is handed over as a file, under the page’s own words', () => {
  const area = render({ label: 'Drop to add the molecules' });
  const file = new File(['CCO'], 'one.smi');

  drag(area, 'dragenter', { files: [file] });

  expect(overlay()?.textContent).toBe('Drop to add the molecules');

  drag(overlay(), 'drop', { files: [file] });

  expect(dropped).toStrictEqual([{ kind: 'files', files: [file] }]);
});

test('a drop carrying nothing is ignored, and leaving lowers the veil', () => {
  const area = render();

  drag(area, 'dragenter', { text: 'CCO' });
  const drop = drag(overlay(), 'drop', { text: ' '.repeat(3) });

  expect(drop.defaultPrevented).toBe(false);
  expect(dropped).toStrictEqual([]);

  drag(area, 'dragenter', { text: 'CCO' });
  drag(overlay(), 'dragleave', {});

  expect(overlay()).toBeNull();
});

test('a disabled area takes no drag', () => {
  const area = render({ disabled: true });

  const enter = drag(area, 'dragenter', { text: 'CCO' });

  expect(enter.defaultPrevented).toBe(false);
  expect(overlay()).toBeNull();
});
