// @vitest-environment jsdom
/**
 * The About · Cite · Help of a framed tool, and its page opened on its own
 * site: each offered only once there is something behind it.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { Toolbar } from 'react-science/ui';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PLATFORM_WORK } from '../../../citation/core/platformPaper.ts';
import type { ToolHello } from '../../core/toolMessages.ts';
import type { FramedToolUtilitiesProps } from '../FramedToolUtilities.tsx';
import { FramedToolUtilities } from '../FramedToolUtilities.tsx';

const URL_FRAMED = 'https://3d.cheminfo.org/?embed=1&smiles=CCO';

const HELLO: ToolHello = {
  name: '3d',
  origin: 'https://3d.cheminfo.org',
  build: null,
  inputs: [],
  outputs: [],
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
  act(() => root.unmount());
  host.remove();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

async function render(props: Partial<FramedToolUtilitiesProps>): Promise<void> {
  await act(async () => {
    root.render(
      <Toolbar>
        <FramedToolUtilities
          url={URL_FRAMED}
          name="3d.cheminfo.org"
          tool={HELLO}
          host="draw.cheminfo.org"
          {...props}
        />
      </Toolbar>,
    );
    await Promise.resolve();
  });
}

function labels(): string[] {
  return [...host.querySelectorAll('[aria-label]')].map(
    (item) => item.getAttribute('aria-label') ?? '',
  );
}

function item(label: string): HTMLElement {
  const found = host.querySelector<HTMLElement>(
    `[aria-label="${CSS.escape(label)}"]`,
  );
  if (found === null) throw new Error(`no ${label}`);
  return found;
}

test('a tool that names no work and offers no help has its About and its page', async () => {
  await render({ tool: null });

  expect(labels()).toStrictEqual([
    'About 3d.cheminfo.org',
    'Open 3d.cheminfo.org in a new tab',
  ]);
});

test('a site with no About is not offered one', async () => {
  await render({ about: false });

  expect(labels()).toStrictEqual(['Open 3d.cheminfo.org in a new tab']);
});

test('the works the tool names and its help each get an item', async () => {
  await render({
    tool: {
      ...HELLO,
      cite: [PLATFORM_WORK],
      help: { title: 'Conformers', body: ['Rotate the molecule.'] },
    },
  });

  expect(labels()).toStrictEqual([
    'About 3d.cheminfo.org',
    'How to cite 3d.cheminfo.org',
    'How to use 3d.cheminfo.org',
    'Open 3d.cheminfo.org in a new tab',
  ]);
});

test("the About is the tool's own page, framed", async () => {
  await render({});

  expect(document.querySelector('.framed-tool-about')).toBeNull();

  act(() => {
    item('About 3d.cheminfo.org').click();
  });
  const frame = document.querySelector<HTMLIFrameElement>(
    '.framed-tool-about__frame',
  );

  expect(frame?.getAttribute('src')).toBe(
    'https://3d.cheminfo.org/about?embed=1',
  );
  expect(frame?.title).toBe('About 3d.cheminfo.org');

  act(() => {
    document.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click();
  });

  expect(document.querySelector('.bp6-overlay-open')).toBeNull();
});

test('the page opens on its own site; a tab the browser refuses is told', async () => {
  const open = vi.fn<typeof globalThis.open>(() => null);
  vi.stubGlobal('open', open);
  const onBlocked = vi.fn();
  await render({ onBlocked });

  act(() => {
    item('Open 3d.cheminfo.org in a new tab').click();
  });

  expect(open.mock.calls).toStrictEqual([
    ['https://3d.cheminfo.org/?smiles=CCO', '_blank', 'noopener'],
  ]);
  expect(onBlocked).not.toHaveBeenCalled();

  await render({
    onBlocked,
    document: {
      document: 'draw:ethanol',
      items: [{ kind: 'chem.smiles', value: { smiles: 'CCO' } }],
    },
  });
  act(() => {
    item('Open 3d.cheminfo.org in a new tab').click();
  });

  expect(onBlocked).toHaveBeenCalledOnce();
});
