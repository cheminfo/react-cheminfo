// @vitest-environment jsdom
/**
 * What the export panel's Save and Copy do with the choices made in it: a
 * picture at the scale picked — every frame, when the scene holds several —
 * or, once Molfile is picked, the model itself, saved or copied.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Molecule3DFile } from '../../core/file.ts';
import { Molecule3DExport } from '../Molecule3DExport.tsx';

import { BlobUrl } from './blobUrl.ts';

const WATER: Molecule3DFile = {
  format: 'mol',
  data: `water
  OCL

  3  2  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.9600    0.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.2400    0.9300    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
M  END
`,
};

let host: HTMLDivElement;
let root: Root;
let asked: string[];
let clicks: MockInstance<() => void>;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('URL', BlobUrl);
  clicks = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  asked = [];
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('a picture is saved, and copied, at the scale picked', async () => {
  render();
  await press('Save');
  await press('Copy');

  expect(asked).toStrictEqual(['export png ×2 still', 'copy ×2']);
});

test('a scene of several frames saves them all, as an animation', async () => {
  render({ frameCount: 12 });
  await press('Save');

  expect(asked).toStrictEqual(['export png ×2 animated']);
});

test('once Molfile is picked, Save writes the model, named after the page and its dialect', async () => {
  render({ molfile: WATER, fileName: 'water' });
  await press('Molfile');
  await press('Save');

  expect(asked).toStrictEqual([]);
  expect(
    clicks.mock.contexts.map(
      (anchor) => (anchor as HTMLAnchorElement).download,
    ),
  ).toStrictEqual(['water-v2000.mol']);
});

test('a molfile the clipboard refuses says the copy failed', async () => {
  render({ molfile: WATER });
  await press('Molfile');
  await press('Copy');

  expect(asked).toStrictEqual([]);
  expect(host.textContent).toContain('Copy failed');
});

function render(
  props: {
    frameCount?: number;
    molfile?: Molecule3DFile;
    fileName?: string;
  } = {},
): void {
  act(() => {
    root.render(
      <Molecule3DExport
        getSize={() => ({ width: 400, height: 300 })}
        onExport={async (format, scale, animated) => {
          asked.push(
            `export ${format} ×${scale} ${animated ? 'animated' : 'still'}`,
          );
        }}
        onCopy={async (scale) => {
          asked.push(`copy ×${scale}`);
          return 'copied';
        }}
        {...props}
      />,
    );
  });
}

async function press(name: string): Promise<void> {
  const button = [...host.querySelectorAll('button')].find(
    (candidate) => candidate.textContent === name,
  );
  if (button === undefined) throw new Error(`no button named ${name}`);
  await act(async () => {
    button.click();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
}
