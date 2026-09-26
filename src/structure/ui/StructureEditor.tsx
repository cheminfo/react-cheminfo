/**
 * The canvas structure editor and the box it is drawn in.
 *
 * The canvas itself sits behind `React.lazy`: it is the half that imports
 * react-ocl, so a page that never opens an editor never downloads openchemlib,
 * and `react-cheminfo/structure` stays importable when those optional peers
 * are absent.
 */

import type { CSSProperties, ReactElement } from 'react';
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { CanvasEditorInputFormat } from 'react-ocl';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { createPendingCall } from '../core/pendingCall.ts';

import { EditorHelpButton } from './EditorHelpButton.tsx';
import { ToolbarTooltip } from './ToolbarTooltip.tsx';
import type {
  StructureEditorChange,
  StructureEditorMode,
} from './editorChange.ts';
import { useToolbarFloor } from './useToolbarFloor.ts';

const EditorCanvas = lazy(async () => {
  const module = await import('./EditorCanvas.tsx');
  return { default: module.EditorCanvas };
});

/** What {@link StructureEditor} needs. */
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
  /**
   * Explain each toolbar button in a tooltip, and put a button in the corner
   * that opens a guide to the mouse and the keyboard, which F1 opens too.
   * @default true
   */
  help?: boolean;
  /**
   * Class the container carries, so a site can reach it from its stylesheet.
   * @default undefined
   */
  className?: string;
  /**
   * Extra style for the container, merged over the packaged one.
   * @default undefined
   */
  style?: CSSProperties;
}

/**
 * The canvas structure editor, sized to fill its container and never to hide
 * part of its toolbar, with a tooltip on every toolbar button and a guide to
 * the keys.
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
    help = true,
    className,
    style,
  } = props;

  const t = useChromeT();
  const containerRef = useToolbarFloor({ minHeight, revision });
  const handleChange = useDebounced(onChange, debounce, revision);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ ...ROOT_STYLE, minHeight, ...style }}
    >
      <Suspense
        fallback={
          <div style={LOADING_STYLE}>{t('structure.loadingEditor')}</div>
        }
      >
        <EditorCanvas
          key={revision}
          onChange={handleChange}
          fragment={fragment}
          inputFormat={inputFormat}
          value={value}
          mode={mode}
        />
        {help ? (
          <>
            <ToolbarTooltip containerRef={containerRef} mode={mode} />
            <EditorHelpButton
              containerRef={containerRef}
              mode={mode}
              fragment={fragment}
            />
          </>
        ) : null}
      </Suspense>
    </div>
  );
}

/**
 * Report the last edit of a burst rather than every one of them.
 *
 * The editor's own event is read out before the wait starts, so what arrives
 * late is a plain object rather than a handle on an editor that has moved on.
 * An editor removed mid-burst — a tab switched, a card folded — still reports
 * its last edit, which would otherwise be lost with the timer.
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
  const [pending] = useState(createPendingCall<StructureEditorChange>);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    pending.drop();
  }, [pending, resetKey]);
  useEffect(() => () => pending.flush(), [pending]);

  return useCallback(
    (change: StructureEditorChange) => {
      pending.push(change, delay, (value) => onChangeRef.current(value));
    },
    [pending, delay],
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
  border: `1px solid ${TOKEN.border}`,
  borderRadius: 6,
  background: '#fff',
};

/** The box the canvas will fill, so its arrival moves nothing. */
const LOADING_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: TOKEN.textFaint,
  fontSize: 13,
};
