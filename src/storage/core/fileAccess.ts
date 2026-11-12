/**
 * Files and folders the page reads and writes in place, where the browser lets
 * it pick one: Chrome and Edge do, through the File System Access API. Firefox
 * and Safari do not, and a page framed by another site may not either, so
 * every caller keeps a way that works without it. Which kinds of file a site
 * offers are its own: it passes them as a `PickerType`.
 */

/** A kind of file a picker offers. */
export interface PickerType {
  /** What the picker calls it. */
  description: string;
  /** Its media types, each with the extensions it is saved under. */
  accept: Record<string, string[]>;
}

/** The pickers, which TypeScript's DOM types do not declare yet. */
interface FilePickers {
  showOpenFilePicker?: (options: {
    id?: string;
    types?: PickerType[];
  }) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (options: {
    id?: string;
    suggestedName?: string;
    types?: PickerType[];
  }) => Promise<FileSystemFileHandle>;
  showDirectoryPicker?: (options: {
    id?: string;
    mode?: 'read' | 'readwrite';
  }) => Promise<FileSystemDirectoryHandle>;
}

/** The permission requests Chromium adds to a handle. */
interface PermissionHandle {
  queryPermission?: (options: {
    mode: 'read' | 'readwrite';
  }) => Promise<string>;
  requestPermission?: (options: {
    mode: 'read' | 'readwrite';
  }) => Promise<string>;
}

// One id, so every picker of a site opens in the folder the last one was in.
const PICKER_ID = 'draw';

// Past this many copies of one name, the moment tells them apart instead.
const MAX_COPIES = 999;

/**
 * Whether the browser has file pickers at all, framed or not: Chrome and Edge
 * do, Firefox and Safari do not.
 * @returns Whether it does.
 */
export function browserPicksFiles(): boolean {
  return typeof pickers().showSaveFilePicker === 'function';
}

/**
 * Whether the browser lets the page write a file the visitor picks.
 * @returns False in Firefox and Safari, and on a page framed by another.
 */
export function canPickFiles(): boolean {
  return !isFramed() && typeof pickers().showSaveFilePicker === 'function';
}

/**
 * Whether the browser lets the page keep its files in a folder the visitor
 * picks.
 * @returns False in Firefox and Safari, and on a page framed by another.
 */
export function canPickFolders(): boolean {
  return !isFramed() && typeof pickers().showDirectoryPicker === 'function';
}

/**
 * Ask where to save a file.
 * @param suggestedName - The name the picker offers.
 * @param type - The kind of file.
 * @returns The file; null when the visitor cancelled; undefined when the
 * browser has no picker, or will not open one here.
 */
export async function chooseSaveFile(
  suggestedName: string,
  type: PickerType,
): Promise<FileSystemFileHandle | null | undefined> {
  const { showSaveFilePicker } = pickers();
  if (typeof showSaveFilePicker !== 'function') return undefined;
  try {
    return await showSaveFilePicker({
      id: PICKER_ID,
      suggestedName,
      types: [type],
    });
  } catch (error) {
    return isCancel(error) ? null : undefined;
  }
}

/**
 * Ask which file to open.
 * @param type - The kinds of file offered.
 * @returns The file; null when the visitor cancelled; undefined when the
 * browser has no picker, or will not open one here.
 */
export async function chooseOpenFile(
  type: PickerType,
): Promise<FileSystemFileHandle | null | undefined> {
  const { showOpenFilePicker } = pickers();
  if (typeof showOpenFilePicker !== 'function') return undefined;
  try {
    const [handle] = await showOpenFilePicker({ id: PICKER_ID, types: [type] });
    return handle ?? null;
  } catch (error) {
    return isCancel(error) ? null : undefined;
  }
}

/**
 * Ask for a folder the page may read and write. Call it from a click or a
 * key: the browser opens its picker only while one lasts.
 * @returns The folder; null when the visitor cancelled; undefined when the
 * browser has no picker, or will not open one here.
 */
export async function chooseFolder(): Promise<
  FileSystemDirectoryHandle | null | undefined
> {
  const { showDirectoryPicker } = pickers();
  if (typeof showDirectoryPicker !== 'function') return undefined;
  try {
    return await showDirectoryPicker({ id: PICKER_ID, mode: 'readwrite' });
  } catch (error) {
    return isCancel(error) ? null : undefined;
  }
}

/**
 * Replace a file's content. The file is opened before the content is made,
 * so a browser asking whether the page may write still sees the key or the
 * click that asked for it.
 * @param handle - The file.
 * @param content - Makes what is written.
 */
export async function writeFile(
  handle: FileSystemFileHandle,
  content: () => Promise<string | Blob>,
): Promise<void> {
  await mayAccess(handle, 'readwrite');
  const stream = await handle.createWritable();
  try {
    await stream.write(await content());
    await stream.close();
  } catch (error) {
    await stream.abort().catch(() => undefined);
    throw error;
  }
}

/**
 * Whether the page may use a file or a folder, asking the visitor when that
 * is not known yet. A handle kept across a reload has lost its permission, and
 * the browser asks again only during a click or a key.
 * @param handle - The file or the folder.
 * @param mode - What the page wants to do with it.
 * @returns Whether it may.
 */
export async function mayAccess(
  handle: FileSystemHandle,
  mode: 'read' | 'readwrite',
): Promise<boolean> {
  const permissions = handle as unknown as PermissionHandle;
  const state = await permissions.queryPermission?.({ mode });
  if (state === undefined || state === 'granted') return true;
  const answer = await permissions.requestPermission?.({ mode });
  return answer === undefined || answer === 'granted';
}

/**
 * Whether the page may already use a file or a folder, without asking.
 * @param handle - The file or the folder.
 * @param mode - What the page wants to do with it.
 * @returns Whether it may.
 */
export async function hasAccess(
  handle: FileSystemHandle,
  mode: 'read' | 'readwrite',
): Promise<boolean> {
  const permissions = handle as unknown as PermissionHandle;
  const state = await permissions.queryPermission?.({ mode });
  return state === undefined || state === 'granted';
}

/**
 * A name no entry of a folder takes yet: the one asked for, else the same
 * followed by ` (2)`, ` (3)`… before its extension, as a download is named.
 * @param folder - The folder.
 * @param stem - The name, before its extension.
 * @param extension - Its extension, e.g. `.write.html`.
 * @returns The name, extension included.
 */
export async function freeFileName(
  folder: FileSystemDirectoryHandle,
  stem: string,
  extension: string,
): Promise<string> {
  for (let copy = 1; copy <= MAX_COPIES; copy++) {
    const name =
      copy === 1 ? `${stem}${extension}` : `${stem} (${copy})${extension}`;
    // eslint-disable-next-line no-await-in-loop -- each name is tried in turn and the first free one wins
    if (!(await holdsEntry(folder, name))) return name;
  }
  return `${stem} ${Date.now()}${extension}`;
}

async function holdsEntry(
  folder: FileSystemDirectoryHandle,
  name: string,
): Promise<boolean> {
  try {
    await folder.getFileHandle(name);
    return true;
  } catch (error) {
    // A folder under that name is not free either.
    return !(error instanceof DOMException && error.name === 'NotFoundError');
  }
}

function pickers(): FilePickers {
  return globalThis as FilePickers;
}

function isFramed(): boolean {
  try {
    return globalThis.top !== globalThis.self;
  } catch {
    return true;
  }
}

function isCancel(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
