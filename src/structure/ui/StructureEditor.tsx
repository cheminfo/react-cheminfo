import type { CSSProperties, ReactElement } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { CanvasEditorInputFormat } from 'react-ocl';

import type {
  StructureEditorChange,
  StructureEditorMode,
} from './EditorCanvas.tsx';
import { EditorCanvas } from './EditorCanvas.tsx';
import { useToolbarFloor } from './useToolbarFloor.ts';

export interface StructureEditorProps {
  /**
   * Called after every edit, once the drawing has been still for `debounce`
   * milliseconds, with every notation read out of the editor.
   */
  onChange: (change: StructureEditorChange) => void;
  /**
   * Draw a query fragment rather than a whole structure, which is what a
   * substructure filter needs.
   * @default false
   */
  fragment?: boolean;
  /**
   * How `value` is written.
   * @default 'idcode'
   */
  inputFormat?: CanvasEditorInputFormat;
  /**
   * What the canvas holds. Read once, when the editor appears and again on
   * every change of `revision`: the editor is uncontrolled, so feeding the
   * drawing back into it would replace the structure and reset every
   * coordinate under the pen.
   * @default ''
   */
  value?: string;
  /**
   * Bumped by the caller to load `value` into the canvas again, which is what
   * an example, a share link or a Clear button does. Changing it discards
   * whatever was being drawn.
   * @default 0
   */
  revision?: number;
  /**
   * How long the drawing has to be still before `onChange` is called, in
   * milliseconds. Long enough that drawing a ring does not publish six
   * structures; `0` reports every stroke.
   * @default 300
   */
  debounce?: number;
  /**
   * Smallest height of the drawing area, in pixels. Raised to whatever the
   * toolbar needs, which is usually more.
   * @default 320
   */
  minHeight?: number;
  /**
   * Whether the editor draws one structure or a reaction. A reaction canvas
   * has its own toolbar and its own arrow.
   * @default 'molecule'
   */
  mode?: StructureEditorMode;
  /** Class the container carries, so a site can reach it from its stylesheet. */
  className?: string;
  /** Extra style for the container, merged over the packaged one. */
  style?: CSSProperties;
}

/**
 * The canvas structure editor, sized to fill its container and never to hide
 * part of its toolbar.
 * @param props - What to draw, when to reload it, and where to send it.
 * @returns The editor.
 */
export function StructureEditor(props: StructureEditorProps): ReactElement {
  const {
    onChange,
    fragment = false,
    inputFormat = 'idcode',
    value = '',
    revision = 0,
    debounce = 300,
    minHeight = 320,
    mode = 'molecule',
    className,
    style,
  } = props;

  const containerRef = useToolbarFloor({ minHeight, revision });
  const handleChange = useDebounced(onChange, debounce, revision);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ ...ROOT_STYLE, minHeight, ...style }}
    >
      <EditorCanvas
        key={revision}
        onChange={handleChange}
        fragment={fragment}
        inputFormat={inputFormat}
        value={value}
        mode={mode}
      />
    </div>
  );
}

/**
 * Report the last edit of a burst rather than every one of them.
 *
 * The editor's own event is read out before the wait starts, so what arrives
 * late is a plain object rather than a handle on an editor that has moved on.
 * @param onChange - What the caller wants told.
 * @param delay - How long the drawing has to be still, in milliseconds.
 * @param resetKey - Dropped edits: a burst still waiting when the caller
 * replaces the structure describes a canvas that no longer exists.
 * @returns The handler to give the canvas.
 */
function useDebounced(
  onChange: (change: StructureEditorChange) => void,
  delay: number,
  resetKey: number,
): (change: StructureEditorChange) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resetKey]);

  return useCallback(
    (change: StructureEditorChange) => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      if (delay <= 0) {
        onChangeRef.current(change);
        return;
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onChangeRef.current(change);
      }, delay);
    },
    [delay],
  );
}

/**
 * The canvas is positioned out of the height computation, so the container's
 * own height is what the measured toolbar floor writes on it. The `minHeight`
 * prop is applied on top of this at first render: without a height before the
 * toolbar has been measured, the editor is built at zero size and never paints
 * the structure it was given.
 */
const ROOT_STYLE: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
  border: '1px solid #d3d8de',
  borderRadius: 6,
  background: '#fff',
};
