/**
 * The strokes of the tools every editor of the family shares — select, lasso,
 * erase, text and the shapes — drawn the way the tool draws, on a 16-unit
 * square.
 */

import type { ReactNode } from 'react';

import type { GraphicTool } from '../core/graphicTools.ts';

import { TextToolGlyph } from './TextToolIcon.tsx';

/** A tool every editor of the family draws the same icon for. */
export type EditorTool = GraphicTool | 'select' | 'lasso' | 'erase' | 'text';

/**
 * The strokes of each shared tool, for an icon set that draws its own frame
 * around them, such as `ToolGlyphFrame`.
 */
export const EDITOR_TOOL_GLYPHS: Readonly<Record<EditorTool, ReactNode>> = {
  select: <path d="M3 2 3 13 6 10 8.5 14.5 10.5 13.5 8 9 12 9Z" />,
  lasso: (
    <>
      <ellipse cx="8.5" cy="6" rx="5.5" ry="3.6" />
      <path d="M4.4 8.6C3.5 10 4 11.4 5.3 11.8 6.4 12.1 6.7 13.1 5.9 14.4" />
    </>
  ),
  erase: (
    <>
      <path d="M2.5 10.5 8.5 4.5 13 9 9 13H5Z" />
      <path d="M5.5 7.5 10 12" />
      <path d="M9 13H14" />
    </>
  ),
  text: <TextToolGlyph />,
  line: (
    <>
      <path d="M3.5 12.5 12.5 3.5" />
      <circle cx="3.5" cy="12.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="3.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  polyline: <path d="M2 12.5 5.5 5 10 10.5 14 3" />,
  curve: <path d="M2 13C2.5 4.5 7 3.5 8 8S13.5 11.5 14 3" />,
  polygon: <polygon points="2.5,11 5,3 13.5,5 11.5,13.5" />,
  rectangle: <rect x="2" y="4" width="12" height="8" />,
  'rounded-rectangle': <rect x="2" y="4" width="12" height="8" rx="2.5" />,
  circle: <circle cx="8" cy="8" r="5.5" />,
  ellipse: <ellipse cx="8" cy="8" rx="6.5" ry="4" />,
};
