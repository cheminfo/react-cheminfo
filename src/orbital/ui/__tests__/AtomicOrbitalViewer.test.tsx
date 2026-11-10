// @vitest-environment jsdom
/**
 * What stands in front of the orbital canvas: a machine with no WebGL is told
 * why, in the site's words when it has some; one with WebGL waits on a note
 * while the canvas downloads, then gets the canvas, and an orbital it cannot
 * draw is reported under it — all inside the class the site sizes it by.
 *
 * The canvas needs WebGL, so its module is a stand-in that writes down the
 * props it is handed and reports a failure when clicked.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { AtomicOrbitalViewer } from '../AtomicOrbitalViewer.tsx';

const handed = vi.hoisted(() => [] as Array<Record<string, unknown>>);

vi.mock('../AtomicOrbitalCanvas.tsx', async () => {
  const { createElement } = await import('react');
  return {
    AtomicOrbitalCanvas: (props: {
      onFailureChange: (message: string | null) => void;
    }) => {
      handed.push(props);
      return createElement(
        'button',
        {
          type: 'button',
          onClick: () => props.onFailureChange('The sampler stopped.'),
        },
        'canvas',
      );
    },
  };
});

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

test('a machine with WebGL waits on the loading note, then gets the canvas with the orbital’s props', async () => {
  webgl(true);
  act(() => {
    root.render(
      <AtomicOrbitalViewer
        atomicNumber={26}
        orbitalId="3dz2"
        className="orbital"
      />,
    );
  });

  expect(host.textContent).toBe('Loading the 3D viewer…');
  expect(host.firstElementChild?.className).toBe('orbital');

  await act(() => import('../AtomicOrbitalCanvas.tsx'));

  expect(host.textContent).toBe('canvas');
  expect(Object.keys(handed[0] ?? {}).toSorted()).toStrictEqual([
    'atomicNumber',
    'onFailureChange',
    'orbitalId',
  ]);
  expect(handed[0]?.orbitalId).toBe('3dz2');
});

test('an orbital the canvas cannot draw is reported under it', async () => {
  webgl(true);
  act(() => {
    root.render(<AtomicOrbitalViewer atomicNumber={1} orbitalId="1s" />);
  });
  await act(() => import('../AtomicOrbitalCanvas.tsx'));
  act(() => {
    host.querySelector('button')?.click();
  });

  expect(host.querySelector('.bp6-callout')?.textContent).toBe(
    'This orbital could not be drawnThe sampler stopped.',
  );
});

test('a machine without WebGL is told why, inside the site’s class', () => {
  webgl(false);
  act(() => {
    root.render(
      <AtomicOrbitalViewer
        atomicNumber={1}
        orbitalId="1s"
        className="orbital"
      />,
    );
  });

  expect(host.textContent).toBe(
    'This browser could not create a WebGL context, so the 3D viewer cannot start. Enable hardware acceleration, or update the graphics driver.',
  );
  expect(host.firstElementChild?.classList.contains('orbital')).toBe(true);
  expect(handed).toStrictEqual([]);
});

test('a site may word the refusal itself', () => {
  webgl(false);
  act(() => {
    root.render(
      <AtomicOrbitalViewer
        atomicNumber={1}
        orbitalId="1s"
        renderUnsupported={(capability) =>
          `No orbitals here (${capability.reason}).`
        }
      />,
    );
  });

  expect(host.textContent).toBe('No orbitals here (noContext).');
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
