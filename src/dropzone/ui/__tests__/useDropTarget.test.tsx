// @vitest-environment jsdom
/**
 * A drop target that marks itself instead of raising a veil, inside a page
 * that takes drops too: which drags light which, and who gets the drop.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { DropTransfer } from '../../core/dropTransfer.ts';
import { listenToPagePaste } from '../../core/pagePaste.ts';
import { useDropTarget } from '../useDropTarget.ts';

import { fileEntry, folderEntry, itemsOf } from './dropEntries.ts';

const IMAGE = new File(['P5'], 'cells.pgm');

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

/**
 * A page taking files anywhere, holding a panel taking files itself; each
 * marks itself while a drag is over it.
 * @param props - Where each hands its drops.
 * @param props.page - The page's.
 * @param props.panel - The panel's.
 * @returns The page.
 */
function Page(props: {
  page: (transfer: DropTransfer) => void;
  panel: (transfer: DropTransfer) => void;
}): ReactElement {
  const outer = useDropTarget(props.page, { takesText: false });
  const inner = useDropTarget(props.panel, { takesText: false });
  return (
    <div id="page" data-over={outer.over} {...outer.targetProps}>
      <span id="bar">a bar</span>
      <div id="panel" data-over={inner.over} {...inner.targetProps}>
        <span id="row">a row</span>
      </div>
    </div>
  );
}

function render() {
  const handed = { page: vi.fn(), panel: vi.fn() };
  act(() => {
    root.render(<Page {...handed} />);
  });
  return handed;
}

function byId(id: string): HTMLElement {
  const found = host.querySelector<HTMLElement>(`#${id}`);
  if (found === null) throw new Error(`no #${id}`);
  return found;
}

function drag(
  type: string,
  target: Element,
  types: string[],
  relatedTarget: Element | null = null,
): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, {
    relatedTarget,
    dataTransfer: {
      types,
      files: types.includes('Files') ? [IMAGE] : [],
      getData: () => '',
      dropEffect: 'none',
    },
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

function marks(): string[] {
  return ['page', 'panel'].map((id) => byId(id).dataset.over ?? '');
}

test('a drag of files marks the part it is over, its children included, and only that part', () => {
  render();
  drag('dragenter', byId('bar'), ['Files']);
  const overBar = marks();
  drag('dragleave', byId('page'), ['Files'], byId('bar'));
  const stillOverBar = marks();
  drag('dragenter', byId('row'), ['Files']);
  drag('dragover', byId('row'), ['Files']);
  const overRow = marks();
  drag('dragleave', byId('panel'), ['Files'], null);
  drag('dragleave', byId('page'), ['Files'], null);

  expect([overBar, stillOverBar, overRow, marks()]).toStrictEqual([
    ['true', 'false'],
    ['true', 'false'],
    ['false', 'true'],
    ['false', 'false'],
  ]);
});

test('a drop goes to the innermost part taking it; a drag of anything but files marks nothing and is left to the browser', () => {
  const { page, panel } = render();
  const dropped = drag('drop', byId('row'), ['Files']);
  drag('drop', byId('bar'), ['Files']);
  const text = drag('dragover', byId('bar'), ['text/plain']);

  expect([
    panel.mock.calls,
    page.mock.calls,
    dropped.defaultPrevented,
    text.defaultPrevented,
    marks(),
  ]).toStrictEqual([
    [[{ kind: 'files', files: [IMAGE] }]],
    [[{ kind: 'files', files: [IMAGE] }]],
    true,
    false,
    ['false', 'false'],
  ]);
});

test('a paste is the page’s only while it accepts pastes, and never while a field has the focus', () => {
  const taken: DropTransfer[] = [];
  let accepting = false;
  const stop = listenToPagePaste((transfer) => taken.push(transfer), {
    takesText: false,
    accepts: () => accepting,
  });
  const field = document.createElement('input');
  document.body.append(field);
  const paste = (target: EventTarget) => {
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.assign(event, {
      clipboardData: { files: [IMAGE], getData: () => '' },
    });
    target.dispatchEvent(event);
    return event.defaultPrevented;
  };
  const refused = paste(document.body);
  accepting = true;
  const inField = paste(field);
  const taking = paste(document.body);
  stop();
  field.remove();

  expect([refused, inField, taking, taken]).toStrictEqual([
    false,
    false,
    true,
    [{ kind: 'files', files: [IMAGE] }],
  ]);
});

test('a drop taken asynchronously is told what could not be read once it is taken', async () => {
  const told: string[] = [];
  function Target(): ReactElement {
    const target = useDropTarget(
      async () => {
        await Promise.resolve();
        told.push('taken');
      },
      { walksFolders: true, onUnread: () => told.push('unread') },
    );
    return <div id="target" {...target.targetProps} />;
  }
  act(() => {
    root.render(<Target />);
  });
  const event = new Event('drop', { bubbles: true, cancelable: true });
  Object.assign(event, {
    relatedTarget: null,
    dataTransfer: {
      types: ['Files'],
      files: [new File([], 'a')],
      getData: () => '',
      dropEffect: 'none',
      items: [
        ...itemsOf([folderEntry('/a', [[fileEntry('/a/b.tif')]])]),
        { kind: 'file', getAsFile: () => null, webkitGetAsEntry: () => null },
      ],
    },
  });
  act(() => {
    byId('target').dispatchEvent(event);
  });

  await vi.waitFor(() => {
    expect(told).toStrictEqual(['taken', 'unread']);
  });
});
