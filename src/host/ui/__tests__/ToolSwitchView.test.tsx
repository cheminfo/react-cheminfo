// @vitest-environment jsdom
/**
 * A figure made on a sibling site over the whole page: Done reads the figure
 * back and hands it over before closing, a tool that gives nothing back is
 * said so, and Cancel before the tool answers closes at once.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { until } from '../../../__tests__/until.ts';
import { readFigureSource } from '../../../download/core/figureSource.ts';
import type { HostItem } from '../../core/protocol.ts';
import { ToolSwitchView } from '../ToolSwitchView.tsx';

import type { ToolSite } from './framedToolPage.ts';
import { TOOL_ORIGIN, startToolPage } from './framedToolPage.ts';

const DRAWN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40pt" height="20pt"><path d="M0 0h40"/></svg>';

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

async function open(
  site: ToolSite | null,
  onDone: (svg: string) => void,
  onClose: () => void,
): Promise<void> {
  await act(async () => {
    root.render(
      <ToolSwitchView
        url={`${TOOL_ORIGIN}/?embed=1`}
        host="cell.cheminfo.org"
        name="3d.cheminfo.org"
        title="A new structure, on 3d.cheminfo.org"
        label="Making the structure on 3d.cheminfo.org"
        doneLabel="Add to the figure"
        cancelQuestion="What was done there is lost."
        next="Cancel goes back to the figure."
        document={null}
        onDone={onDone}
        onClose={onClose}
      />,
    );
  });
  const frame = host.querySelector('iframe')?.contentWindow;
  if (frame === null || frame === undefined) throw new Error('no frame');
  if (site !== null) stopTool = startToolPage(frame, site);
}

function button(text: string): HTMLButtonElement {
  const found = [...host.querySelectorAll('button')].find(
    (item) => item.textContent === text,
  );
  if (found === undefined) throw new Error(`no button ${text}`);
  return found;
}

function figureSite(items: HostItem[]): ToolSite {
  return {
    load: () => undefined,
    outputs: {
      read: () => [],
      subscribe: () => stopNothing,
      render: { figure: () => Promise.resolve(items[0]) },
    },
  };
}

test('Done hands the figure over, then closes', async () => {
  const kept: string[] = [];
  let closed = 0;
  await open(
    figureSite([{ key: 'figure', kind: 'image.svg', value: { svg: DRAWN } }]),
    (svg) => {
      kept.push(svg);
    },
    () => {
      closed++;
    },
  );
  await until(() => !button('Add to the figure').disabled);

  expect(host.querySelector('.tool-switch__title')?.textContent).toBe(
    'A new structure, on 3d.cheminfo.org',
  );

  await act(async () => {
    button('Add to the figure').click();
  });
  await until(() => closed > 0);

  // The tool stamps the figure with where it came from, and nothing else
  // changes: a drawing in points comes back uncropped.
  expect(kept.map((svg) => readFigureSource(svg)?.site)).toStrictEqual(['3d']);
  expect(kept[0]?.replace(/<metadata>.*<\/metadata>/, '')).toBe(DRAWN);
  expect(closed).toBe(1);
});

test('a tool that hands nothing back is said so, and the view stays', async () => {
  let closed = 0;
  await open(
    figureSite([]),
    () => undefined,
    () => {
      closed++;
    },
  );
  await until(() => !button('Add to the figure').disabled);
  await act(async () => {
    button('Add to the figure').click();
  });
  await until(() => host.querySelector('.bp6-callout') !== null);

  expect(host.querySelector('.bp6-callout')?.textContent).toBe(
    'Nothing came back from 3d.cheminfo.org. Wait until the figure is shown, then try again.',
  );
  expect(closed).toBe(0);
});

test('Cancel before the tool answers closes at once', async () => {
  let closed = 0;
  await open(
    null,
    () => undefined,
    () => {
      closed++;
    },
  );

  expect(button('Add to the figure').disabled).toBe(true);

  await act(async () => {
    button('Cancel').click();
  });

  expect(closed).toBe(1);
});

/** What subscribing hands back: nothing to stop in these tool pages. */
function stopNothing(): void {
  // Nothing is listened to.
}
