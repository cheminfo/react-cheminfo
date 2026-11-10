// @vitest-environment jsdom
/**
 * The export panel's callbacks, bound to a canvas and a stand-in viewer: the
 * size of the canvas on screen, a picture rendered at a multiple of it and
 * saved, sent, copied or handed on — and a viewer with nothing to picture
 * saying so.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { pngDpi } from '../../../download/core/pngDpi.ts';
import type { ImageSize } from '../../core/exportImage.ts';
import type { SceneCapture } from '../exportMoleculeImage.ts';
import type { ImageExport } from '../useImageExport.ts';
import { useImageExport } from '../useImageExport.ts';

import { BlobUrl } from './blobUrl.ts';

/** A 1 × 1 PNG. */
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==';

let host: HTMLDivElement;
let root: Root;
let container: HTMLDivElement;
let viewerRef: { current: SceneCapture | null };
let asked: string[];
/** What every render of the probe was handed, the latest last. */
const rendered: ImageExport[] = [];
let clicks: MockInstance<() => void>;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  container = document.createElement('div');
  document.body.append(host, container);
  root = createRoot(host);
  asked = [];
  rendered.length = 0;
  viewerRef = { current: standInViewer() };
  layOut(300.4, 200.6);
  vi.stubGlobal('URL', BlobUrl);
  clicks = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('the canvas size is its laid-out box in whole pixels, and nothing before it is laid out', () => {
  mount(container);

  expect(exported()?.canvasSize()).toStrictEqual({ width: 300, height: 201 });

  layOut(0, 200);

  expect(exported()?.canvasSize()).toBeNull();

  mount(null);

  expect(exported()?.canvasSize()).toBeNull();
});

test('a picture is rendered at a multiple of the canvas and saved under the file name', async () => {
  mount(container, 'ethanol');

  await exported()?.exportImage('png', 2);

  expect(asked).toStrictEqual(['image 600x402']);
  expect(downloads()).toStrictEqual(['ethanol.png']);
});

test('an animated picture is every frame of the scene, as one looping PNG', async () => {
  mount(container, 'trajectory');

  const file = await exported()?.imageFile('png', 1, true);
  const bytes = new Uint8Array(
    (await file?.arrayBuffer()) ?? new ArrayBuffer(0),
  );
  const text = new TextDecoder('latin1').decode(bytes);

  expect(file?.name).toBe('trajectory.png');
  expect(file?.type).toBe('image/png');
  expect(asked).toStrictEqual(['frames 300x201']);
  expect(text.slice(1, 4)).toBe('PNG');
  expect(text).toContain('acTL');
});

test('a still picture is asked of a viewer that has no frames at all', async () => {
  viewerRef.current = { ...standInViewer(), frames: undefined };
  mount(container, 'still');

  const file = await exported()?.imageFile('png', 1);

  expect(file?.name).toBe('still.png');
  await expect(exported()?.imageFile('png', 1, true)).rejects.toThrow(
    'This viewer has no frames to animate.',
  );
});

test('a copy renders the PNG first and the figure after it, never both at once', async () => {
  let paint: ((uri: string) => void) | undefined;
  const viewer = standInViewer();
  viewerRef.current = {
    ...viewer,
    captureImage: (size) => {
      void viewer.captureImage(size);
      return new Promise((resolve) => {
        paint = resolve;
      });
    },
  };
  mount(container);

  const copied = exported()?.copyImage(2);
  await Promise.resolve();

  expect(asked).toStrictEqual(['image 600x402']);

  paint?.(PIXEL);

  await expect(copied).resolves.toBe('copyUnsupported');
  expect(asked).toStrictEqual(['image 600x402', 'figure 600x402 at most 1920']);
});

test('a page handing the picture on gets the figure as an SVG and the picture as a PNG stating its resolution', async () => {
  mount(container);

  const svg = await exported()?.capture.svg(1);
  const png = await exported()?.capture.png(3);

  expect(svg).toBe(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1" height="1" viewBox="0 0 1 1"><image width="1" height="1" xlink:href="${PIXEL}"/></svg>`,
  );
  expect(png?.type).toBe('image/png');
  expect(
    pngDpi(new Uint8Array((await png?.arrayBuffer()) ?? new ArrayBuffer(0))),
  ).toBe(288);
});

test('with no viewer, every action says there is nothing to picture yet', async () => {
  viewerRef.current = null;
  mount(container);

  await expect(exported()?.exportImage('svg', 1)).rejects.toThrow(
    'There is no picture to export yet.',
  );
  await expect(exported()?.imageFile('svg', 1)).rejects.toThrow(
    'There is no picture to send yet.',
  );
  await expect(exported()?.copyImage(1)).rejects.toThrow(
    'There is no picture to copy yet.',
  );
  await expect(exported()?.capture.svg(1)).rejects.toThrow(
    'There is no picture to copy yet.',
  );
  await expect(exported()?.capture.png(1)).rejects.toThrow(
    'There is no picture to copy yet.',
  );
  expect(downloads()).toStrictEqual([]);
});

test('a viewer that renders nothing sends nothing', async () => {
  viewerRef.current = {
    ...standInViewer(),
    captureImage: () => Promise.resolve(undefined),
  };
  mount(container);

  await expect(exported()?.imageFile('png', 1)).rejects.toThrow(
    'There is no picture to send yet.',
  );
});

function Probe({
  target,
  fileName,
}: {
  target: HTMLDivElement | null;
  fileName: string;
}) {
  rendered.push(useImageExport(target, viewerRef, fileName));
  return null;
}

function mount(target: HTMLDivElement | null, fileName = 'molecule'): void {
  act(() => {
    root.render(<Probe target={target} fileName={fileName} />);
  });
}

/**
 * The names the page asked the browser to save files under, in order.
 * @returns One name per download started.
 */
function downloads(): string[] {
  return clicks.mock.contexts.map(
    (anchor) => (anchor as HTMLAnchorElement).download,
  );
}

function layOut(width: number, height: number): void {
  container.getBoundingClientRect = () => ({ width, height }) as DOMRect;
}

/**
 * A viewer that writes down what it is asked to render, and renders a pixel.
 * @returns The viewer.
 */
function standInViewer(): SceneCapture {
  return {
    captureImage: async (size) => {
      asked.push(`image ${sizeText(size)}`);
      return PIXEL;
    },
    captureFigure: async (size, longest) => {
      asked.push(`figure ${sizeText(size)} at most ${longest}`);
      return { dataUri: PIXEL, width: 1, height: 1 };
    },
    frames: {
      capture: async (size) => {
        asked.push(`frames ${sizeText(size)}`);
        const frame = { width: 1, height: 1, data: new Uint8ClampedArray(4) };
        return [frame, frame] as unknown as ImageData[];
      },
    },
  };
}

function sizeText({ width, height }: ImageSize): string {
  return `${width}x${height}`;
}

function exported(): ImageExport | undefined {
  return rendered.at(-1);
}
