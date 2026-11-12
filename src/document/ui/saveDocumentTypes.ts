import type { SaveTarget } from '../../storage/core/documentFile.ts';

/** A format a site saves its documents in. */
export interface DocumentFormat {
  /** Its identifier, e.g. `document` or `svg`. */
  id: string;
  /** What the dialog calls it, e.g. `Drawing, with what you choose below`. */
  label: string;
  /** The extension its files take, e.g. `.draw.zip`. */
  extension: string;
  /** Whether it can carry the view and the workspace beside the data. */
  holdsParts: boolean;
}

/** What the visitor chose to save. */
export interface SaveDocumentChoice {
  /** The file's name, without its extension. */
  name: string;
  /** The format, by its identifier. */
  format: string;
  /** Keep the view with the data. */
  view: boolean;
  /** Keep the workspace with the data. */
  workspace: boolean;
  /**
   * Where the document is kept, when the dialog offers a choice.
   * @default undefined — a download
   */
  target?: SaveTarget;
}

/** What `SaveDocumentDialog` offers. */
export interface SaveDocumentDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
  /** Called with the choice when Save is pressed. */
  onSave: (choice: SaveDocumentChoice) => void;
  /** The formats offered, the usual one first. */
  formats: readonly [DocumentFormat, ...DocumentFormat[]];
  /** The choice the dialog opens on. */
  initial: SaveDocumentChoice;
  /**
   * Which of the view and the workspace the site can keep beside its data: a
   * part it has no use for is not offered.
   * @default { view: true, workspace: true }
   */
  parts?: { view?: boolean; workspace?: boolean };
  /**
   * What keeping the view brings back, said under its box.
   * @default the chrome's own sentence, in the language of the page
   */
  viewDescription?: string;
  /**
   * What keeping the workspace brings back, said under its box.
   * @default the chrome's own sentence, in the language of the page
   */
  workspaceDescription?: string;
  /**
   * The places offered, in the order shown; with fewer than two there is
   * nothing to choose and none is shown.
   * @default [] — the file is downloaded
   */
  targets?: readonly SaveTarget[];
  /**
   * The name of the folder chosen before, said beside "In a folder".
   * @default undefined — none chosen yet
   */
  folderName?: string;
  /**
   * Say that Chrome and Edge also save in a file or a folder: true in a
   * browser that offers neither.
   * @default false
   */
  otherBrowserNote?: boolean;
  /**
   * The dialog's title.
   * @default `Save as`, in the language of the page
   */
  title?: string;
}
