/**
 * The picture of an orbital's canvas: it renders the canvas at the size it has
 * on screen times the scale asked, and refuses before there is an orbital.
 * molstar's own picture is replaced by a stand-in recording what it is asked.
 */

import { expect, test, vi } from 'vitest';

import { orbitalCapture } from '../orbitalCapture.ts';

const asked = vi.hoisted(() => [] as unknown[]);

vi.mock('../../../molstar/core/index.ts', () => ({
  captureFigure: (plugin: unknown, size: unknown, longest: number) => {
    asked.push({ plugin, size, longest });
    return Promise.resolve({
      dataUri: 'data:image/jpeg;base64,AAAA',
      width: 300,
      height: 200,
    });
  },
  captureScene: () => Promise.resolve('data:image/png;base64,iVBORw0KGgo='),
}));

vi.stubGlobal('requestAnimationFrame', (callback: () => void) =>
  setTimeout(callback, 0),
);

const container = {
  getBoundingClientRect: () => ({ width: 150.4, height: 100 }),
} as unknown as HTMLElement;

const viewer = {
  run: <Result>(action: (plugin: never) => Result | Promise<Result>) =>
    Promise.resolve(action('the plugin' as never)),
};

test('the figure is the canvas rendered at the scale asked', async () => {
  asked.length = 0;
  const capture = orbitalCapture({
    container: () => container,
    viewer: () => viewer,
  });
  const svg = await capture.svg(2);

  expect(asked).toStrictEqual([
    { plugin: 'the plugin', size: { width: 300, height: 200 }, longest: 1920 },
  ]);
  expect(svg).toBe(
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="200" viewBox="0 0 300 200"><image width="300" height="200" xlink:href="data:image/jpeg;base64,AAAA"/></svg>',
  );
});

test('the PNG is the whole canvas', async () => {
  const capture = orbitalCapture({
    container: () => container,
    viewer: () => viewer,
  });
  const png = await capture.png(1);

  expect(png.type).toBe('image/png');
});

test('there is nothing to picture before the viewer exists', async () => {
  const capture = orbitalCapture({
    container: () => container,
    viewer: () => null,
  });

  await expect(capture.svg(2)).rejects.toThrow(
    'There is no orbital to picture yet.',
  );
});
