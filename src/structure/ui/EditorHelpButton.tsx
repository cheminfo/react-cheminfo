import { Button, PopoverNext, Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, RefObject } from 'react';
import { useEffect, useState } from 'react';

import type { StructureEditorMode } from './EditorCanvas.tsx';
import { StructureEditorHelp } from './StructureEditorHelp.tsx';

/** What {@link EditorHelpButton} needs. */
export interface EditorHelpButtonProps {
  /** The element wrapping the editor, which F1 is listened for on. */
  containerRef: RefObject<HTMLElement | null>;
  /** Which editor the guide is written for. */
  mode: StructureEditorMode;
  /** Whether the editor draws a query fragment. */
  fragment: boolean;
}

/**
 * The editor's help button, in the corner of the drawing, opening the guide to
 * the mouse and the keyboard.
 *
 * F1 opens it too: openchemlib binds that key to a help dialog it does not
 * implement on the web.
 * @param props - See {@link EditorHelpButtonProps}.
 * @returns The button and its popover.
 */
export function EditorHelpButton(props: EditorHelpButtonProps): ReactElement {
  const { containerRef, mode, fragment } = props;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'F1') return;
      event.preventDefault();
      setIsOpen(true);
    };
    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [containerRef]);

  return (
    <div style={CORNER_STYLE}>
      <PopoverNext
        isOpen={isOpen}
        onInteraction={setIsOpen}
        placement="left-start"
        content={<StructureEditorHelp mode={mode} fragment={fragment} />}
      >
        <Tooltip content={LABEL} placement="left" disabled={isOpen}>
          <Button
            variant="minimal"
            size="small"
            icon="help"
            aria-label={LABEL}
          />
        </Tooltip>
      </PopoverNext>
    </div>
  );
}

const LABEL = 'Mouse and keyboard';

const CORNER_STYLE: CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
};
