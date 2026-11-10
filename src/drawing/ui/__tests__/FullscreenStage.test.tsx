// @vitest-environment jsdom
/**
 * The editor's box, able to fill the screen: while it does, Blueprint's
 * menus and dialogs are portalled into it rather than into the hidden body.
 *
 * jsdom has no Fullscreen API, and the library underneath reads which one the
 * browser offers when it is loaded, so the standard one is stood in for first.
 */

import { Portal } from '@blueprintjs/core';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { useFullscreen } from 'react-science/ui';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { FullscreenStage } from '../FullscreenStage.tsx';

const screen = vi.hoisted(() => {
  const state = { element: null as Element | null };
  Object.defineProperty(document, 'fullscreenEnabled', {
    configurable: true,
    get: () => true,
  });
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => state.element,
  });
  const change = () => {
    document.dispatchEvent(new Event('fullscreenchange'));
    return Promise.resolve();
  };
  // The element asked to fill the screen is the one the request is made on.
  const requestFullscreen = vi.fn((): Promise<void> => {
    state.element = requestFullscreen.mock.contexts.at(-1) as Element;
    return change();
  });
  HTMLElement.prototype.requestFullscreen = requestFullscreen;
  document.exitFullscreen = () => {
    state.element = null;
    return change();
  };
  return state;
});

function Editor() {
  const { isFullScreen, toggle } = useFullscreen();
  return (
    <>
      <button type="button" onClick={toggle}>
        {isFullScreen ? 'Exit' : 'Fill'}
      </button>
      <Portal>
        <div data-testid="menu">Menu</div>
      </Portal>
    </>
  );
}

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  screen.element = null;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(
      <FullscreenStage className="editor-stage">
        <Editor />
      </FullscreenStage>,
    );
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

function stage(): HTMLElement {
  const element = host.querySelector<HTMLElement>('.editor-stage');
  if (!element) throw new Error('no stage');
  return element;
}

async function toggle(): Promise<void> {
  await act(async () => {
    host.querySelector('button')?.click();
    await Promise.resolve();
  });
}

test('out of full screen, menus are portalled to the body', () => {
  expect(stage().querySelector('button')?.textContent).toBe('Fill');

  const menu = document.querySelector('[data-testid="menu"]');

  expect(menu).not.toBeNull();
  expect(stage().contains(menu)).toBe(false);
});

test('filling the screen fills it with the stage, and portals menus into it', async () => {
  const editor = stage().querySelector('button');
  await toggle();

  expect(screen.element).toBe(stage());
  expect(stage().querySelector('button')?.textContent).toBe('Exit');
  expect(stage().querySelector('button')).toBe(editor);
  expect(stage().querySelector('[data-testid="menu"]')).not.toBeNull();

  await toggle();

  expect(screen.element).toBeNull();
  expect(stage().querySelector('button')?.textContent).toBe('Fill');
  expect(stage().querySelector('[data-testid="menu"]')).toBeNull();
});
