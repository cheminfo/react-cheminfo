/**
 * The icons of the tools every editor of the family shares — select, lasso,
 * erase, text and the shapes — drawn the way the tool draws, on a 16-unit
 * square, in the colour of the text around them.
 */

import type { ReactElement, ReactNode } from 'react';

import type { EditorTool } from './editorToolGlyphs.tsx';
import { EDITOR_TOOL_GLYPHS } from './editorToolGlyphs.tsx';

/** Props of {@link ToolGlyphFrame}. */
export interface ToolGlyphFrameProps {
  /** The strokes, on a 16-unit square. */
  children: ReactNode;
  /**
   * Its width and height, in pixels.
   * @default 16
   */
  size?: number;
  /**
   * The class of the `<svg>`.
   * @default 'tool-icon'
   */
  className?: string;
}

/**
 * The frame a tool's strokes are drawn in: a 16-unit square, strokes 1.4 wide
 * and rounded, in the colour of the text. A site draws its own tools' glyphs
 * in it, so they sit beside the shared ones.
 * @param props - See {@link ToolGlyphFrameProps}.
 * @returns The icon.
 */
export function ToolGlyphFrame(props: ToolGlyphFrameProps): ReactElement {
  const { children, size = 16, className = 'tool-icon' } = props;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Props of {@link EditorToolIcon}. */
export interface EditorToolIconProps {
  /** The tool. */
  tool: EditorTool;
  /**
   * Its width and height, in pixels.
   * @default 16
   */
  size?: number;
  /**
   * The class of the `<svg>`.
   * @default 'tool-icon'
   */
  className?: string;
}

/**
 * The icon of a shared tool, the same in every editor of the family.
 * @param props - See {@link EditorToolIconProps}.
 * @returns The icon.
 */
export function EditorToolIcon(props: EditorToolIconProps): ReactElement {
  const { tool, size, className } = props;
  return (
    <ToolGlyphFrame size={size} className={className}>
      {EDITOR_TOOL_GLYPHS[tool]}
    </ToolGlyphFrame>
  );
}
