/** A file of the site's folder. */
export interface FolderEntry {
  /** Its name, extension included. */
  name: string;
  /** The file, which Save writes over once it is open. */
  handle: FileSystemFileHandle;
  /** When it last changed, in epoch milliseconds. */
  modified: number;
  /**
   * The folders it is in, below the one open in the panel, for a file a
   * search found deeper.
   * @default undefined — in the folder open in the panel
   */
  path?: readonly string[];
}

/** The folder a site keeps its documents in, chosen once. */
export interface SiteFolder {
  /**
   * The folder chosen before, without asking anything.
   * @returns It, or `undefined` when none was chosen or none can be kept.
   */
  current: () => Promise<FileSystemDirectoryHandle | undefined>;
  /**
   * The folder, ready to be written: the one chosen before, asked again for
   * its permission after a reload, else one the visitor picks now. Call it
   * from a click or a key.
   * @returns The folder; null when the visitor cancelled or refused;
   * undefined when the browser keeps no folder.
   */
  writable: () => Promise<FileSystemDirectoryHandle | null | undefined>;
  /**
   * Ask for another folder, and keep it in place of the one before. Call it
   * from a click.
   * @returns The folder; null when the visitor cancelled; undefined when the
   * browser keeps no folder.
   */
  choose: () => Promise<FileSystemDirectoryHandle | null | undefined>;
  /**
   * Whether the page may read the folder now, without asking.
   * @returns False after a reload, until the visitor allows it again.
   */
  readable: () => Promise<boolean>;
  /**
   * Ask again to read the folder kept from a visit before. Call it from a
   * click.
   * @returns Whether the page may.
   */
  allow: () => Promise<boolean>;
  /**
   * The site's files in the folder open in the panel, the most recently
   * changed first.
   * @param extensions - What their names end with, e.g. `['.write.html']`.
   * @returns The files; none while the page may not read the folder.
   */
  list: (extensions: readonly string[]) => Promise<FolderEntry[]>;
  /**
   * The site's files in the folder open in the panel and in the folders inside
   * it, each with its path, the most recently changed first.
   * @param extensions - What their names end with.
   * @returns The files; none while the page may not read the folder.
   */
  search: (extensions: readonly string[]) => Promise<FolderEntry[]>;
  /**
   * The folders inside the one open in the panel, by name.
   * @returns Their names; none while the page may not read the folder.
   */
  folders: () => Promise<string[]>;
  /**
   * The folder open in the panel, below the chosen one: where Save writes a
   * new document. Empty for the chosen folder itself.
   * @returns Its path.
   */
  path: () => readonly string[];
  /**
   * Open a folder inside the chosen one, by its path from it.
   * @param path - Its path; empty for the chosen folder itself.
   */
  open: (path: readonly string[]) => void;
  /**
   * Make a folder inside the one open in the panel. Call it from a click.
   * @param name - Its name.
   * @throws {Error} When the name cannot be a folder's, or the page may not
   * write the folder.
   */
  createFolder: (name: string) => Promise<void>;
  /** Forget the folder: Save asks for one again. */
  forget: () => Promise<void>;
  /** Say the folder changed, so lists read it again. */
  changed: () => void;
  /**
   * Be told when the folder or its files change.
   * @returns The function that stops it.
   */
  subscribe: (listener: () => void) => () => void;
}
