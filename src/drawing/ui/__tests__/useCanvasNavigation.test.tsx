// @vitest-environment jsdom
/**
 * A canvas moved around the same way on every site: the wheel zooms about the
 * pointer, the right and the middle button pan, the left button is the
 * tools', and the browser's menu is refused except in a text field.
 *
 * The canvas sits at (100, 50), 400 pixels wide and 200 tall, so its centre
 * is at (300, 150).
 */

import { act, useRef, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test } from 'vitest';

import type { Camera } from '../../core/camera.ts';
import { useCanvasNavigation } from '../useCanvasNavigation.ts';

const START: Camera = { x: 0, y: 0, zoom: 2 };

let host: HTMLDivElement;
let root: Root;
let cameras: Camera[];
let panning: boolean[];

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState(START);
  const navigation = useCanvasNavigation(ref, {
    camera,
    onCamera: (next) => {
      cameras.push(next);
      setCamera(next);
    },
  });
  panning.push(navigation.panning);
  return (
    <div ref={ref} data-testid="canvas">
      <input />
    </div>
  );
}

beforeEach(() => {
  cameras = [];
  panning = [];
  // Capturing the pointer is not something jsdom does.
  Element.prototype.setPointerCapture = () => undefined;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(<Probe />);
  });
  const canvas = host.querySelector('[data-testid="canvas"]');
  if (!canvas) throw new Error('no canvas');
  canvas.getBoundingClientRect = () => new DOMRect(100, 50, 400, 200);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
});

function canvas(): HTMLElement {
  const element = host.querySelector<HTMLElement>('[data-testid="canvas"]');
  if (!element) throw new Error('no canvas');
  return element;
}

function pointer(type: string, x: number, y: number, button = 0): Event {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button,
  }) as MouseEvent & { pointerId: number };
  event.pointerId = 1;
  return event;
}

test('the wheel zooms about the point under the pointer, and the page does not scroll', () => {
  const wheel = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    clientX: 400,
    clientY: 150,
    deltaY: -100,
  });
  act(() => {
    canvas().dispatchEvent(wheel);
  });

  expect(wheel.defaultPrevented).toBe(true);
  expect(cameras).toHaveLength(1);

  const [zoomed] = cameras as [Camera];

  expect(zoomed.zoom).toBeCloseTo(2 * Math.exp(0.2), 12);
  // The point under the pointer, 100 pixels right of the centre, stays put.
  expect(zoomed.x + 100 / zoomed.zoom).toBeCloseTo(50, 12);
  expect(zoomed.y).toBeCloseTo(0, 12);
});

test('a drag with the right button pans, and says so while it lasts', () => {
  act(() => {
    canvas().dispatchEvent(pointer('pointerdown', 300, 150, 2));
  });
  act(() => {
    canvas().dispatchEvent(pointer('pointermove', 340, 130, 2));
  });

  expect(panning.at(-1)).toBe(true);

  act(() => {
    canvas().dispatchEvent(pointer('pointerup', 340, 130, 2));
  });

  expect(cameras).toStrictEqual([{ x: -20, y: 10, zoom: 2 }]);
  expect(panning.at(-1)).toBe(false);
});

test('the middle button pans too; the left button moves nothing', () => {
  act(() => {
    canvas().dispatchEvent(pointer('pointerdown', 300, 150, 0));
    canvas().dispatchEvent(pointer('pointermove', 360, 150, 0));
    canvas().dispatchEvent(pointer('pointerup', 360, 150, 0));
  });

  expect(cameras).toStrictEqual([]);

  act(() => {
    canvas().dispatchEvent(pointer('pointerdown', 300, 150, 1));
    canvas().dispatchEvent(pointer('pointermove', 300, 110, 1));
    canvas().dispatchEvent(pointer('pointerup', 300, 110, 1));
  });

  expect(cameras).toStrictEqual([{ x: 0, y: 20, zoom: 2 }]);
});

test('the browser menu is refused over the canvas, and kept in a text field', () => {
  const overCanvas = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
  });
  const overField = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
  });
  canvas().dispatchEvent(overCanvas);
  canvas().querySelector('input')?.dispatchEvent(overField);

  expect(overCanvas.defaultPrevented).toBe(true);
  expect(overField.defaultPrevented).toBe(false);
});
