/**
 * Where the OpenChemLib structure editor draws its palette and its drawing,
 * for a browser suite: both are canvases in the editor's open shadow root,
 * which locators do not pierce, so they are measured in the page.
 */

import type { Locator } from '@playwright/test';

import { pollUntil } from './poll.ts';
import type { Rect } from './split.ts';

/** The editor's two canvases, in the page's pixels. */
export interface StructureEditorBoxes {
  /** The palette of tools. */
  toolbar: Rect;
  /** The canvas a structure is drawn on. */
  drawing: Rect;
}

/**
 * The editor's palette and drawing canvas, once the drawing has a height.
 * @param editor - The element hosting the editor, the one carrying
 * `data-openchemlib-canvas-editor`.
 * @returns The two boxes, read once more after the drawing got its height.
 * @throws {Error} When five seconds pass without a drawing that has a height.
 */
export async function structureEditorBoxes(
  editor: Locator,
): Promise<StructureEditorBoxes> {
  await pollUntil(
    async () => {
      const boxes = await readBoxes(editor);
      return boxes !== null && boxes.drawing.height > 0 ? true : undefined;
    },
    5000,
    'the structure editor drew no canvas with a height',
  );
  const boxes = await readBoxes(editor);
  if (boxes === null) throw new Error('editor canvases not found');
  return boxes;
}

function readBoxes(editor: Locator): Promise<StructureEditorBoxes | null> {
  return editor.evaluate((host) => {
    const root = host.shadowRoot;
    const toolbar = root?.firstElementChild;
    const drawing = root?.querySelector('canvas[tabindex]');
    if (!toolbar || !drawing) return null;
    // Spelled out twice: the function runs in the page, alone.
    const palette = toolbar.getBoundingClientRect();
    const canvas = drawing.getBoundingClientRect();
    return {
      toolbar: {
        x: palette.x,
        y: palette.y,
        width: palette.width,
        height: palette.height,
      },
      drawing: {
        x: canvas.x,
        y: canvas.y,
        width: canvas.width,
        height: canvas.height,
      },
    };
  });
}
