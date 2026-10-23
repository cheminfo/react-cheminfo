import { useCallback, useState } from 'react';

/** What a structure editor is drawing, and how a page reloads it. */
export interface StructureDraft<TValue> {
  /** What the canvas holds: the structure last loaded or last drawn. */
  value: TValue;
  /**
   * What `StructureEditor` takes as `revision`: it reloads `value` into the
   * canvas each time this changes, and only then.
   */
  revision: number;
  /**
   * Put a structure in the canvas, replacing what is drawn: an example, the
   * query a dialog is opened on, a Clear button loading the empty string.
   * @param value - The structure, as the editor's `inputFormat` reads it.
   */
  load: (value: TValue) => void;
  /**
   * Keep what the editor drew, without reloading the canvas: what its
   * `onChange` hands over. The same value twice changes nothing.
   * @param value - The structure the editor reports.
   */
  update: (value: TValue) => void;
}

/**
 * The draft a `StructureEditor` is fed: what it draws, and the revision that
 * makes it reload. The editor is uncontrolled, so feeding every stroke back
 * into it would replace the structure under the pen; this keeps the drawing
 * out of the canvas until the page means to load one.
 * @param initial - What the canvas opens on.
 * @returns The draft, and the two ways to change it.
 */
export function useStructureDraft<TValue = string>(
  initial: TValue,
): StructureDraft<TValue> {
  const [draft, setDraft] = useState({ value: initial, revision: 0 });
  const load = useCallback((value: TValue) => {
    setDraft((previous) => ({ value, revision: previous.revision + 1 }));
  }, []);
  const update = useCallback((value: TValue) => {
    setDraft((previous) =>
      Object.is(previous.value, value) ? previous : { ...previous, value },
    );
  }, []);
  return { value: draft.value, revision: draft.revision, load, update };
}
