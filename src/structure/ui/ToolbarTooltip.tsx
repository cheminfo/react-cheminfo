import { Classes, Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, RefObject } from 'react';

import type { EditorToolbarButton } from '../core/editorToolbar.ts';
import {
  EDITOR_TOOLBAR_BUTTONS,
  isEditorToolbarButtonAvailable,
} from '../core/editorToolbar.ts';

import type { StructureEditorMode } from './EditorCanvas.tsx';
import { KeyCaps } from './KeyCaps.tsx';
import { useToolbarHover } from './useToolbarHover.ts';

/** What {@link ToolbarTooltip} needs. */
export interface ToolbarTooltipProps {
  /** The positioned element wrapping the editor. */
  containerRef: RefObject<HTMLElement | null>;
  /** Which editor the toolbar belongs to, since some buttons are greyed. */
  mode: StructureEditorMode;
}

/**
 * The name, key and purpose of the toolbar button under the pointer.
 *
 * The toolbar is a canvas, so the tooltip is anchored to an invisible box laid
 * over the button rather than to the button itself; the box lets the pointer
 * through, so the editor still sees every hover and click.
 * @param props - See {@link ToolbarTooltipProps}.
 * @returns The tooltip, or nothing before a button has been hovered.
 */
export function ToolbarTooltip(
  props: ToolbarTooltipProps,
): ReactElement | null {
  const { containerRef, mode } = props;
  const hover = useToolbarHover(containerRef);
  if (hover === null) return null;
  const button = EDITOR_TOOLBAR_BUTTONS[hover.button];
  if (button === undefined) return null;

  return (
    <Tooltip
      isOpen={hover.open}
      placement="right"
      content={<ButtonTip button={button} mode={mode} />}
      renderTarget={({ ref }) => (
        <span ref={ref} aria-hidden style={{ ...TARGET_STYLE, ...hover.box }} />
      )}
    />
  );
}

function ButtonTip(props: {
  button: EditorToolbarButton;
  mode: StructureEditorMode;
}): ReactElement {
  const { button, mode } = props;
  const available = isEditorToolbarButtonAvailable(button, mode);

  return (
    <div style={TIP_STYLE} data-testid="structure-editor-tooltip">
      <div style={HEAD_STYLE}>
        <strong>{button.name}</strong>
        {button.keys === undefined ? null : <KeyCaps keys={button.keys} />}
      </div>
      <div>{button.description}</div>
      {available ? null : (
        <div className={Classes.TEXT_MUTED}>
          {button.availability === 'reaction'
            ? 'Only when drawing a reaction.'
            : 'Not available in this editor.'}
        </div>
      )}
    </div>
  );
}

const TARGET_STYLE: CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
};

const TIP_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  maxWidth: 260,
  lineHeight: 1.4,
};

const HEAD_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};
