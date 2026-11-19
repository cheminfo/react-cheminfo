// @vitest-environment jsdom
/**
 * A site's guide over an empty structure editor: where it stands, which press
 * sends it away, and what brings it back.
 *
 * jsdom cannot run OpenChemLib's canvas, so react-ocl's editors are stood in for
 * by `canvasEditorStandIn.tsx`, which carries the attribute OpenChemLib marks
 * its editor's element with and reports genuine notations.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { StructureEditorProps } from '../StructureEditor.tsx';
import { StructureEditor } from '../StructureEditor.tsx';
import { StructureEditorGuide } from '../StructureEditorGuide.tsx';

import { canvas, resetCanvas } from './canvasLog.ts';

vi.mock('react-ocl', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import('./canvasEditorStandIn.tsx')),
}));

let host: HTMLDivElement;
let root: Root;

beforeAll(async () => {
  await import('../EditorCanvas.tsx');
  await import('../EditorExportButton.tsx');
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  resetCanvas();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

const GUIDE = <p data-testid="site-guide">Start here</p>;

async function render(props: Partial<StructureEditorProps> = {}) {
  await act(async () => {
    root.render(<StructureEditor onChange={() => undefined} {...props} />);
  });
}

function guide(): Element | null {
  return host.querySelector('[data-testid="structure-editor-guide"]');
}

function splash(): Element | null {
  return host.querySelector('[data-testid="structure-editor-splash"]');
}

/**
 * Press the canvas this far from the editor's left edge, then let go.
 * @param clientX - Where, in CSS pixels; jsdom lays the editor out at 0.
 * @returns Lets go of the press, and waits for the editor to hear it.
 */
function press(clientX: number): () => Promise<void> {
  const target = host.querySelector('[data-testid="canvas-editor"]');
  if (target === null) throw new Error('no canvas is drawn');
  act(() => {
    target.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, clientX }),
    );
  });
  return async () => {
    // The release is acted on in a task of its own, once the editor has heard
    // it too: that task is run here rather than waited for.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      await act(async () => {
        globalThis.dispatchEvent(
          new MouseEvent('pointerup', { bubbles: true }),
        );
        await vi.runOnlyPendingTimersAsync();
      });
    } finally {
      vi.useRealTimers();
    }
  };
}

test('an empty canvas shows the guide in place of the splash, beside the toolbar and under the corner', async () => {
  await render({ guide: GUIDE });

  const box = guide();

  expect(box?.querySelector('[data-testid="site-guide"]')?.textContent).toBe(
    'Start here',
  );
  expect(splash()).toBeNull();
});

test('the box clears the 46 px toolbar and the corner buttons, and lets the pointer through', () => {
  const markup = renderToStaticMarkup(
    <StructureEditorGuide>{GUIDE}</StructureEditorGuide>,
  );

  expect(markup).toBe(
    '<div data-testid="structure-editor-guide" style="position:absolute;inset:32px 0 0 46px;pointer-events:none"><p data-testid="site-guide">Start here</p></div>',
  );
});

test('with no guide the splash stays, and with splash off nothing is shown', async () => {
  await render();

  expect(guide()).toBeNull();
  expect(splash()).not.toBeNull();

  await render({ splash: false });

  expect(splash()).toBeNull();
  expect(guide()).toBeNull();
});

test('a guide is shown even with the splash switched off', async () => {
  await render({ guide: GUIDE, splash: false });

  expect(guide()).not.toBeNull();
});

test('a press on the drawing area hides the guide until a release that drew nothing', async () => {
  await render({ guide: GUIDE });

  const release = press(200);

  expect(guide()).toBeNull();

  await release();

  expect(guide()).not.toBeNull();
});

test('a press on the toolbar is not a stroke, and leaves the guide', async () => {
  await render({ guide: GUIDE });

  const release = press(20);

  expect(guide()).not.toBeNull();

  await release();

  expect(guide()).not.toBeNull();
});

test('the guide goes once something is drawn, and comes back once it is erased', async () => {
  await render({ guide: GUIDE });

  act(() => canvas.draw('CC'));

  expect(guide()).toBeNull();
  expect(splash()).toBeNull();

  act(() => canvas.draw(''));

  expect(guide()).not.toBeNull();
});

test('a canvas opened on a structure, or a reaction canvas, shows no guide', async () => {
  await render({ guide: GUIDE, inputFormat: 'smiles', value: 'CCO' });

  expect(guide()).toBeNull();

  await render({ guide: GUIDE, mode: 'reaction', revision: 1 });

  expect(guide()).toBeNull();
});
