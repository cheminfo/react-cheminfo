import { useCallback, useEffect, useRef, useState } from 'react';

import { createPendingCall } from '../core/pendingCall.ts';

import type { StructureEditorChange } from './editorChange.ts';

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
export function useDebouncedChange(
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
