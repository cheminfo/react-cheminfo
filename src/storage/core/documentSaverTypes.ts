import type { SavedDocuments } from './createSavedDocuments.ts';
import type { SiteFolder } from './createSiteFolder.ts';
import type {
  Cell,
  DocumentFile,
  DocumentPartsKept,
  SaveTarget,
} from './documentFile.ts';
import type { PickerType } from './fileAccess.ts';

/** A format a site saves its documents in. */
export interface SaveFormat<D> {
  /** Its identifier, e.g. `document` or `svg`. */
  id: string;
  /**
   * What Save as calls it: its words, or a key of the chrome's catalog, which
   * is said in the language of the page.
   */
  label: string;
  /** The extension its files take, e.g. `.write.html`. */
  extension: string;
  /** What the browser's file picker calls it, and the types it accepts. */
  picker: PickerType;
  /**
   * Whether it can carry the view and the workspace beside the data.
   * @default false
   */
  holdsParts?: boolean;
  /** The file's content, given the name it is saved under. */
  write: (
    document: D,
    parts: DocumentPartsKept | undefined,
    name: string,
  ) => Promise<Blob | string> | Blob | string;
}

/** Where and how to save, as the visitor chose it. */
export interface SaveChoice {
  /** The name, without its extension. */
  name: string;
  /** Where the document is kept. */
  target: SaveTarget;
  /** The format, by its identifier. */
  format: string;
  /** Keep the view with the data, in a format that holds it. */
  view: boolean;
  /** Keep the workspace with the data, in a format that holds it. */
  workspace: boolean;
}

/** What `createDocumentSaver` saves, and where it keeps it. */
export interface DocumentSaverOptions<D> {
  /** The site, e.g. `write`: names its folder and the choice it remembers. */
  site: string;
  /** The formats it saves in, the usual one first. */
  formats: readonly [SaveFormat<D>, ...Array<SaveFormat<D>>];
  /**
   * The document now.
   * @returns It, or `undefined` while there is nothing to save.
   */
  document: () => D | undefined;
  /**
   * The name a document never saved is offered, without its extension.
   * @returns E.g. its title, or the minute it is saved.
   */
  stem: () => string;
  /** Where the document on screen is kept; the site's draft keeps it too. */
  file: Cell<DocumentFile<D> | null>;
  /**
   * The documents kept in this browser under a name, which "In this browser"
   * saves into.
   * @default undefined — that place is not offered
   */
  savedDocuments?: SavedDocuments<D>;
  /**
   * The folder "In a folder" saves into.
   * @default createSiteFolder(site)
   */
  folder?: SiteFolder;
}

/** What a save did. */
export type SaveOutcome =
  | {
      kind: 'saved';
      target: SaveTarget;
      /** The name it was kept under. */
      name: string;
      /** The name asked for, when another document already took it. */
      wanted?: string;
    }
  | { kind: 'choose' }
  | { kind: 'cancelled' }
  | { kind: 'empty' }
  | { kind: 'failed'; name: string; message: string };

/** Save and Save as, the same way on every site of the family. */
export interface DocumentSaver<D> {
  /** The site's formats. */
  readonly formats: readonly [SaveFormat<D>, ...Array<SaveFormat<D>>];
  /** The site's folder. */
  readonly folder: SiteFolder;
  /** The places this browser offers, here. */
  targets: () => SaveTarget[];
  /** The place chosen before, while this browser still offers it. */
  remembered: () => SaveTarget | undefined;
  /** What Save as opens on: where the document is, else what was chosen. */
  suggestion: () => SaveChoice;
  /**
   * Save: over the file the document is kept in, else where the visitor
   * chose before. Call it from the key or the click that saves: a browser
   * opens its picker only while one lasts.
   * @returns `choose` when nothing was chosen yet: the page asks where.
   */
  save: () => Promise<SaveOutcome>;
  /**
   * Save where the visitor just chose, and remember the place for the next
   * documents. Call it from the click that chose.
   */
  saveTo: (choice: SaveChoice) => Promise<SaveOutcome>;
}
