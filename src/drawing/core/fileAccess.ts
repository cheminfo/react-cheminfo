/**
 * Files the page reads and writes in place, where the browser lets it pick
 * one: Chrome and Edge do, through the File System Access API. Firefox and
 * Safari do not, and a page framed by another site may not either, so every
 * caller keeps a way that works without it. Which kinds of file a site offers
 * are its own: it passes them as a `PickerType`.
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
}

// One id, so both pickers open in the folder the last one was in.
const PICKER_ID = 'draw';

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
  const { showSaveFilePicker } = globalThis as FilePickers;
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
  const { showOpenFilePicker } = globalThis as FilePickers;
  if (typeof showOpenFilePicker !== 'function') return undefined;
  try {
    const [handle] = await showOpenFilePicker({ id: PICKER_ID, types: [type] });
    return handle ?? null;
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
  await askToWrite(handle);
  const stream = await handle.createWritable();
  try {
    await stream.write(await content());
    await stream.close();
  } catch (error) {
    await stream.abort().catch(() => undefined);
    throw error;
  }
}

/** The permission requests Chromium adds to a file handle. */
interface PermissionHandle {
  queryPermission?: (options: { mode: 'readwrite' }) => Promise<string>;
  requestPermission?: (options: { mode: 'readwrite' }) => Promise<string>;
}

// A handle kept in a draft across a reload has lost its permission: the
// browser asks again, on the key or the click that saves.
async function askToWrite(handle: FileSystemFileHandle): Promise<void> {
  const permissions = handle as unknown as PermissionHandle;
  const state = await permissions.queryPermission?.({ mode: 'readwrite' });
  if (state === undefined || state === 'granted') return;
  await permissions.requestPermission?.({ mode: 'readwrite' });
}

function isCancel(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
