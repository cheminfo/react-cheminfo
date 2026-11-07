import { afterEach, expect, test, vi } from 'vitest';

import type { HostMessageEvent, LoadedInput } from '../connectHost.ts';
import { connectHost } from '../connectHost.ts';
import type { ToolDocument, ToolWindowEvent } from '../connectTool.ts';
import { REQUEST_TIMEOUT, connectTool } from '../connectTool.ts';
import type { HostOutputs } from '../hostOutputs.ts';
import { OUTPUT_DELAY } from '../hostOutputs.ts';
import type { HostSettings } from '../hostSettings.ts';
import type {
  HostItem,
  OutputMessage,
  ToolInterface,
  ToolSettingField,
  ToolSettings,
} from '../protocol.ts';
import type { ToolHello } from '../toolMessages.ts';

const TOOL_ORIGIN = 'https://3d.cheminfo.org';

/** A site taking a structure, and handing back its picture and a conformer. */
const TOOL: ToolInterface = {
  name: '3d',
  inputs: [{ key: 'structure', kinds: ['chem.molfile', 'chem.smiles'] }],
  outputs: [
    { key: 'figure', kind: 'image.svg' },
    { key: 'conformer', kind: 'chem.molfile.3d' },
  ],
};

const ETHANOL: ToolDocument = {
  document: 'draw:ethanol',
  items: [{ kind: 'chem.smiles', value: { smiles: 'CCO' }, label: 'Ethanol' }],
};

const BENZENE: ToolDocument = {
  document: 'draw:benzene',
  items: [{ kind: 'chem.smiles', value: { smiles: 'c1ccccc1' } }],
};

/** What the tool's site does with what it is handed. */
interface Site {
  load?: (inputs: readonly LoadedInput[]) => void | Promise<void>;
  outputs?: HostOutputs;
  settings?: HostSettings;
}

/**
 * A page framing a tool, both halves in one test: the two windows are fakes
 * delivering each other's posts — dropping one sent to another origin, as the
 * browser does — and the port between them is a real `MessageChannel`.
 * @returns The host's connection, what it was told, and the means to start the
 * tool's page and to stop.
 */
function framePage() {
  const hostListeners = new Set<(event: ToolWindowEvent) => void>();
  const toolListeners = new Set<(event: HostMessageEvent) => void>();
  const parentWindow = {
    postMessage(message: unknown) {
      for (const listener of hostListeners) {
        listener({ data: message, source: frameWindow, origin: TOOL_ORIGIN });
      }
    },
  };
  const frameWindow = {
    postMessage(message: unknown, targetOrigin: string, ports: Transferable[]) {
      if (targetOrigin !== TOOL_ORIGIN) return;
      for (const listener of toolListeners) {
        listener({
          data: message,
          source: parentWindow,
          ports: ports as MessagePort[],
        });
      }
    },
  };
  const hellos: ToolHello[] = [];
  const outputs: OutputMessage[] = [];
  const settings: ToolSettings[] = [];
  const fields: Array<readonly ToolSettingField[]> = [];
  const connection = connectTool({
    frame: () => frameWindow,
    origin: TOOL_ORIGIN,
    host: { name: 'draw' },
    listen(listener) {
      hostListeners.add(listener);
      return () => hostListeners.delete(listener);
    },
    onHello: (tool) => hellos.push(tool),
    onOutput: (message) => outputs.push(message),
    onSettings: (message, described) => {
      settings.push(message);
      fields.push(described);
    },
  });
  let stopTool: (() => void) | null = null;

  return {
    connection,
    hellos,
    outputs,
    settings,
    fields,
    /**
     * Hear a message as if it was posted to the host's window.
     * @param event - The message, its window and its origin.
     */
    deliver(event: ToolWindowEvent) {
      for (const listener of hostListeners) listener(event);
    },
    frameWindow,
    /**
     * Load the tool's page in the frame, replacing the one there: it says
     * hello at once.
     * @param site - What the site does with what it is handed.
     */
    startTool(site: Site = {}) {
      stopTool?.();
      stopTool = connectHost({
        host: parentWindow,
        listen(listener) {
          toolListeners.add(listener);
          return () => toolListeners.delete(listener);
        },
        tool: TOOL,
        origin: TOOL_ORIGIN,
        build: { version: '1.2.1' },
        load: site.load ?? (() => undefined),
        ...(site.outputs === undefined ? {} : { outputs: site.outputs }),
        ...(site.settings === undefined ? {} : { settings: site.settings }),
      });
    },
    close() {
      connection.close();
      stopTool?.();
    },
  };
}

/**
 * Outputs a test sets the way a site's state would.
 * @param render - The outputs made on request.
 * @returns The outputs, and the means to change what they read.
 */
function siteOutputs(render?: HostOutputs['render']) {
  let items: HostItem[] = [];
  const listeners = new Set<() => void>();
  const outputs: HostOutputs = {
    read: () => items,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    ...(render === undefined ? {} : { render }),
  };
  return {
    outputs,
    set(next: HostItem[]) {
      items = next;
      for (const listener of listeners) listener();
    },
  };
}

/**
 * A conformer the tool hands back.
 * @param molfile - Its molfile.
 * @returns The output item.
 */
function conformer(molfile: string): HostItem {
  return { key: 'conformer', kind: 'chem.molfile.3d', value: { molfile } };
}

/**
 * A load that never ends: the tool is stuck.
 * @returns A promise that never settles.
 */
function never(): Promise<void> {
  return new Promise(() => {
    // Never settled.
  });
}

afterEach(() => {
  vi.useRealTimers();
});

test('a hello from another origin, or from another window, is not answered', () => {
  const page = framePage();
  const posted = vi.spyOn(page.frameWindow, 'postMessage');
  const hello = {
    type: 'cheminfo:hello',
    version: 1,
    tool: { name: '3d', origin: TOOL_ORIGIN, inputs: [], outputs: [] },
  };

  page.deliver({
    data: hello,
    source: page.frameWindow,
    origin: 'https://elsewhere.example',
  });
  page.deliver({ data: hello, source: {}, origin: TOOL_ORIGIN });
  page.deliver({
    data: { ...hello, version: 2 },
    source: page.frameWindow,
    origin: TOOL_ORIGIN,
  });

  expect(posted).not.toHaveBeenCalled();
  expect(page.hellos).toStrictEqual([]);

  page.close();
});

test('a document handed over before the tool says hello is shown once it does', async () => {
  const page = framePage();
  const loads: LoadedInput[][] = [];
  const shown = page.connection.load(ETHANOL);

  page.startTool({ load: (inputs) => void loads.push([...inputs]) });

  await expect(shown).resolves.toStrictEqual({
    status: 'loaded',
    used: [{ key: 'structure', kind: 'chem.smiles' }],
  });
  expect(page.hellos).toStrictEqual([
    {
      name: '3d',
      origin: TOOL_ORIGIN,
      build: { version: '1.2.1' },
      inputs: TOOL.inputs,
      outputs: TOOL.outputs,
    },
  ]);
  expect(loads).toStrictEqual([
    [
      {
        key: 'structure',
        item: ETHANOL.items[0],
        checked: { kind: 'chem.smiles', value: { smiles: 'CCO' } },
      },
    ],
  ]);

  page.close();
});

test('a newer document drops the one still waiting for an answer', async () => {
  const page = framePage();
  const first = page.connection.load(ETHANOL);
  const second = page.connection.load(BENZENE);
  page.startTool();

  await expect(first).resolves.toStrictEqual({ status: 'dropped' });
  await expect(second).resolves.toMatchObject({ status: 'loaded' });

  page.close();
});

test('a tool that reloads is handed the document on screen again', async () => {
  const page = framePage();
  const loads: string[] = [];
  const site: Site = {
    load: (inputs) => {
      const { value } = inputs[0]?.checked ?? {};
      loads.push((value as { smiles: string }).smiles);
    },
  };
  page.startTool(site);
  await page.connection.load(BENZENE);

  page.startTool(site);

  await vi.waitFor(() => {
    expect(loads).toStrictEqual(['c1ccccc1', 'c1ccccc1']);
  });

  expect(page.hellos).toHaveLength(2);

  page.close();
});

test('a document the tool cannot read is refused with its reason', async () => {
  const page = framePage();
  page.startTool({
    load: () => {
      throw new Error('The SMILES describes no atoms, so nothing was loaded.');
    },
  });

  await expect(page.connection.load(ETHANOL)).resolves.toStrictEqual({
    status: 'refused',
    error: {
      code: 'unreadable',
      message: 'The SMILES describes no atoms, so nothing was loaded.',
    },
  });

  page.close();
});

test('get answers what the tool reads, and what it renders on request', async () => {
  const page = framePage();
  const conformer: HostItem = {
    key: 'conformer',
    kind: 'chem.molfile.3d',
    value: { molfile: 'M  END' },
  };
  const render = vi.fn(async () => ({
    kind: 'image.svg',
    value: { svg: '<svg/>' },
  }));
  const site = siteOutputs({ figure: render });
  site.set([conformer]);
  page.startTool({ outputs: site.outputs });

  await expect(page.connection.get(['conformer'])).resolves.toStrictEqual([
    conformer,
  ]);
  expect(render).not.toHaveBeenCalled();
  await expect(
    page.connection.get(['figure', 'conformer']),
  ).resolves.toStrictEqual([
    conformer,
    { key: 'figure', kind: 'image.svg', value: { svg: '<svg/>' } },
  ]);
  expect(render).toHaveBeenCalledOnce();

  page.close();
});

test('a picture that cannot be made answers the get with its reason', async () => {
  const page = framePage();
  const site = siteOutputs({
    figure: () => Promise.reject(new Error('There is no picture to copy yet.')),
  });
  page.startTool({ outputs: site.outputs });

  await expect(page.connection.get(['figure'])).rejects.toThrow(
    'There is no picture to copy yet.',
  );

  page.close();
});

test('nothing can be asked of a tool that has not connected, or of a closed connection', async () => {
  const page = framePage();

  await expect(page.connection.get(['figure'])).rejects.toThrow(
    'The tool has not connected yet, so it has nothing to give.',
  );

  page.startTool();

  page.connection.close();

  await expect(page.connection.get(['figure'])).rejects.toThrow(
    'The tool is no longer connected.',
  );
  await expect(page.connection.load(ETHANOL)).resolves.toStrictEqual({
    status: 'dropped',
  });

  page.close();
});

test('the outputs a document accepts come back when they change', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const page = framePage();
  const site = siteOutputs();
  page.startTool({ outputs: site.outputs });
  await page.connection.load({ ...BENZENE, accept: ['conformer'] });

  site.set([conformer('first')]);
  vi.advanceTimersByTime(OUTPUT_DELAY);

  await vi.waitFor(() => {
    expect(page.outputs).toStrictEqual([
      {
        type: 'output',
        document: 'draw:benzene',
        items: [conformer('first')],
      },
    ]);
  });

  page.close();
});

test('a document left unanswered is dropped once the wait is over', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const page = framePage();
  page.startTool({ load: never });
  const shown = page.connection.load(ETHANOL);

  vi.advanceTimersByTime(REQUEST_TIMEOUT);

  await expect(shown).resolves.toStrictEqual({ status: 'dropped' });

  page.close();
});

/**
 * Settings a test sets the way a site's state would, reading only what it knows.
 * @param known - The settings the site has, and their first values.
 * @returns The settings, and the means to change one from inside the tool.
 */
function siteSettings(known: Record<string, string>) {
  const values = { ...known };
  const listeners = new Set<() => void>();
  function hear(): void {
    for (const listener of listeners) listener();
  }
  const settings: HostSettings = {
    read: () => ({ ...values }),
    apply(changed) {
      for (const name of Object.keys(values)) {
        const value = changed[name];
        if (value !== undefined) values[name] = value;
      }
      hear();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return {
    settings,
    set(name: string, value: string) {
      values[name] = value;
      hear();
    },
    hear,
  };
}

test('a tool says its settings when it connects, and a host changes them without a new document', async () => {
  const page = framePage();
  const site = siteSettings({ picture: 'localised', surface: '0.5' });
  const loads: string[] = [];
  page.startTool({
    settings: site.settings,
    load() {
      loads.push('load');
    },
  });

  await vi.waitFor(() => {
    expect(page.settings).toStrictEqual([
      { picture: 'localised', surface: '0.5' },
    ]);
  });

  page.connection.setSettings({ surface: '0.7', nothing: 'at all' });

  await vi.waitFor(() => {
    expect(page.settings).toStrictEqual([
      { picture: 'localised', surface: '0.5' },
      { picture: 'localised', surface: '0.7' },
    ]);
  });

  expect(loads).toStrictEqual([]);

  page.close();
});

test('a setting changed inside the tool reaches the host once, and a repeat stays quiet', async () => {
  const page = framePage();
  const site = siteSettings({ picture: 'localised' });
  page.startTool({ settings: site.settings });
  await vi.waitFor(() => {
    expect(page.settings).toHaveLength(1);
  });

  site.hear();
  site.set('picture', 'computed');

  await vi.waitFor(() => {
    expect(page.settings).toStrictEqual([
      { picture: 'localised' },
      { picture: 'computed' },
    ]);
  });

  page.close();
});

test('a tool reloaded in its frame says its settings again', async () => {
  const page = framePage();
  page.startTool({ settings: siteSettings({ surface: '0.5' }).settings });
  await vi.waitFor(() => {
    expect(page.settings).toHaveLength(1);
  });

  page.startTool({ settings: siteSettings({ surface: '0.85' }).settings });

  await vi.waitFor(() => {
    expect(page.settings).toStrictEqual([
      { surface: '0.5' },
      { surface: '0.85' },
    ]);
  });

  page.close();
});

test('a tool with no settings says nothing of them, and a host asking changes nothing', async () => {
  const page = framePage();
  page.startTool();
  await vi.waitFor(() => {
    expect(page.hellos).toHaveLength(1);
  });

  page.connection.setSettings({ surface: '0.7' });
  const outcome = await page.connection.load(ETHANOL);

  expect(outcome.status).toBe('loaded');
  expect(page.settings).toStrictEqual([]);

  page.close();
});

test('a tool describes its settings with their values, and a description that follows what it holds reaches the host', async () => {
  const page = framePage();
  const site = siteSettings({ conformer: 'c1', surface: '0' });
  let conformers = ['c1', 'c2'];
  const fieldsNow = (): ToolSettingField[] => [
    {
      key: 'conformer',
      label: 'Conformer',
      type: 'choice',
      choices: conformers.map((id) => ({ value: id, label: id })),
    },
    { key: 'surface', label: 'Surface', type: 'toggle' },
  ];
  page.startTool({ settings: { ...site.settings, fields: fieldsNow } });

  await vi.waitFor(() => {
    expect(page.fields).toStrictEqual([fieldsNow()]);
  });

  conformers = ['c1', 'c2', 'c3'];
  site.hear();

  await vi.waitFor(() => {
    expect(page.fields).toStrictEqual([
      [
        {
          key: 'conformer',
          label: 'Conformer',
          type: 'choice',
          choices: [
            { value: 'c1', label: 'c1' },
            { value: 'c2', label: 'c2' },
          ],
        },
        { key: 'surface', label: 'Surface', type: 'toggle' },
      ],
      fieldsNow(),
    ]);
  });

  expect(page.settings).toStrictEqual([
    { conformer: 'c1', surface: '0' },
    { conformer: 'c1', surface: '0' },
  ]);

  page.close();
});

test('settings asked before the tool connects are dropped, not thrown', () => {
  const page = framePage();

  expect(() => {
    page.connection.setSettings({ surface: '0.7' });
  }).not.toThrow();

  page.close();
});
