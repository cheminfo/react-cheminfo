import { useCallback, useRef, useState } from 'react';

import type { StructureTransfer } from '../core/structureTransfer.ts';

import type { StructureEditorMoleculeChange } from './editorChange.ts';

/** What {@link useStructureImport} needs. */
export interface StructureImportOptions {
  /** Bumped by the caller to load its own value, which drops any import. */
  revision: number;
  /** Whether the editor draws a query fragment. */
  fragment: boolean;
  /** The caller's own reader, which then takes every drop instead. */
  onImport: ((transfer: StructureTransfer) => void) | undefined;
  /** Where a structure the editor read goes: the path an edit takes. */
  onRead: (change: StructureEditorMoleculeChange) => void;
}

/** Why the last drop loaded nothing. */
export interface StructureImportProblem {
  /** The file that was read, `null` for dragged text. */
  file: string | null;
}

/** The editor's imports, as the canvas and its corner need them. */
export interface StructureImport {
  /**
   * The idCode the canvas loads instead of the caller's value, `null` while it
   * shows that value.
   */
  idCode: string | null;
  /** The canvas's key: a new one per import, which loads it. */
  canvasKey: string;
  /** Read a drop or a chosen file. */
  load: (transfer: StructureTransfer) => void;
  /** Why the last drop loaded nothing, `null` when it did. */
  problem: StructureImportProblem | null;
  /** Forget the problem. */
  dismiss: () => void;
}

/** One import into the canvas, and which load of it it replaced. */
interface Imported {
  revision: number;
  count: number;
  idCode: string;
}

/**
 * Load what is dropped on the editor, or opened from disk, into its canvas.
 *
 * The canvas is uncontrolled, so a dropped structure — one the editor never
 * produced — remounts it with a new key, and is then reported like an edit.
 * A drop overtaken by a later one is dropped rather than applied late.
 * @param options - See {@link StructureImportOptions}.
 * @returns See {@link StructureImport}.
 */
export function useStructureImport(
  options: StructureImportOptions,
): StructureImport {
  const { revision, fragment, onImport, onRead } = options;
  const [imported, setImported] = useState<Imported | null>(null);
  const [problem, setProblem] = useState<StructureImportProblem | null>(null);
  const token = useRef(0);

  const load = useCallback(
    (transfer: StructureTransfer) => {
      setProblem(null);
      if (onImport !== undefined) {
        onImport(transfer);
        return;
      }
      const current = ++token.current;
      void readTransfer(transfer, fragment).then(({ file, change }) => {
        if (current !== token.current) return;
        if (change === null) {
          setProblem({ file });
          return;
        }
        setImported((previous) => ({
          revision,
          count: previous?.revision === revision ? previous.count + 1 : 1,
          idCode: change.idCode,
        }));
        onRead(change);
      });
    },
    [fragment, onImport, onRead, revision],
  );

  const dismiss = useCallback(() => setProblem(null), []);
  const current = imported?.revision === revision ? imported : null;

  return {
    idCode: current?.idCode ?? null,
    canvasKey: `${revision}.${current?.count ?? 0}`,
    load,
    problem,
    dismiss,
  };
}

async function readTransfer(
  transfer: StructureTransfer,
  fragment: boolean,
): Promise<{
  file: string | null;
  change: StructureEditorMoleculeChange | null;
}> {
  const file = transfer.kind === 'files' ? transfer.files[0] : undefined;
  try {
    const text =
      transfer.kind === 'text' ? transfer.text : ((await file?.text()) ?? '');
    const { readImportedStructure } = await import('./importedStructure.ts');
    return {
      file: file?.name ?? null,
      change: readImportedStructure(text, fragment),
    };
  } catch {
    return { file: file?.name ?? null, change: null };
  }
}
