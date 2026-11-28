/**
 * The icons of the tools every editor shares, drawn in one frame.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { GRAPHIC_TOOLS } from '../../core/graphicTools.ts';
import { EditorToolIcon, ToolGlyphFrame } from '../EditorToolIcon.tsx';
import { EDITOR_TOOL_GLYPHS } from '../editorToolGlyphs.tsx';

const FRAME =
  'viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

test('the eraser is drawn in the rounded 16-unit frame, in the colour of the text', () => {
  expect(renderToStaticMarkup(<EditorToolIcon tool="erase" />)).toBe(
    `<svg class="tool-icon" width="16" height="16" ${FRAME}><path d="M2.5 10.5 8.5 4.5 13 9 9 13H5Z"></path><path d="M5.5 7.5 10 12"></path><path d="M9 13H14"></path></svg>`,
  );
});

test('the frame takes a size and a class of the site', () => {
  expect(
    renderToStaticMarkup(
      <EditorToolIcon tool="rectangle" size={20} className="palette-icon" />,
    ),
  ).toBe(
    `<svg class="palette-icon" width="20" height="20" ${FRAME}><rect x="2" y="4" width="12" height="8"></rect></svg>`,
  );
});

test('a site draws its own glyph in the same frame', () => {
  expect(
    renderToStaticMarkup(
      <ToolGlyphFrame>
        <path d="M3 12.5 13 3.5" />
      </ToolGlyphFrame>,
    ),
  ).toBe(
    `<svg class="tool-icon" width="16" height="16" ${FRAME}><path d="M3 12.5 13 3.5"></path></svg>`,
  );
});

test('every shape tool, and select, lasso, erase and text, has a glyph', () => {
  expect(Object.keys(EDITOR_TOOL_GLYPHS).toSorted()).toStrictEqual(
    [...GRAPHIC_TOOLS, 'select', 'lasso', 'erase', 'text'].toSorted(),
  );
});
