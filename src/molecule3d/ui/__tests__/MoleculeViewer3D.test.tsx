// @vitest-environment jsdom
/**
 * What stands in front of the molecule canvas: a machine with no WebGL is told
 * why, in the site's words when it has some; one with WebGL waits on a note
 * while the canvas downloads, then gets the canvas, and a molecule it cannot
 * draw is reported under it.
 *
 * The canvas needs WebGL, so its module is a stand-in that writes down the
 * props it is handed and reports a failure when clicked.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { MoleculeViewer3D } from '../MoleculeViewer3D.tsx';

const handed = vi.hoisted(() => [] as Array<Record<string, unknown>>);

vi.mock('../MoleculeCanvas3D.tsx', async () => {
  const { createElement } = await import('react');
  return {
    MoleculeCanvas3D: (props: {
      onFailureChange: (message: string | null) => void;
    }) => {
      handed.push(props);
      return createElement(
        'button',
        {
          type: 'button',
          onClick: () => props.onFailureChange('The file holds no atoms.'),
        },
        'canvas',
      );
    },
  };
});

const MOLFILE = { format: 'mol', data: 'water' } as const;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  handed.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('a machine with WebGL waits on a note, then gets the canvas with every prop but the viewer’s own', async () => {
  webgl(true);
  act(() => {
    root.render(
      <MoleculeViewer3D
        molfile={MOLFILE}
        fallback="Fetching molstar"
        renderUnsupported={() => 'never'}
      />,
    );
  });

  expect(host.textContent).toBe('Fetching molstar');

  await act(() => import('../MoleculeCanvas3D.tsx'));

  expect(host.textContent).toBe('canvas');
  expect(Object.keys(handed[0] ?? {}).toSorted()).toStrictEqual([
    'molfile',
    'onFailureChange',
  ]);
  expect(handed[0]?.molfile).toBe(MOLFILE);
});

test('a molecule the canvas cannot draw is reported under it', async () => {
  webgl(true);
  act(() => {
    root.render(<MoleculeViewer3D molfile={MOLFILE} />);
  });
  await act(() => import('../MoleculeCanvas3D.tsx'));
  act(() => {
    host.querySelector('button')?.click();
  });

  expect(host.querySelector('.bp6-callout')?.textContent).toBe(
    'The viewer could not draw thisThe file holds no atoms.',
  );
});

test('a machine without WebGL is told why, and nothing is downloaded', () => {
  webgl(false);
  act(() => {
    root.render(<MoleculeViewer3D molfile={MOLFILE} />);
  });

  expect(host.textContent).toBe(
    'This browser could not create a WebGL context, so the 3D viewer cannot start. Enable hardware acceleration, or update the graphics driver.',
  );
  expect(handed).toStrictEqual([]);
});

test('a site may word the refusal itself', () => {
  webgl(false);
  act(() => {
    root.render(
      <MoleculeViewer3D
        molfile={MOLFILE}
        renderUnsupported={(capability) => `No 3D here (${capability.reason}).`}
      />,
    );
  });

  expect(host.textContent).toBe('No 3D here (noContext).');
});

/**
 * Make every canvas hand out a WebGL2 context, or none at all.
 * @param available - Whether the machine has WebGL.
 */
function webgl(available: boolean): void {
  const context = { getExtension: () => null };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    available ? (context as unknown as RenderingContext) : null,
  );
}
