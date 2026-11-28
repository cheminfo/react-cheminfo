// @vitest-environment jsdom
/**
 * The figure panel of an editor's bar: named when it opens, and off while
 * nothing is drawn.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NoResizeObserver } from '../../../__tests__/dom.ts';
import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { FigureButton } from '../FigureButton.tsx';

const FIGURE = {
  markup: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="48"/>',
  width: 96,
  height: 48,
};

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

function render(disabled: boolean) {
  const named = vi.fn(() => 'benzene');
  act(() => {
    root.render(
      <FigureButton
        disabled={disabled}
        writeFigure={() => Promise.resolve(FIGURE)}
        fileName={named}
        dpi={300}
        onDpi={() => {
          // Not picked in this test.
        }}
        wrapButton={(button) => <span className="hint">{button}</span>}
      />,
    );
  });
  return named;
}

test('nothing drawn leaves the button off, inside the site’s wrapper', () => {
  const named = render(true);
  const button = host.querySelector('.hint > button');

  expect(button?.textContent).toBe('Figure');
  expect(button?.hasAttribute('disabled')).toBe(true);
  expect(named).not.toHaveBeenCalled();
});

test('the figure is named as the panel opens, not before', () => {
  const named = render(false);

  expect(named).not.toHaveBeenCalled();

  act(() => {
    host
      .querySelector('button')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(named).toHaveBeenCalled();
});
