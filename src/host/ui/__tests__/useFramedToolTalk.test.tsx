// @vitest-environment jsdom
/**
 * A framed tool, talked to through the protocol by a tool page of its own:
 * greeted, handed the document, read back what it holds and what it sends
 * unasked, and told its settings.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ToolDocument } from '../../core/connectTool.ts';
import type { HostItem } from '../../core/protocol.ts';
import type { FramedTool } from '../useFramedTool.ts';
import { useFramedTool } from '../useFramedTool.ts';

import type { ToolSite } from './framedToolPage.ts';
import { TOOL_ORIGIN, startToolPage } from './framedToolPage.ts';
import { until } from './until.ts';

const TOOL_URL = `${TOOL_ORIGIN}/?embed=1`;

const ETHANOL: ToolDocument = {
  document: 'draw:ethanol',
  items: [{ kind: 'chem.smiles', value: { smiles: 'CCO' } }],
  accept: ['figure'],
};

const FIGURE: HostItem = {
  kind: 'image.svg',
  key: 'figure',
  value: { svg: '<svg/>' },
};

let host: HTMLDivElement;
let root: Root;
const seen: FramedTool[] = [];
let stopTool: (() => void) | null = null;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  // Where the browser cannot tell, the frame always counts as seen.
  vi.stubGlobal('IntersectionObserver', undefined);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  stopTool?.();
  stopTool = null;
  seen.length = 0;
  host.remove();
  vi.unstubAllGlobals();
});

function Framed(props: {
  document: ToolDocument | null;
  onOutput?: (items: readonly HostItem[]) => void;
}): ReactElement {
  const tool = useFramedTool({
    url: TOOL_URL,
    host: 'draw.cheminfo.org',
    document: props.document,
    ...(props.onOutput === undefined ? {} : { onOutput: props.onOutput }),
  });
  seen.push(tool);
  const { attachFrame } = tool;
  return <iframe ref={attachFrame} title="tool" />;
}

function current(): FramedTool {
  const tool = seen.at(-1);
  if (tool === undefined) throw new Error('nothing rendered');
  return tool;
}

/** What subscribing hands back: nothing to stop in these tool pages. */
function stopNothing(): void {
  // Nothing is listened to.
}

async function open(
  site: ToolSite,
  document: ToolDocument | null,
  onOutput?: (items: readonly HostItem[]) => void,
): Promise<void> {
  await act(async () => {
    root.render(
      <Framed
        document={document}
        {...(onOutput === undefined ? {} : { onOutput })}
      />,
    );
  });
  const frame = host.querySelector('iframe')?.contentWindow;
  if (frame === null || frame === undefined) throw new Error('no frame');
  stopTool = startToolPage(frame, site);
}

test('a tool that greets is connected, shows the document, and gives back what it holds', async () => {
  const loaded: unknown[] = [];
  await open(
    {
      load: (inputs) => {
        loaded.push(inputs.map(({ key, item }) => [key, item.value]));
      },
      outputs: { read: () => [FIGURE], subscribe: () => stopNothing },
    },
    ETHANOL,
  );
  await until(() => current().outputs.size > 0);

  const tool = current();

  expect(tool.status).toBe('connected');
  expect(tool.tool?.name).toBe('3d');
  expect(tool.tool?.origin).toBe(TOOL_ORIGIN);
  expect(loaded).toStrictEqual([[['structure', { smiles: 'CCO' }]]]);
  expect(tool.outcome).toStrictEqual({
    status: 'loaded',
    used: [{ key: 'structure', kind: 'chem.smiles' }],
  });
  expect([...tool.outputs]).toStrictEqual([['figure', FIGURE]]);
  await expect(tool.get(['figure'])).resolves.toStrictEqual([FIGURE]);
});

test('a document the tool cannot read comes back refused, with its reason', async () => {
  await open(
    {
      load: () => {
        throw new Error('No conformer for a lone atom.');
      },
    },
    ETHANOL,
  );
  await until(() => current().outcome !== null);

  expect(current().outcome).toStrictEqual({
    status: 'refused',
    error: { code: 'unreadable', message: 'No conformer for a lone atom.' },
  });
  expect(current().outputs.size).toBe(0);
});

test('a tool giving nothing back still shows the document, and holds nothing', async () => {
  await open({ load: () => undefined }, ETHANOL);
  const before = current().outputs;
  // The values the document accepts are asked for once it is shown, and the
  // tool's refusal leaves the host holding an empty set rather than failing.
  await until(() => current().outputs !== before);

  expect(current().outcome).toStrictEqual({
    status: 'loaded',
    used: [{ key: 'structure', kind: 'chem.smiles' }],
  });
  expect(current().outputs).not.toBe(before);
  expect(current().outputs.size).toBe(0);
});

test('a value the visitor changes in the tool is told and kept', async () => {
  let figure = FIGURE;
  let changed: (() => void) | undefined;
  const told: Array<readonly HostItem[]> = [];
  await open(
    {
      load: () => undefined,
      outputs: {
        read: () => [figure],
        subscribe: (listener) => {
          changed = listener;
          return stopNothing;
        },
      },
      outputDelay: 0,
    },
    ETHANOL,
    (items) => {
      told.push(items);
    },
  );
  await until(() => current().outputs.size > 0);

  const rotated = { ...FIGURE, value: { svg: '<svg id="rotated"/>' } };
  figure = rotated;
  changed?.();
  await until(() => told.length > 0);

  expect(told).toStrictEqual([[rotated]]);
  expect(current().outputs.get('figure')).toStrictEqual(rotated);
});

test('the settings the tool says are kept, and a host sets them without reloading it', async () => {
  let values: Record<string, string> = { surface: '0' };
  const asked: Array<Record<string, string>> = [];
  const listeners = new Set<() => void>();
  await open(
    {
      load: () => undefined,
      settings: {
        read: () => values,
        apply: (settings) => {
          asked.push({ ...settings });
          values = { ...values, ...settings };
          for (const listener of listeners) listener();
        },
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        fields: () => [{ type: 'toggle', key: 'surface', label: 'Surface' }],
      },
    },
    null,
  );
  await until(() => current().settings !== null);

  expect(current().settings).toStrictEqual({ surface: '0' });
  expect(current().settingFields).toStrictEqual([
    { type: 'toggle', key: 'surface', label: 'Surface' },
  ]);

  act(() => {
    current().setSettings({ surface: '1' });
  });
  await until(() => current().settings?.surface === '1');

  expect(asked).toStrictEqual([{ surface: '1' }]);
  expect(current().settings).toStrictEqual({ surface: '1' });
  expect(current().outcome).toBeNull();
});
