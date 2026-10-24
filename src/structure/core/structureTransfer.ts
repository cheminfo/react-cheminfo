/** What a paste or a drop carried that a structure can be read from. */
export type StructureTransfer =
  { kind: 'files'; files: File[] } | { kind: 'text'; text: string };

/** The part of a `DataTransfer` a structure is read from. */
export interface StructureTransferSource {
  files: ArrayLike<File>;
  getData: (format: string) => string;
}

/**
 * What a paste or a drop holds: its files when it carries any, otherwise its
 * text — a SMILES, an idCode, a molfile. A file copied in the file manager also
 * carries its name as text, so the files win.
 * @param transfer - The clipboard or drag data, `null` when the event has none.
 * @returns The files or the trimmed text, or `null` when there is nothing.
 */
export function readStructureTransfer(
  transfer: StructureTransferSource | null,
): StructureTransfer | null {
  if (transfer === null) return null;
  if (transfer.files.length > 0) {
    return { kind: 'files', files: Array.from(transfer.files) };
  }
  const text = transfer.getData('text').trim();
  return text === '' ? null : { kind: 'text', text };
}

/**
 * Whether a drag in progress may carry a structure. Until the drop only the
 * types are readable, never the content, so a file or plain text is enough.
 * @param types - `DataTransfer.types` of the drag.
 * @returns Whether it is worth offering to take the drop.
 */
export function carriesStructure(types: readonly string[]): boolean {
  return types.includes('Files') || types.includes('text/plain');
}
