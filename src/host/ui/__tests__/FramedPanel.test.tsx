// @vitest-environment jsdom
/**
 * A sibling site framed in a panel: it waits behind a sentence while there is
 * nothing to hand over, and hands what the tool sends unasked to the page.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ToolDocument } from '../../core/connectToolTypes.ts';
import type { HostItem } from '../../core/protocol.ts';
import { FramedPanel } from '../FramedPanel.tsx';

import { TOOL_ORIGIN, startToolPage } from './framedToolPage.ts';
import { until } from './until.ts';

const PICKED: HostItem = {
  key: 'figure',
  kind: 'image.svg',
  value: { svg: '<svg/>' },
};

const SEARCH: ToolDocument = {
  document: 'cell:ethanol',
  items: [{ kind: 'chem.smiles', value: { smiles: 'CCO' } }],
  accept: ['figure'],
};

let host: HTMLDivElement;
let root: Root;
let stopTool: (() => void) | null = null;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('IntersectionObserver', undefined);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  stopTool?.();
  stopTool = null;
  host.remove();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

test('with no document, the panel says what to do and keeps the frame hidden', async () => {
  await act(async () => {
    root.render(
      <FramedPanel
        url={`${TOOL_ORIGIN}/?embed=1`}
        host="cell.cheminfo.org"
        name="3d.cheminfo.org"
        title="Models, on 3d.cheminfo.org"
        document={null}
        empty="Select a structure first."
      />,
    );
  });

  expect(host.querySelector('.framed-panel__note')?.textContent).toBe(
    'Select a structure first.',
  );
  expect(host.querySelector('iframe')?.hidden).toBe(true);
});

test('what the tool sends unasked reaches the page', async () => {
  const sent: HostItem[][] = [];
  await act(async () => {
    root.render(
      <FramedPanel
        url={`${TOOL_ORIGIN}/?embed=1`}
        host="cell.cheminfo.org"
        name="3d.cheminfo.org"
        title="Models, on 3d.cheminfo.org"
        document={SEARCH}
        onOutput={(items) => {
          sent.push([...items]);
        }}
      />,
    );
  });
  let held: HostItem[] = [];
  let changed: (() => void) | undefined;
  let loaded = false;
  stopTool = startToolPage(frameWindow(), {
    load: () => {
      loaded = true;
    },
    outputs: {
      read: () => held,
      subscribe: (listener) => {
        changed = listener;
        return stopNothing;
      },
    },
    outputDelay: 0,
  });
  await until(() => loaded && changed !== undefined);
  held = [PICKED];
  changed?.();
  await until(() => sent.length > 0);

  expect(sent).toStrictEqual([[PICKED]]);
});

function frameWindow(): Window {
  const frame = host.querySelector('iframe')?.contentWindow;
  if (!frame) throw new Error('no frame');
  return frame;
}

/** What subscribing hands back: nothing to stop in this tool page. */
function stopNothing(): void {
  // Nothing is listened to.
}
